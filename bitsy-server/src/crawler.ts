import URL from "url";
import Crawler from "crawler";

import {EJobStatus, JobInfo, Page} from "./contract/contract";
import {broadcast} from "./web-socket";

const crawler = new Crawler({
    // rateLimit: 100,
    jQuery: 'cheerio',
    retries: 0
});

/**
 * Crawlers by job id
 * Kept after crawler job is done as a memory DB
 */
const jobs = new Map<string, CrawlerJob>();

/**
 * Start a new crawler job
 * @param job The job
 */
export function startCrawler(job: JobInfo) {
    jobs.set(job.id, new CrawlerJob(job));
}

/**
 * Returns a flat list of all the pages of a running or completed job
 * @see getJobPages for a full network graph
 * @param jobId The job id
 */
export function getJobPagesFlat(jobId: string): Page[] | undefined {
    const c = jobs.get(jobId);
    if (!c) {
        console.error("getJobPages: No job with id " + jobId);
        return undefined;
    }


    return Array.from(c.done.values());
}

/**
 * Returns a a network graph of a running or completed job
 * @param jobId The job id
 */
export function getJobPages(jobId: string): Page | undefined {
    const c = jobs.get(jobId);
    if (!c) {
        console.error("getJobPages: No job with id " + jobId);
        return undefined;
    }

    return c.root;
}

/**
 * A personal interpretation of Breadth-first algorithm
 * https://en.wikipedia.org/wiki/Breadth-first_search
 *
 * Final result is a network graph, the same page may be linked to several pages
 * (Flatten is used to stringify\parse the graph over the network)
 *
 * Processing iterations are according to depth
 * Three lists are used:
 * - Queue: Holds pages to be processed in the next iteration
 * - InProcess: Links sent to crawler lib
 * - Done: Results ready for display
 *
 * All lists are Map<K, V> where the key is the page url,
 * They are used to avoid duplicate request for the same page
 */
class CrawlerJob {
    /**
     * Current depth
     */
    depth: number = -1;

    /**
     * Queue of pages to process on the next iteration
     * Key is the page url
     */
    queue = new Map<string, Page>();

    /**
     * Map of Pages currently being processed (with the help of crawler - https://www.npmjs.com/package/crawler)
     * Key is the page url
     */
    inProcess = new Map<string, Page>();

    /**
     * Final - All processed pages end up here
     * Key is the page url
     */
    done = new Map<string, Page>();

    readonly root: Page;

    constructor(public info: JobInfo) {
        this.root = {url: info.request.url, title: "", depth: 0, pages: []};
        this.queue.set(this.root.url, this.root);
        this.startProcessing();
    }

    hasReachedMax(): boolean {
        // Calculate the total (processed,  in-processed and queued)
        const totalPages = this.done.size + this.queue.size + this.inProcess.size;
        return totalPages >= +this.info.request.maxTotalPages;
    }

    queueLink(url: string, parentPage: Page) {
        if (this.hasReachedMax()) {
            // console.info(`hasMaxReached ${this.pages.size + this.queue.size} >= ${this.info.request.maxTotalPages}`);
            return;
        }

        // Avoid queueing duplicate urls (in either processed, to-be processed or queued lists)
        // But add the existing page to the parent page
        const processedPage = this.done.get(url) || this.queue.get(url) || this.inProcess.get(url);
        if (processedPage) {
            parentPage.pages.push(processedPage);
            return;
        }

        const linkedPage = {url: url, title: "IDK", depth: this.depth + 1, pages: []};
        parentPage.pages.push(linkedPage);
        this.queue.set(url, linkedPage);
    }

    pageDone(page: Page) {
        this.inProcess.delete(page.url);

        if (this.done.has(page.url)) {
            console.error("DUPLICATE PAGE!!!", page.url);
        }

        this.done.set(page.url, page);
        this.info.pageCount = this.done.size;
        broadcast(this.info);

        console.log(`Done processing page #${this.info.pageCount} (${this.inProcess.size} pages left for depth ${this.depth})`);

        if (this.inProcess.size === 0) {
            this.startProcessing();
        }
    }

    pageFailed(page: Page) {
        page.title = "ERROR: Failed to load";
        if (page.depth === 0) {
            this.info.status = EJobStatus.Failed;
            broadcast(this.info);
        }
    }

    startProcessing() {
        this.inProcess = this.queue;
        this.queue = new Map<string, Page>();
        this.depth++;

        if (this.depth > this.info.request.maxDepth) {
            this.info.status = EJobStatus.Completed;
            this.info.endTime = Date.now();
            console.log(`Job completed (depth reached) with ${this.done.size} pages - url: ${this.info.request.url}`);
            broadcast(this.info);
            return;
        }

        if (this.inProcess.size === 0) {
            this.info.status = EJobStatus.Completed;
            this.info.endTime = Date.now();
            console.log(`Job completed with ${this.done.size} pages - url: ${this.info.request.url}`);
            broadcast(this.info);
            return;
        }

        console.log(`Starting depth ${this.depth} with ${this.inProcess.size} pages - url: ${this.info.request.url}`);

        this.inProcess.forEach(page => this.startPage(page));
    }

    startPage(page: Page) {
        crawler.queue([{
            uri: page.url,
            callback: (error, res, done) => {
                try {
                    if (error) {
                        console.log(`Got error loading ${page.url}`, error);
                        this.pageFailed(page);
                        this.pageDone(page);
                    } else {
                        this.queueLinks(res.$, page);
                        this.scrapePageMeta(res.$, page);
                        this.pageDone(page);
                    }
                } catch (e) {
                    console.error(`Exception during processing of ${page.url}`, e);
                }

                done();
            }
        }]);
    }

    queueLinks($: cheerio.CheerioAPI, parentPage: Page) {
        try {
            const linkElements = $('a');
            linkElements.each((index, element) => {
                if (element.type === "tag" && element.attribs.href) {
                    const url = URL.resolve(parentPage.url, element.attribs.href);
                    // console.log(url);
                    this.queueLink(url, parentPage);
                }
            });
        } catch (e) {
            console.error("Failed to process links for page " + parentPage.url, e);
        }
    }

    scrapePageMeta($: cheerio.CheerioAPI, page: Page) {
        try {
            const title = $('title');
            page.title = title.text();

            page.meta = [];
            const metaElements = $('meta')
            metaElements.map((index, element) => {
                if (element.type === "tag") {
                    const tuple = {name: element.attribs.name, content: element.attribs.content};
                    page.meta?.push(tuple);
                }
            });
        } catch (e) {
            console.error("Failed to process meta for page " + page.url, e);
        }
    }
}
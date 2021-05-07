/* eslint-disable */

/**
 * A keep-alive endpoint
 */
export const pingApi = "ping";

/**
 * Start a new job
 * POST operation expecting a StartJobRequest object
 * returns the new job's ID
 */
export const startJobApi = "job/start";

/**
 * Payload for the startJob rest API
 */
export type StartJobRequest = {
    url: string;
    maxDepth: number;
    maxTotalPages: number;
}

/**
 * Enum describing the different state of a job
 */
export enum EJobStatus {
    Running,
    Failed,
    Completed
}

/**
 * Information about a running\completed job
 * Use in the listJobs API and the jobs ws notification
 */
export type JobInfo = {
    request: StartJobRequest;
    id: string;
    status: EJobStatus;
    startTime: number;
    endTime: number;
    pageCount: number;
}

/**
 * List info on all jobs
 * returns an array of JobInfo objects
 */
export const listJobsApi = "jobs";

/**
 * Page Information from the scraper
 */
export type Page = {
    url: string;
    title: string;
    depth: number;
    pages: Page[];
    meta?: { name: string, content: string }[];
}

/**
 * List all pages for a job according to it's id
 * TODO: if we require maxPages to be very large (above a few thousands) we need a batching mechanism here
 * returns an array of Page objects
 */
export const listJobPagesApi = "job/:job_id/pages"

/**
 * List all pages for a job according to it's id
 * TODO: if we require maxPages to be very large (above a few thousands) we need a batching mechanism here
 * returns an array of Page objects
 */
export const listJobPagesGraphApi = "job/:job_id/pages/graph"
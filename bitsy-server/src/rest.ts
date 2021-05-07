import express, {Request, Response} from "express";
import * as Flatted from 'flatted';

import {
    listJobPagesApi,
    listJobPagesGraphApi,
    listJobsApi,
    pingApi,
    startJobApi,
    StartJobRequest
} from "./contract/contract";
import {addJob, getJobs} from "./jobs";
import {getJobPages, getJobPagesFlat, startCrawler} from "./crawler";
import {broadcast} from "./web-socket";

const router = express.Router();

const OK = 200;

/**
 * Implementation of all rest api endpoints
 * All endpoint names, req\res models come from the shared contracts "library"
 */
export class RestApi {
    private instanceId = Date.now;

    @Endpoint({method: 'get', path: pingApi})
    ping(req: Request, res: Response) {
        // The instanceId can tells the client if the server was restarted (so it should reconnect ws)
        const resp = {
            status: "I'm here for you!",
            instanceId: this.instanceId
        }
        res.send(resp);
    }

    @Endpoint({method: 'get', path: listJobsApi})
    listJobs(req: Request, res: Response) {
        res.send(getJobs());
    }

    @Endpoint({method: 'post', path: startJobApi})
    startJob(req: Request, res: Response) {
        const jobReq = req.body as StartJobRequest;

        console.log(`Got job request`, jobReq);

        // Basic sanity
        if (!jobReq.url || !jobReq.maxDepth || !jobReq.maxTotalPages) {
            res.status(422).send("Invalid job request parameters");
            return;
        }

        // TODO: check max values

        // Start the job
        const job = addJob(jobReq);

        broadcast(job);
        startCrawler(job);

        // Return the job id (note that the client might receive a push notification before this method returns)
        res.status(OK).send(job.id);
    }

    @Endpoint({method: 'get', path: listJobPagesApi})
    listJobPages(req: Request, res: Response) {
        const jobId = req.params["job_id"];
        const pages = getJobPagesFlat(jobId);
        if (!pages) {
            res.status(404).send("Not found");
            return;
        }

        // Flatted is actually not a must here (just for the network graph)
        res.send(Flatted.stringify(pages));
    }

    @Endpoint({method: 'get', path: listJobPagesGraphApi})
    listJobPagesGraph(req: Request, res: Response) {
        const jobId = req.params["job_id"];
        const pages = getJobPages(jobId);
        if (!pages) {
            res.status(404).send("Not found");
            return;
        }

        res.send(Flatted.stringify(pages));
    }
}

type HttpMethod = 'post' | 'get' | 'put' | 'delete';
type EndpointParams = {
    method: HttpMethod,
    path: string
}

/**
 * Method decorator for adding express endpoints declaratively
 * @param params The Http method and the rest API path (relative)
 */
function Endpoint(params: EndpointParams): any {
    return (target: any, methodName: HttpMethod) => {
        console.log(`Setting up endpoint: ${params.path}`);
        router[params.method]('/' + params.path, target[methodName].bind(target))
    };
}

export function createRestApi(app: express.Application): void {
    const restApi = new RestApi();
    app.use(router);
}
import {Subject} from "rxjs";

import {JobInfo} from "../contract/contract";

export class JobResultsController {
    private static _jobChanged = new Subject<JobInfo>();
    public static jobChanged = JobResultsController._jobChanged.asObservable();

    public static selectJob(job: JobInfo) {
        JobResultsController._jobChanged.next(job);
    }
}
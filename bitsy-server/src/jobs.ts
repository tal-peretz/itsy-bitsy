import {EJobStatus, JobInfo, StartJobRequest} from "./contract/contract";

const jobs = new Map<string, JobInfo>();

var id = 1;
const generateId = (): string => {
    return (id++).toString();
}

export function addJob(request: StartJobRequest): JobInfo {
    const job: JobInfo = {
        id: generateId(),
        startTime: Date.now(),
        endTime: Number.NaN,
        pageCount: 0,
        status: EJobStatus.Running,
        request,
    };

    jobs.set(job.id, job);

    return job;
}

export function getJobs(): JobInfo[] {
    return Array.from(jobs.values());
}

export function createMockData() {
    return;
    addJob({url: "http://tata.com", maxDepth: 3, maxTotalPages: 1000});
    addJob({url: "http://sdfsdf.com", maxDepth: 4, maxTotalPages: 2000});
    addJob({url: "http://25235.com", maxDepth: 5, maxTotalPages: 10000});
    addJob({url: "http://f3fet.com", maxDepth: 6, maxTotalPages: 20000});
}

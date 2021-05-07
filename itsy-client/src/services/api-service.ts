import {Subject} from "rxjs";
import * as Flatted from 'flatted';

import {
    JobInfo,
    listJobPagesApi,
    listJobPagesGraphApi,
    listJobsApi,
    Page,
    pingApi,
    startJobApi,
    StartJobRequest
} from "./../contract/contract";

const headersObject = {
    "Access-Control-Allow-Origin": "*",
    Accept: "*/*"
};

const postJsonHeaders = {
    "Content-Type": "application/json"
};

Object.assign(postJsonHeaders, headersObject);

const baseUrl = "http://localhost:8088/";

export class ApiService {

    private static _jobUpdatedSubject = new Subject<JobInfo>();
    public static JobUpdated = ApiService._jobUpdatedSubject.asObservable();

    public static connectWebSocket() {
        try {
            const exampleSocket = new WebSocket("ws://localhost:8089");
            exampleSocket.onmessage = function (event) {
                console.log("Got an update for job", event.data);

                const job = JSON.parse(event.data);
                ApiService._jobUpdatedSubject.next(job);
            }
        } catch (e) {
            console.error("WebSocket connection failed", e);
        }
    }

    public static async ping(): Promise<boolean> {
        try {
            const res = await fetch(`${baseUrl}${pingApi}`, {
                // const res = await fetch(`${baseUrl}pingApi`, {
                method: 'GET',
                cache: 'no-cache',
                headers: headersObject
            });

            return res.ok;
        } catch (e) {
            console.error("Error pinging server", e);
        }

        return false;
    }

    public static async listJobs(): Promise<JobInfo[]> {
        try {
            const res = await fetch(`${baseUrl}${listJobsApi}`, {
                method: 'GET',
                cache: 'no-cache',
                headers: headersObject
            });

            if (!res.ok) {
                // TODO: Inform the user..
                return [];
            }

            const jobs = await res.json();
            return jobs;
        } catch (e) {
            console.error("Error loading job list", e);
        }

        return [];
    }

    public static async startJob(job: StartJobRequest): Promise<string> {
        try {
            const res = await fetch(`${baseUrl}${startJobApi}`, {
                method: 'POST',
                cache: 'no-cache',
                headers: postJsonHeaders,
                body: JSON.stringify(job)
            });

            if (!res.ok) {
                // TODO: Inform the user..
                return "Error";
            }

            const id = await res.json();
            return id;
        } catch (e) {
            console.error("Error starting job", e);
        }

        return "Error";
    }

    public static async getJobPagesGraph(jobInfo: JobInfo): Promise<Page | undefined> {
        try {
            const restPath = listJobPagesGraphApi.replace(":job_id", jobInfo.id.toString());
            const res = await fetch(`${baseUrl}${restPath}`, {
                method: 'GET',
                cache: 'no-cache',
                headers: headersObject
            });

            if (!res.ok) {
                // TODO: Inform the user..
                return undefined;
            }

            const pagesString = await res.text();
            const pages = Flatted.parse(pagesString);
            return pages;
        } catch (e) {
            console.error("Error loading pages for job " + jobInfo.id, e);
        }

        return undefined;
    }

    public static async getJobPages(jobInfo: JobInfo): Promise<Page[] | undefined> {
        try {
            const restPath = listJobPagesApi.replace(":job_id", jobInfo.id.toString());
            const res = await fetch(`${baseUrl}${restPath}`, {
                method: 'GET',
                cache: 'no-cache',
                headers: headersObject
            });

            if (!res.ok) {
                // TODO: Inform the user..
                return undefined;
            }

            const pagesString = await res.text();
            const pages = Flatted.parse(pagesString);
            return pages;
        } catch (e) {
            console.error("Error loading pages for job " + jobInfo.id, e);
        }

        return undefined;
    }
}
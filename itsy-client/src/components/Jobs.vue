<template>
    <div>
        <h1 v-if="messageToDisplay">{{ messageToDisplay }}</h1>
        <div id="jobs" v-if="!messageToDisplay">
            <div :key="job.id" v-for="job in jobs">
                <Job :job="job"></Job>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Subscription} from "rxjs";
    import {Component, Vue} from 'vue-property-decorator';
    import {ApiService} from "../services/api-service";
    import {JobResultsController} from "../services/job-results-controller";
    import {JobInfo} from "./../contract/contract";
    import Job from "./Job.vue";

    @Component({
        components: {
            Job
        },
        props: {}
    })
    export default class Jobs extends Vue {
        messageToDisplay? = "Loading";
        jobs: JobInfo[] = [];

        private jobsMap = new Map<string, JobInfo>();
        private jobUpdatedSub?: Subscription;

        created() {
            this.init();
        }

        destoyed() {
            this.jobUpdatedSub?.unsubscribe();
        }

        private async init() {
            this.jobUpdatedSub?.unsubscribe();

            await this.loadJobs();

            this.jobUpdatedSub = ApiService.JobUpdated.subscribe(job => this.onJobNotification(job));
        }

        private onJobNotification(job: JobInfo): void {

            // Check if we already have this job
            const jobToUpdate = this.jobsMap.get(job.id);
            if (jobToUpdate) {
                // Update the job
                Object.assign(jobToUpdate, job);
            } else {
                // Add new job
                this.jobs.unshift(job);
                this.jobsMap.set(job.id, job);
                JobResultsController.selectJob(job);
            }

            this.messageToDisplay = undefined;
        }

        private async loadJobs() {
            console.log("loading jobs");
            this.jobsMap.clear();
            this.jobs = await ApiService.listJobs();

            console.log("loaded jobs", this.jobs);

            if (!this.jobs || this.jobs.length === 0) {
                this.messageToDisplay = "No jobs to display";
                return;
            }

            this.jobs.forEach(j => this.jobsMap.set(j.id, j));
            this.messageToDisplay = undefined;
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="css" scoped>
    h1 {
        font-size: 20px;
    }

    #jobs {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
</style>

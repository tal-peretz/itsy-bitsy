<template>
    <b-button
            :type="buttonType"
            @click="clicked"
            class="job-button"
            size="is-large">
        <div class="url-part">{{ job.request.url }}</div>
        <div class="counter-part">Page count: {{ job.pageCount }}</div>
    </b-button>
</template>

<script lang="ts">
    import {Component, Vue, Watch} from 'vue-property-decorator';
    import {JobResultsController} from "../services/job-results-controller";
    import {EJobStatus, JobInfo} from "./../contract/contract";

    const jobStatusMap = new Map<EJobStatus, string>(
        [
            [EJobStatus.Running, "is-primary"],
            [EJobStatus.Completed, "is-success"],
            [EJobStatus.Failed, "is-danger"]
        ]
    );
    @Component({
        props: {
            job: {
                required: true
            }
        }
    })
    export default class OverviewJob extends Vue {
        job?: JobInfo;
        buttonType?: string;

        created() {
            this.setStatus();
        }

        @Watch('job', {deep: true})
        onJobChanged(value: JobInfo, oldValue: JobInfo) {
            this.setStatus();
        }

        setStatus() {
            if (this.job)
                this.buttonType = jobStatusMap.get(this.job.status);
        }

        async clicked() {
            if (this.job) {
                JobResultsController.selectJob(this.job);
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="css" scoped>
    h1 {
        margin: 40px 0 0;
        padding-bottom: 12px;
    }

    .job-button {
        margin: 10px;
        /* padding: 10px; */
    }

    .url-part {
        padding-top: 5px;
    }

    .counter-part {
        margin-bottom: 5px;
        font-size: 13px;
    }

</style>

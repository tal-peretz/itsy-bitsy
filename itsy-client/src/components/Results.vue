<template>
    <wj-flex-grid :itemsSource="pages">
        <wj-flex-grid-column :binding="'url'" :header="'url'" width="2*"/>
        <wj-flex-grid-column :binding="'title'" :header="'title'" width="*"/>
        <wj-flex-grid-detail :maxHeight="maxDetailsHeight"
                             :rowHasDetail="rowHasDetail"
                             detailVisibilityMode="ExpandSingle"
                             v-slot="ctx">
            <wj-flex-grid :isReadOnly="true" :itemsSource="getPages(ctx.item)"
                          headersVisibility="Column">
                <wj-flex-grid-column :binding="'url'" :header="'url'" width="2*"/>
                <wj-flex-grid-column :binding="'title'" :header="'title'" width="*"/>
            </wj-flex-grid>
        </wj-flex-grid-detail>
    </wj-flex-grid>
</template>

<script lang="ts">
    import * as _ from "lodash";
    import {Subscription} from "rxjs";
    import "@grapecity/wijmo.vue2.grid";
    import "@grapecity/wijmo.vue2.grid.detail";
    import {DialogProgrammatic as Dialog} from 'buefy';
    import * as wjcGrid from "@grapecity/wijmo.grid";

    import {Component, Vue} from 'vue-property-decorator';
    import {ApiService} from "../services/api-service";
    import {JobResultsController} from "../services/job-results-controller";
    import {EJobStatus, JobInfo, Page} from "./../contract/contract";

    @Component({})
    export default class Results extends Vue {
        pages?: Page[] = [];
        root?: Page;

        maxDetailsHeight = 250;

        private message?: string = "Select an existing job or run a new one";
        private job?: JobInfo;

        private jobChangedSub?: Subscription;
        private jobUpdatedSub?: Subscription;

        created() {
            this.jobChangedSub = JobResultsController.jobChanged.subscribe(job => this.onJobChanged(job));
            this.jobUpdatedSub = ApiService.JobUpdated.subscribe(job => this.onJobUpdatedDebounced(job));
        }

        destoyed() {
            this.jobChangedSub?.unsubscribe();
            this.jobUpdatedSub?.unsubscribe();
        }

        private async loadResults() {
            this.message = "Loading";

            if (this.job) {
                this.pages = await ApiService.getJobPages(this.job);
            }
        }

        private onJobChanged(job: JobInfo) {
            this.job = job;
            this.loadResults();
        }

        private onJobUpdatedDebounced = _.debounce(this.onJobUpdated.bind(this), 1000, {maxWait: 1500});

        private onJobUpdated(job: JobInfo): void {
            // Make sure this is the current job
            if (job?.id !== this.job?.id) {
                return;
            }

            this.loadResults();
        }

        rowHasDetail(row: wjcGrid.Row) {
            const page = row.dataItem as Page;
            return page.pages.length > 0;
        }

        getPages(page: Page): Page[] {

            if (this.job?.status === EJobStatus.Completed)
                return page?.pages;

            Dialog.alert('Subpages can be viewed after job completes');

            return [];
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="css" scoped>
    h1 {
        margin: 40px 0 0;
        padding-bottom: 12px;
    }

    .wj-flexgrid {
        height: 400px;
        margin: 6px 0;
    }
</style>

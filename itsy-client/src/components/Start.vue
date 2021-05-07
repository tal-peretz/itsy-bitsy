<template>
    <div>
        <h1>{{ msg }}</h1>
        <b-field grouped>

            <!-- TODO: URL validation
            :type="{ 'is-danger': urlInvalidMessage }"
            :message="{ urlInvalidMessage }" -->
            <b-field label="Url" label-position="on-border">
                <b-input
                        maxlength="2048"
                        v-model="url">
                </b-input>
            </b-field>
            <b-field label="Depth" label-position="on-border">
                <b-numberinput
                        :max="20"
                        :min="1"
                        controls-alignment="right"
                        controls-position="compact"
                        type="is-light"
                        v-model="maxDepth">
                </b-numberinput>
            </b-field>
            <b-field label="Max results" label-position="on-border">
                <b-numberinput
                        :max="1000"
                        :min="1"
                        controls-alignment="right"
                        controls-position="compact"
                        exponential
                        step="1"
                        type="is-light"
                        v-model="maxResults">
                </b-numberinput>
            </b-field>
            <b-button
                    :disabled="isDisable(url, maxDepth, maxResults)"
                    type="is-info"
                    v-on:click="start">Start
            </b-button>
        </b-field>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import {ApiService} from "../services/api-service";
    import {StartJobRequest} from "./../contract/contract";

    @Component({})
    export default class StartJob extends Vue {
        msg = "The creepy crawler's companion";

        url: string = "https://www.google.com/";
        maxDepth: number = 3;
        maxResults: number = 100;

        created() {
            this.checkServer();
        }

        private async checkServer() {
            const res = await ApiService.ping();
            console.log("Server is alive? " + res);
        }

        isDisable() {
            const isValidInput =
                this.url &&
                (this.maxDepth > 0 && this.maxDepth <= 20) &&
                (this.maxResults > 10 && this.maxResults <= 1000);

            return !isValidInput;
        }

        start() {
            const req: StartJobRequest = {
                url: this.url,
                maxDepth: this.maxDepth,
                maxTotalPages: this.maxResults
            };

            ApiService.startJob(req);
        }

    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="css" scoped>
    h1 {
        /* margin: 40px 0 0; */
        font-size: 38px;
        padding-bottom: 12px;
    }

</style>

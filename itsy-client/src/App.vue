<template>
    <div id="app">
    <span id="top">
      <!-- <img alt="Spider logo" src="./assets/logo.png"> -->
      <Start/>
    </span>
        <Jobs/>
        <Results/>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import {ApiService} from './services/api-service';
    import Start from './components/Start.vue';
    import Jobs from './components/Jobs.vue';
    import Results from './components/Results.vue';

    @Component({
        components: {
            Start,
            Jobs,
            Results
        },
    })
    export default class App extends Vue {
        created() {
            ApiService.connectWebSocket();
        }
    }
</script>

<style>
    @import '../node_modules/@grapecity/wijmo.styles/wijmo.css';

    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #top {
        margin-left: 10px;
        display: flex;
        flex-direction: row;
        margin-bottom: 10px;
        text-align: center;
    }

    #jobs {
        height: 170px;
        /* width: 80%; */
        overflow: auto;
        /* align-self: center; */
    }

    #results {
        margin: 10px 50px;
    }
</style>

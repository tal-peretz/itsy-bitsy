# itsy-client
Built with vue 2.x, vue/cli and typescript  

## Project setup
Main [package.json](../package.json) postinstall script runs ```npm i```
### Compiles and hot-reloads for development
```
npm run serve
```
Or ```npm run start-client``` from the main [package.json](../package.json)

## Overview
#### [Start component](./src/components/Start.vue)
Top bar with basic form for starting a job
#### [Jobs component](./src/components/Jobs.vue)
A list of all executed jobs  
Updates via ws notifications (new job + status + page count)
#### [Job component](./src/components/Job.vue)
Display of a single job within the Jobs component
#### [Results component](./src/components/Results.vue)
Display results for the currently selected job from the jobs list  
Only a flat list is currently displayed using a virtualized list (wijmo)
#### [API service](./src/services/api-service.ts)
Proxy to the server for both rest and websockets  
All calls to\from the server are expected to go via this gateway
WS notifications are using rxjs observer
#### [JobResults controller](./src/services/job-results-controller.ts)
A simple RXJS subject to facilitate interaction between the Jobs view and the Results view
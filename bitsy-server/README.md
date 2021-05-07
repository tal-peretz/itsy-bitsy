# bitsy-server
Built with nodeJs + express + typescript

## Project setup
Main [package.json](../package.json) postinstall script runs ```npm i```
### Run
```
npm run start-server
```
Or ```npm run start-server``` from the main [package.json](../package.json)

## Overview
#### [rest](./src/rest.ts)
Rest API implementation with simple annotation support
#### [websocket](./src/web-socket.ts)
websocket initialization and broadcasting to all clients
#### [jobs](./src/jobs.ts)
In-mem db for jobs
#### [crawler](./src/crawler.ts)
web crawling, scraping and memory DB  
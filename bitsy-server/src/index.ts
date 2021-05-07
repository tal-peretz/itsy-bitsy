import express from "express";
import * as bp from "body-parser";

import {createMockData} from "./jobs";
import {createWsServer} from "./web-socket";
import {createRestApi} from "./rest";

console.log('Starting bitsy server');

const app = express();
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

createMockData();
createRestApi(app);
createWsServer();

// default port to listen
const port = 8088;
// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
import {execSync} from "child_process";

const chromium = require('chromium');

const homePagePath = `http://localhost:8080`;
const userDataDir = `--user-data-dir="./node_modules/cache/chromium/"`

const chromePath = chromium.path;

const chromeArgs = [
    homePagePath,
    userDataDir,
    "--start-maximized",
    "--no-default-browser-check",
    "--no-crash-upload",
    "--no-first-run",
    "--disable-backgrounding-occluded-windows",
    "--disable-background-timer-throttling",
    "--enable-precise-memory-info",
    "--remote-debugging-port=9222",
    "--disable-web-security",
    "--ignore-certificate-errors",
    "--allow-running-insecure-content",
    "--test-type", // see https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md
    "--disable-sync",
    "--disable-extensions",
    "--disable-breakpad"
].join(' ');

execSync(`${chromePath} ${chromeArgs}`, {
    stdio: 'inherit'
});
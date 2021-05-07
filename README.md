## Getting started

After cloning the repository, type the following in the console:

```
npm i
npm start
```

A browser  will be opened automatically but it will take a few seconds for the client's dev server to go live

---

## Overview
Like many things the solution is divided into three

### [Contracts](./contract/contract.ts)
Shared types and constants for establishing the APIs between server and client  

The contracts are sym-linked into both server and client libs to resolve import issues   

### [Client](./itsy-client/README.md)
Built with vue 2.x, vue/cli and typescript  
### [Server](./bitsy-server/README.md)
Built with nodeJs + express + typescript


---

## TODO

0. Keep the client-server connection alive
1. Production build and runtime support (ports, logs, etc..)
2. Network graph view + realtime updates - 
[Vue D3 Network looks nice](https://github.com/emiliorizzo/) or the professional [yWorks](https://www.yworks.com/products/yfiles/demos)
3. Better form controls - [Quasars'](https://quasar.dev/vue-components/knob) knob is something else!
4. Url validation on the client
5. Job error status - [bug] job status success for a url that does not exist
6. Use Swagger\OpenApi to define the APIs

Pass: UkjWsZ86RQMSrtcGCVfX
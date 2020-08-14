// import {inject, bindable} from 'aurelia-framework';
// import config from 'app-config';
// import {HttpClient, json} from 'aurelia-fetch-client';

// @inject(HttpClient)
// export class NetworkTime {
//     constructor(httpClient) {
//         this.httpClient = httpClient;
//         this.time = null;
//     }

//    getNetworkTime = () => {
//     this.httpClient
//     .fetch(config.packageApiUrls.networkTime, {
//       mode: "cors",
//       method: "get"
//     })
//     .then(resp => {
//       this.processing = false;
//       if (resp.ok) {
//         resp.json().then(time => {
//             console.log('client time', new Date().toUTCString())
//             console.log('server time', time)
//         //   let newTime =  new Date(time)
//           var d = new Date(0);
//           var utcSeconds = time;
//           d.setUTCSeconds(utcSeconds)
//           console.log(d.toUTCString())
//           return d.toUTCString()
//         });
//       }
//     });
//    }
// }
let host = "cn-shanghai.log.aliyuncs.com";
let project = ""; ///自己改
let logstore = ""; ///自己改
let userAgent = require("user-agent");
function getExtraData() {
  return {
    title: document.title,
    url: location.href,
    timestamp: Date.now(),
    userAgent: userAgent.parse(navigator.userAgent).name,
  };
}

class SendTracker {
  constructor() {
    this.url = `http://${project}.${host}/logstores/${logstore}/track`;
    this.xhr = new XMLHttpRequest();
  }
  send(data) {
    this.xhr.open("POST", this.url, true);
    let log = { ...getExtraData(), ...data };
    for (let key in log) {
      if (typeof log[key] === "number") {
        log[key] = `${log[key]}`;
      }
    }
    console.log(log);
    let body = JSON.stringify({
      __logs__: [log],
    });
    this.xhr.setRequestHeader("x-log-apiversion", "0.6.0");
    this.xhr.setRequestHeader("x-log-bodyrawsize", body.length);
    this.xhr.setRequestHeader("Content-Type", "application/json");
    this.xhr.onload = function () {};
    this.xhr.onerror = function (err) {
      console.log(err);
    };
    this.xhr.send(body);
  }
}

export default new SendTracker();

import tracker from "../utils/tracker";
export default function injectXHR() {
  let xhr = window.XMLHttpRequest;
  let open = xhr.prototype.open;
  xhr.prototype.open = function (method, url, async, user, password) {
    if (!url.match(/logstores/) && !url.match(/sockjs/)) {
      //排除上报地址，其他地址加个属性，改写open和send
      this.logData = { method, url, async, user, password };
    }
    return open.apply(this, arguments);
  };
  let send = xhr.prototype.send;
  xhr.prototype.send = function (body) {
    if (this.logData) {
      let startTime = Date.now();
      let handler = (type) => (event) => {
        let duration = Date.now() - startTime;
        let status = this.status;
        let statusText = this.statusText;
        tracker.send({
          kind: "stability",
          type: "xhr",
          eventType: type,
          pathname: this.logData.url,
          status: status + "-" + statusText,
          duration,
          response: this.response ? JSON.stringify(this.response) : "",
          params: body || "",
        });
      };
      this.addEventListener("load", handler("load"), false);
      this.addEventListener("error", handler("error"), false);
      this.addEventListener("abort", handler("abort"), false);
    }
    return send.apply(this, arguments);
  };
}

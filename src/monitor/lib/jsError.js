import getLastEvent from "../utils/getLastEvent";
import getSelector from "../utils/getSelector";
import tracker from "../utils/tracker";
export function injectJsError() {
  window.addEventListener(
    "error",
    function (event) {
      let lastEvent = getLastEvent();
      if (event.target && (event.target.src || event.target.href)) {
        tracker.send({
          kind: "stability", //监控指标大类
          type: "error", //小类型
          errorType: "resourceError", //js执行错误
          filename: event.target.src || event.target.href,
          tagName: event.target.tagName,
          selector: getSelector(event.target),
        });
      } else {
        tracker.send({
          kind: "stability", //监控指标大类
          type: "error", //小类型
          errorType: "jsError", //js执行错误
          message: event.message,
          filename: event.filename,
          position: `${event.lineno}:${event.colno}`,
          stack: getLines(event.error.stack),
          selector: lastEvent ? getSelector(lastEvent.path) : "",
        });
      }
    },
    true
  );
  window.addEventListener(
    "unhandledrejection",
    function (e) {
      let lastEvent = getLastEvent();

      let message;
      let filename;
      let line = 0;
      let column = 0;
      let stack = "";
      let reason = e.reason;
      if (typeof reason === "string") {
        message = reason;
      } else if (typeof reason === "object") {
        message = reason.message;
        if (reason.stack) {
          let matchRes = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
          filename = matchRes[1];
          line = matchRes[2];
          column = matchRes[3];
        }
        stack = getLines(reason.stack);
      }
      tracker.send({
        kind: "stability", //监控指标大类
        type: "error", //小类型
        errorType: "promiseError", //js执行错误
        message,
        filename,
        position: `${line}:${column}`,
        stack,
        selector: lastEvent ? getSelector(lastEvent.path) : "",
      });
    },
    true
  );
  function getLines(stack) {
    return stack
      .split("\n")
      .slice(1)
      .map((item) => item.replace(/^\s+at\s+/g, ""))
      .join("^");
  }
}

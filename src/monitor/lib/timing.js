import tracker from "../utils/tracker";
import onload from "../utils/onload";
import getLastEvent from "../utils/getLastEvent";
import getSelector from "../utils/getSelector";
export default function timing() {
  if (window.PerformanceObserver) {
    let FMP, LCP;
    let p1 = new Promise((res) => {
      new PerformanceObserver((entryList, observer) => {
        let perf = entryList.getEntries();
        FMP = perf[0];
        observer.disconnect();
        res(FMP);
      }).observe({ entryTypes: ["element"] });
    });
    let p2 = new Promise((res) => {
      new PerformanceObserver((entryList, observer) => {
        let perf = entryList.getEntries();
        LCP = perf[0];
        observer.disconnect();
        res(LCP);
      }).observe({ entryTypes: ["largest-contentful-paint"] });
    });
    new Promise((res) => {
      new PerformanceObserver((entryList, observer) => {
        let lastevnet = getLastEvent();
        let perf = entryList.getEntries()[0];
        if (perf) {
          let inputDelay = perf.processingStart - perf.startTime; //这个是输入延迟
          let duration = perf.duration; //处理耗时
          if (inputDelay > 0 || duration > 0) {
            tracker.send({
              kind: "experience",
              type: "fistInputDelay",
              inputDelay,
              duration,
              startTime: perf.startTime,
              selector: lastevnet
                ? getSelector(lastevnet.path || lastevnet.target)
                : "",
            });
          }
        }
        observer.disconnect();
        res(perf);
      }).observe({ type: "first-input", buffered: true }); //第一次交互
    });

    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 100) {
          let lastEvent = getLastEvent();
          requestIdleCallback(() => {
            tracker.send({
              kind: "experience",
              type: "longTask",
              eventType: lastEvent.type,
              startTime: entry.startTime, // 开始时间
              duration: entry.duration, // 持续时间
              selector: lastEvent
                ? getSelector(lastEvent.path || lastEvent.target)
                : "",
            });
          });
        }
      });
    }).observe({ entryTypes: ["longtask"] });

    Promise.all([p1, p2]).then(() => {
      let FP = performance.getEntriesByName("first-paint")[0];
      let FCP = performance.getEntriesByName("first-contentful-paint")[0];
      tracker.send({
        kind: "experience",
        type: "paint",
        firstPaint: FP.startTime,
        firstContentFulPaint: FCP.startTime,
        firstMeaningFulPaint: FMP.startTime,
        largestContentFulPaint: LCP.startTime,
      });
    }); //失败可以被捕捉
  }

  onload(function () {
    setTimeout(() => {
      const {
        fetchStart,
        connectStart,
        connectEnd,
        requestStart,
        responseStart,
        responseEnd,
        domLoading,
        domInteractive,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        loadEventStart,
      } = performance.timing;
      tracker.send({
        kind: "experience",
        type: "timing",
        connectTime: connectEnd - connectStart, //连接时间
        ttfbTime: responseStart - requestStart, //首字节到达时间
        responseTime: responseEnd - responseStart, //响应读取时间
        parseDomTime: loadEventStart - domLoading, //dom解析时间
        //dom完成时间
        domContentLoadedTime:
          domContentLoadedEventEnd - domContentLoadedEventStart,
        timeToInteractive: domInteractive - fetchStart, //首次可交互时间
        loadTime: loadEventStart - fetchStart, //完整加载时间
      });
    }, 3000);
  });
}

import tracker from "../utils/tracker";
import onload from "../utils/onload";
export default function blankscreen() {
  let wrapperElements = ["html", "body", "#container", ".content"]; //需要排除的容器
  let emptyPoints = 0;
  function getSelector(element) {
    if (element.id) {
      return "#" + id;
    } else if (element.className) {
      return (
        "." +
        element.className
          .split(" ")
          .filter((i) => !!i)
          .join(".")
      );
    } else {
      return element.nodeName.toLowerCase();
    }
  }
  function iswrapper(element) {
    let selector = getSelector(element);
    if (wrapperElements.indexOf(selector) != -1) {
      emptyPoints++;
    }
  }
  onload(function () {
    for (let i = 1; i <= 9; i++) {
      let xele = document.elementsFromPoint(
        (window.innerWidth * i) / 10,
        window.innerHeight / 2
      );
      let yele = document.elementsFromPoint(
        window.innerWidth / 2,
        (window.innerHeight * i) / 10
      );
      iswrapper(xele[0]);
      iswrapper(yele[0]);
    }
    if (emptyPoints >= 10) {
      //看空白点个数，需要修改
      let centerElement = document.elementsFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2
      );
      tracker.send({
        kind: "stability",
        type: "blank",
        emptyPoints,
        screen: window.screen.width + "X" + window.screen.height,
        viewPoint: window.innerWidth + "X" + window.innerHeight,
        selector: getSelector(centerElement[0]),
      });
    }
  });
}

export default function (path) {
  if (Array.isArray(path)) {
    return getSelector(path);
  } else {
    let paths = [];
    while (path) {
      paths.push(path);
      path = path.parentNode;
    }
    return getSelector(paths);
  }
}
function getSelector(path) {
  return path
    .reverse()
    .filter((element) => {
      return element !== document && element !== window;
    })
    .map((element) => {
      let selector = "";
      if (element.id) {
        return `${element.nodeName.toLowerCase()}#${element.id}`;
      } else if (element.className && typeof element.className === "string") {
        return `${element.nodeName.toLowerCase()}.${element.className}`;
      } else {
        selector = element.nodeName.toLowerCase();
      }
      return selector;
    })
    .join(" ");
}

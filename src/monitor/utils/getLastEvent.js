let lastEvent;
["click", "touchstart", "mousedown", "keydown"].forEach((eventType) => {
  document.addEventListener(
    eventType,
    (event) => {
      lastEvent = event;
    },
    { capture: true, passive: false }
  );
});

export default function () {
  return lastEvent;
}

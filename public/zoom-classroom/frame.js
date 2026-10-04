/* Zoom runs in an isolated document so its CSS and React runtime do not affect the dashboard. */
(function () {
  "use strict";
  var status = document.getElementById("status");
  var started = false;
  function tell(type) { window.parent.postMessage({ type: type }, window.location.origin); }
  function fail() {
    status.textContent = "Unable to connect. Return to your course to retry, or use Open in Zoom.";
    status.style.display = "block";
    tell("pwd-zoom-error");
  }
  if (window.parent === window || !window.ZoomMtg) { fail(); return; }
  window.addEventListener("message", function (event) {
    if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "pwd-zoom-join" || started) return;
    var data = event.data.payload;
    if (!data || typeof data.signature !== "string" || !/^\d{9,11}$/.test(data.meetingNumber)) { fail(); return; }
    started = true;
    try {
      ZoomMtg.setZoomJSLib("https://source.zoom.us/6.5.0/lib", "/av");
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();
      ZoomMtg.i18n.load("en-US");
      ZoomMtg.i18n.reload("en-US");
      var root = document.getElementById("zmmtg-root");
      if (root) root.style.display = "block";
      ZoomMtg.init({
        leaveUrl: window.location.origin + "/zoom-classroom/left.html",
        disableInvite: true, isSupportAV: true,
        success: function () {
          status.style.display = "none";
          ZoomMtg.join({
            sdkKey: data.sdkKey, signature: data.signature,
            meetingNumber: data.meetingNumber, passWord: data.passWord,
            userName: data.userName,
            success: function () { status.style.display = "none"; },
            error: fail
          });
        },
        error: fail
      });
    } catch (_) { fail(); }
  });
  tell("pwd-zoom-ready");
})();

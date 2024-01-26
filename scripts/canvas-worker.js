importScripts("https://colorjs.io/dist/color.global.js", "okcolor.js", "utils.js", "rendering.js");

var mainColor;
var hueWheel;
var svBox;
var okhsl = false;

function renderEverything() {
    renderHueWheel(hueWheel, mainColor, okhsl);
    renderSVBox(svBox, mainColor, okhsl);
}

onmessage = (evt) => {
    switch (evt.data.action) {
        case "init":
            hueWheel = new CanvasWrapper(evt.data.hueWheel);
            svBox = new CanvasWrapper(evt.data.svBox);
            break;
        case "render":
            var L = evt.data.L;
            var a = evt.data.a;
            var b = evt.data.b;
            mainColor = new Color("oklab", [L, a, b]);
            okhsl = evt.data.okhsl;
            renderEverything();
            break;
    }
    postMessage("done!");
};
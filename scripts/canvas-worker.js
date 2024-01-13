importScripts("https://colorjs.io/dist/color.global.js", "okcolor.js", "utils.js", "rendering.js");

var mainColor;
var queuedColor;
var chromaWheel;
var chromaWheelHandle;
var h, s, v, l;
var isBusy = false;
var hasQueue = false;

function renderEverything() {
    isBusy = true;
    renderChromaWheel(chromaWheel, mainColor);
    renderChromaWheelHandle(chromaWheelHandle, mainColor);
    renderHue(h, mainColor);
    renderSaturation(s, mainColor);
    renderValue(v, mainColor);
    renderLightness(l, mainColor);
    isBusy = false;
    if (hasQueue) {
        mainColor = queuedColor;
        hasQueue = false;
        renderEverything();
    }
}

onmessage = (evt) => {
    switch (evt.data.action) {
        case "init":
            chromaWheel = new CanvasWrapper(evt.data.chromaWheel);
            chromaWheelHandle = new CanvasWrapper(evt.data.chromaWheelHandle);
            h = new CanvasWrapper(evt.data.h);
            s = new CanvasWrapper(evt.data.s);
            v = new CanvasWrapper(evt.data.v);
            l = new CanvasWrapper(evt.data.l);
            break;
        case "render":
            if (isBusy) {
                queuedColor = new Color(evt.data.mainColor);
                hasQueue = true;
            } else {
                isBusy = true;
                mainColor = new Color(evt.data.mainColor);
                renderEverything();
            }
            break;
    }
};
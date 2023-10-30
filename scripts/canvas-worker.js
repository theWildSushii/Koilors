importScripts("https://colorjs.io/dist/color.global.js", "okcolor.js", "utils.js");

var mainColor;
var queuedColor;
var chromaWheel;
var chromaWheelHandle;
var h, s, v, l;
var isBusy = false;
var hasQueue = false;

class CanvasWrapper {

    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d", { colorSpace: "display-p3" });
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

    renderShader(shader) {
        var renderTexture = this.context.createImageData(this.canvas.width, this.canvas.height);
        var dataSizeX = this.canvas.width * 4;
        var dataSizeY = this.canvas.height * 4;

        if ((this.context.getContextAttributes?.().colorSpace === "display-p3")) {
            //Using P3
            for (let i = 0; i < renderTexture.data.length; i += 4) {
                let x = ((i % dataSizeX) / dataSizeX);
                let y = (Math.ceil(i / dataSizeY) / this.canvas.height);
                var color = shader(x, y).to("p3").toGamut({ method: "clip" });
                renderTexture.data[i + 0] = color.p3.r * 255;
                renderTexture.data[i + 1] = color.p3.g * 255;
                renderTexture.data[i + 2] = color.p3.b * 255;
                renderTexture.data[i + 3] = color.alpha * 255;
            }
        } else { //Using sRGB
            for (let i = 0; i < renderTexture.data.length; i += 4) {
                let x = ((i % dataSizeX) / dataSizeX);
                let y = (Math.ceil(i / dataSizeY) / this.canvas.height);
                var color = shader(x, y).to("srgb").toGamut({ method: "clip" });
                renderTexture.data[i + 0] = color.srgb.r * 255;
                renderTexture.data[i + 1] = color.srgb.g * 255;
                renderTexture.data[i + 2] = color.srgb.b * 255;
                renderTexture.data[i + 3] = color.alpha * 255;
            }
        }
        this.context.putImageData(renderTexture, 0, 0);
    }

}

function renderChromaWheel() {
    var okhsl = toOkhsl(mainColor);
    chromaWheel.renderShader(function (x, y) {
        var uv = polarCoordinates(x, 1.0 - y);
        okhsl.h = uv.angle;
        okhsl.s = saturate(uv.radius);
        return fromOkhsl(okhsl);
    });

}

function renderChromaWheelHandle() {
    var okhsl = toOkhsl(mainColor);
    var x = ((okhsl.s * Math.sin(okhsl.h * (2.0 * Math.PI))) + 1.0) / 2.0;
    var y = ((okhsl.s * -Math.cos(okhsl.h * (2.0 * Math.PI))) + 1.0) / 2.0;

    chromaWheelHandle.context.clearRect(0, 0, chromaWheelHandle.width, chromaWheelHandle.height);
    chromaWheelHandle.context.beginPath();
    chromaWheelHandle.context.arc(x * chromaWheelHandle.width, y * chromaWheelHandle.height, 24, 0, 2.0 * Math.PI);
    chromaWheelHandle.context.lineWidth = 4;
    chromaWheelHandle.context.strokeStyle = "#000000";
    chromaWheelHandle.context.stroke();
    chromaWheelHandle.context.fillStyle = mainColor.display();
    chromaWheelHandle.context.fill();
    chromaWheelHandle.context.lineWidth = 2;
    chromaWheelHandle.context.strokeStyle = "#ffffff";
    chromaWheelHandle.context.stroke();
    chromaWheelHandle.context.closePath();
}

function renderHue() {
    var okhsv = toOkhsv(mainColor);
    h.renderShader(function (x, y) {
        okhsv.h = x;
        return fromOkhsv(okhsv);
    });
}

function renderSaturation() {
    var okhsv = toOkhsv(mainColor);
    s.renderShader(function (x, y) {
        okhsv.s = x;
        return fromOkhsv(okhsv);
    });
}

function renderValue() {
    var okhsv = toOkhsv(mainColor);
    v.renderShader(function (x, y) {
        okhsv.v = x;
        return fromOkhsv(okhsv);
    });
}

function renderLightness() {
    var okhsl = toOkhsl(mainColor);
    l.renderShader(function (x, y) {
        okhsl.l = x;
        return fromOkhsl(okhsl);
    });
}

function renderEverything() {
    isBusy = true;
    renderChromaWheel();
    renderChromaWheelHandle();
    renderHue();
    renderSaturation();
    renderValue();
    renderLightness();
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
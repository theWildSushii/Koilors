var chromaWheelCanvas;
var chromaWheelCtx;
var chromaWheelHandleCanvas;
var chromaWheelHandleCtx;
var hCanvas;
var hCtx;
var sCanvas;
var sCtx;
var vCanvas;
var vCtx;
var lCanvas;
var lCtx;

var isUsingChromaWheel = false;

var usingP3 = false;

ready(function () {
    chromaWheelCanvas = document.getElementById("chromaWheel");
    chromaWheelCtx = chromaWheelCanvas.getContext("2d", { colorSpace: "display-p3" });
    chromaWheelHandleCanvas = document.getElementById("chromaWheelHandle");
    chromaWheelHandleCtx = chromaWheelHandleCanvas.getContext("2d", { colorSpace: "display-p3" });
    hCanvas = document.getElementById("h-slider");
    hCtx = hCanvas.getContext("2d", { colorSpace: "display-p3" });
    sCanvas = document.getElementById("s-slider");
    sCtx = sCanvas.getContext("2d", { colorSpace: "display-p3" });
    vCanvas = document.getElementById("v-slider");
    vCtx = vCanvas.getContext("2d", { colorSpace: "display-p3" });
    lCanvas = document.getElementById("l-slider");
    lCtx = lCanvas.getContext("2d", { colorSpace: "display-p3" });
    renderAllPickers();

    chromaWheelHandleCanvas.addEventListener("mousedown", function (e) {
        isUsingChromaWheel = true;
        interactWithChromaWheel(e);
    });

    document.addEventListener("mousemove", function (e) {
        if (isUsingChromaWheel) {
            interactWithChromaWheel(e);
            e.preventDefault();
        }
    });

    document.addEventListener("mouseup", function (e) {
        isUsingChromaWheel = false;
    });

});

function interactWithChromaWheel(e) {
    var point = getMousePos(chromaWheelHandleCanvas, e);
    var uv = polarCoordinates(point[0], 1.0 - point[1]);

    var okhsl = toOkhsl(mainColor);

    okhsl.h = uv.angle;
    okhsl.s = saturate(uv.radius);

    mainColor = fromOkhsl(okhsl);

    renderChromaWheelHandle();
    renderHue();
    renderSaturation();
    renderValue();
    renderLightness();

    onMainColorChanged();
}

function renderChromaWheel() {
    var okhsl = toOkhsl(mainColor);
    renderToCanvas(chromaWheelCanvas, chromaWheelCtx, function (x, y) {
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

    chromaWheelHandleCtx.clearRect(0, 0, chromaWheelHandleCanvas.width, chromaWheelHandleCanvas.height);
    chromaWheelHandleCtx.beginPath();
    chromaWheelHandleCtx.arc(x * chromaWheelHandleCanvas.width, y * chromaWheelHandleCanvas.height, 12, 0, 2.0 * Math.PI);
    chromaWheelHandleCtx.lineWidth = 2;
    chromaWheelHandleCtx.strokeStyle = "#000000";
    chromaWheelHandleCtx.stroke();
    chromaWheelHandleCtx.fillStyle = mainColor.display();
    chromaWheelHandleCtx.fill();
    chromaWheelHandleCtx.lineWidth = 1;
    chromaWheelHandleCtx.strokeStyle = "#ffffff";
    chromaWheelHandleCtx.stroke();
    chromaWheelHandleCtx.closePath();
}

function renderHue() {
    var okhsv = toOkhsv(mainColor);
    renderToCanvas(hCanvas, hCtx, function (x, y) {
        okhsv.h = x;
        return fromOkhsv(okhsv);
    });
}

function renderSaturation() {
    var okhsv = toOkhsv(mainColor);
    renderToCanvas(sCanvas, sCtx, function (x, y) {
        okhsv.s = x;
        return fromOkhsv(okhsv);
    });
}

function renderValue() {
    var okhsv = toOkhsv(mainColor);
    renderToCanvas(vCanvas, vCtx, function (x, y) {
        okhsv.v = x;
        return fromOkhsv(okhsv);
    });
}

function renderLightness() {
    var okhsl = toOkhsl(mainColor);
    renderToCanvas(lCanvas, lCtx, function (x, y) {
        okhsl.l = x;
        return fromOkhsl(okhsl);
    });
}

function renderAllPickers() {
    renderChromaWheel();
    renderChromaWheelHandle();
    renderHue();
    renderSaturation();
    renderValue();
    renderLightness();
}
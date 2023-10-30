var chromaWheelCanvas;
var chromaWheelHandleCanvas;
var hCanvas;
var sCanvas;
var vCanvas;
var lCanvas;

var isUsingChromaWheel = false;

var worker;

ready(function () {
    chromaWheelCanvas = document.getElementById("chromaWheel");
    chromaWheelHandleCanvas = document.getElementById("chromaWheelHandle");
    hCanvas = document.getElementById("h-slider");
    sCanvas = document.getElementById("s-slider");
    vCanvas = document.getElementById("v-slider");
    lCanvas = document.getElementById("l-slider");

    var chromaWheelOff = chromaWheelCanvas.transferControlToOffscreen();
    var chromaWheelHandleOff = chromaWheelHandleCanvas.transferControlToOffscreen();
    var hCanvasOff = hCanvas.transferControlToOffscreen();
    var sCanvasOff = sCanvas.transferControlToOffscreen();
    var vCanvasOff = vCanvas.transferControlToOffscreen();
    var lCanvasOff = lCanvas.transferControlToOffscreen();

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

    worker = new Worker("scripts/canvas-worker.js");
    worker.postMessage({
        action: "init",
        chromaWheel: chromaWheelOff,
        chromaWheelHandle: chromaWheelHandleOff,
        h: hCanvasOff,
        s: sCanvasOff,
        v: vCanvasOff,
        l: lCanvasOff,
    }, [
        chromaWheelOff, chromaWheelHandleOff, hCanvasOff, sCanvasOff, vCanvasOff, lCanvasOff
    ]);

});

function getMousePos(canvas, e) {
    var mouseX = e.offsetX * canvas.width / canvas.clientWidth | 0;
    var mouseY = e.offsetY * canvas.height / canvas.clientHeight | 0;
    return {
        x: saturate(mouseX / canvas.width),
        y: saturate(mouseY / canvas.height)
    };
}

function interactWithChromaWheel(e) {
    var point = getMousePos(chromaWheelHandleCanvas, e);
    var uv = polarCoordinates(point.x, 1.0 - point.y);

    var okhsl = toOkhsl(mainData.mainColor);

    okhsl.h = uv.angle;
    okhsl.s = saturate(uv.radius);

    mainData.mainColor = fromOkhsl(okhsl);
    updateUI();
}

function renderAllPickers() {
    worker.postMessage({
        action: "render",
        mainColor: mainData.mainColor.to("srgb").toGamut({ method: "clip" }).toString({ format: "hex" })
    });
}
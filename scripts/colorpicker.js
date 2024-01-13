var chromaWheelCanvas;
var chromaWheelHandleCanvas;
var hCanvas;
var sCanvas;
var vCanvas;
var lCanvas;

var isUsingChromaWheel = false;

var worker;

var chromaWheel, chromaWheelhandle, h, s, v, l; //CanvasWrappers in case Offscreencanvas is not supported

ready(function () {
    chromaWheelCanvas = document.getElementById("chromaWheel");
    chromaWheelHandleCanvas = document.getElementById("chromaWheelHandle");
    hCanvas = document.getElementById("h-slider");
    sCanvas = document.getElementById("s-slider");
    vCanvas = document.getElementById("v-slider");
    lCanvas = document.getElementById("l-slider");

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

    try {
        worker = new Worker("scripts/canvas-worker.js");
        
        var chromaWheelOff = chromaWheelCanvas.transferControlToOffscreen();
        var chromaWheelHandleOff = chromaWheelHandleCanvas.transferControlToOffscreen();
        var hCanvasOff = hCanvas.transferControlToOffscreen();
        var sCanvasOff = sCanvas.transferControlToOffscreen();
        var vCanvasOff = vCanvas.transferControlToOffscreen();
        var lCanvasOff = lCanvas.transferControlToOffscreen();

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
    } catch (e) {
        chromaWheelCanvas.width = 24;
        chromaWheelCanvas.height = 24;
        chromaWheel = new CanvasWrapper(chromaWheelCanvas);
        chromaWheelHandle = new CanvasWrapper(chromaWheelHandleCanvas);
        h = new CanvasWrapper(hCanvas);
        s = new CanvasWrapper(sCanvas);
        v = new CanvasWrapper(vCanvas);
        l = new CanvasWrapper(lCanvas);
    }

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
    try {
        worker.postMessage({
            action: "render",
            mainColor: mainData.mainColor.to("srgb").toGamut({ method: "clip" }).toString({ format: "hex" })
        });
    } catch (e) {
        renderChromaWheel(chromaWheel, mainData.mainColor);
        renderChromaWheelHandle(chromaWheelHandle, mainData.mainColor);
        renderHue(h, mainData.mainColor);
        renderSaturation(s, mainData.mainColor);
        renderValue(v, mainData.mainColor);
        renderLightness(l, mainData.mainColor);
    }
}
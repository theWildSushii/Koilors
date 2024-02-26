var hueWheelCanvas, hueWheelHandleCanvas;
var svBoxCanvas, svBoxHandleCanvas;

var isUsingHueWheel = false;
var isUsingSVBox = false;

var worker;

var hueWheel, svBox; //CanvasWrappers in case OffscreenCanvas is not supported
var hueWheelHandle, svBoxHandle;

var hasQueue = false;
var isRendering = false;

ready(function () {
    hueWheelCanvas = id("hueWheel");
    hueWheelHandleCanvas = id("hueWheelHandle");
    svBoxCanvas = id("svBox");
    svBoxHandleCanvas = id("svBoxHandle");

    hueWheelHandleCanvas.addEventListener("pointerdown", function (e) {
        if (!e.isPrimary) {
            return;
        }
        isUsingHueWheel = true;
        interactWithHueWheel(e.offsetX, e.offsetY);
    });

    svBoxHandleCanvas.addEventListener("pointerdown", function (e) {
        if (!e.isPrimary) {
            return;
        }
        isUsingSVBox = true;
        interactWithSVBox(e.offsetX, e.offsetY);
    });

    document.addEventListener("pointermove", function (e) {
        if (!e.isPrimary) {
            return;
        }
        if (isUsingHueWheel) {
            var point = getRelativeCoordinates(e.clientX, e.clientY, hueWheelHandleCanvas);
            interactWithHueWheel(e.offsetX, e.offsetY);
            e.preventDefault();
        }
        if (isUsingSVBox) {
            var point = getRelativeCoordinates(e.clientX, e.clientY, svBoxHandleCanvas);
            interactWithSVBox(point.x, point.y);
            e.preventDefault();
        }
    });

    document.addEventListener("pointerup", function (e) {
        if (!e.isPrimary) {
            return;
        }
        isUsingHueWheel = false;
        isUsingSVBox = false;
    });

    try {
        worker = new Worker("scripts/canvas-worker.js");

        worker.onmessage = onWorkerDone;

        var hueWheelOff = hueWheelCanvas.transferControlToOffscreen();
        var svBoxOff = svBoxCanvas.transferControlToOffscreen();

        worker.postMessage({
            action: "init",
            hueWheel: hueWheelOff,
            svBox: svBoxOff,
        }, [
            hueWheelOff, svBoxOff
        ]);
    } catch (e) {
        hueWheelCanvas.width = 36;
        hueWheelCanvas.height = 36;
        hueWheel = new CanvasWrapper(hueWheelCanvas);
        svBox = new CanvasWrapper(svBoxCanvas);
    }
    hueWheelHandle = new CanvasWrapper(hueWheelHandleCanvas);
    svBoxHandle = new CanvasWrapper(svBoxHandleCanvas);

    mainColor.listen((x) => { renderGradients(); });
    generatedColors.listen((x) => { renderHandles(); });
    startL.listen((x) => { renderSVBoxHandles(); });
    endL.listen((x) => { renderSVBoxHandles(); });
    gradientSteps.listen((x) => { renderSVBoxHandles(); });
    isOkhsl.listen((x) => { renderAllPickers(); });
});

function getMousePos(canvas, x, y) {
    var mouseX = x * canvas.width / canvas.clientWidth | 0;
    var mouseY = y * canvas.height / canvas.clientHeight | 0;
    return {
        x: saturate(mouseX / canvas.width),
        y: saturate(mouseY / canvas.height)
    };
}

function getRelativeCoordinates(x, y, element) {
    const rect = element.getBoundingClientRect();
    return {
        x: x - rect.left,
        y: y - rect.top
    };
}

function interactWithHueWheel(x, y) {
    var point = getMousePos(hueWheelHandleCanvas, x, y);
    var uv = polarCoordinates(point.x, 1.0 - point.y);
    if (isOkhsl.value) {
        var okhsl = toOkhsl(mainColor.value);
        okhsl.h = uv.angle;
        mainColor.value = fromOkhsl(okhsl);
    } else {
        var okhsv = toOkhsv(mainColor.value);
        okhsv.h = uv.angle;
        mainColor.value = fromOkhsv(okhsv);
    }
}

function interactWithSVBox(x, y) {
    var point = getMousePos(svBoxHandleCanvas, x, y);
    if (isOkhsl.value) {
        var okhsl = toOkhsl(mainColor.value);
        okhsl.s = clamp(point.x, 0.01, 1.0);
        okhsl.l = clamp(1 - point.y, 0.01, 0.999);
        mainColor.value = fromOkhsl(okhsl);
    } else {
        var okhsv = toOkhsv(mainColor.value);
        okhsv.s = clamp(point.x, 0.01, 1.0);
        okhsv.v = clamp(1 - point.y, 0.01, 1.0);
        mainColor.value = fromOkhsv(okhsv);
    }
}

function onWorkerDone(e) {
    isRendering = false;
    if (hasQueue) {
        hasQueue = false;
        renderAllPickers();
    }
}

function renderHueWheelHandles() {
    hueWheelHandle.clear();
    for (var i = 0; i < generatedColors.value[0].length; i++) {
        renderHueWheelHandle(hueWheelHandle, generatedColors.value[0][i], 0.618, isOkhsl.value);
    }
    renderHueWheelHandle(hueWheelHandle, mainColor.value, 1.0, isOkhsl.value);
}

function renderSVBoxHandles() {
    svBoxHandle.clear();

    for (var i = 0; i < gradientSteps.value; i++) {
        var shade = i / (gradientSteps.value - 1.0);
        renderSVBoxHandle(svBoxHandle, getShade(mainColor.value, L(shade)), 0.618, isOkhsl.value);
    }

    renderSVBoxHandle(svBoxHandle, mainColor.value, 1.0, isOkhsl.value);
}

function renderHandles() {
    renderHueWheelHandles();
    renderSVBoxHandles();
}

function renderGradients() {
    try {
        if (isRendering) {
            hasQueue = true;
            return;
        }
        isRendering = true;
        worker.postMessage({
            action: "render",
            L: mainColor.value.oklab.l,
            a: mainColor.value.oklab.a,
            b: mainColor.value.oklab.b,
            okhsl: isOkhsl.value
        });
    } catch (e) {
        renderHueWheel(hueWheel, mainColor.value, isOkhsl.value);
        renderSVBox(svBox, mainColor.value, isOkhsl.value);
        isRendering = false;
    }
}

function renderAllPickers() {
    renderHandles();
    renderGradients();
}
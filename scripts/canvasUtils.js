function getMousePos(canvas, e) {
    var mouseX = e.offsetX * canvas.width / canvas.clientWidth | 0;
    var mouseY = e.offsetY * canvas.height / canvas.clientHeight | 0;
    return [saturate(mouseX / canvas.width), saturate(mouseY / canvas.height)];
}

function polarCoordinates(u, v) {
    var deltaX = u - 0.5;
    var deltaY = v - 0.5;
    // var radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 2.0;
    // var angle = Math.atan2(deltaX, deltaY) * 1.0 / (2.0 * Math.PI);
    return {
        radius: Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 2.0,
        angle: Math.atan2(deltaX, deltaY) * 1.0 / (2.0 * Math.PI)
    };
    // return [radius, angle];
}

function renderToCanvas(canvas, context, shader) {
    var renderTexture = context.createImageData(canvas.width, canvas.height);
    var dataSizeX = canvas.width * 4;
    var dataSizeY = canvas.height * 4;

    if ((context.getContextAttributes?.().colorSpace === "display-p3")) {
        //Using P3
        for (let i = 0; i < renderTexture.data.length; i += 4) {
            let x = ((i % dataSizeX) / dataSizeX);
            let y = (Math.ceil(i / dataSizeY) / canvas.height);
            var color = shader(x, y).to("p3").toGamut({ method: "clip" });
            // var rgba = shader(x, y);
            renderTexture.data[i + 0] = color.p3.r * 255;
            renderTexture.data[i + 1] = color.p3.g * 255;
            renderTexture.data[i + 2] = color.p3.b * 255;
            renderTexture.data[i + 3] = color.alpha * 255;
        }
    } else { //Using sRGB
        for (let i = 0; i < renderTexture.data.length; i += 4) {
            let x = ((i % dataSizeX) / dataSizeX);
            let y = (Math.ceil(i / dataSizeY) / canvas.height);
            var color = shader(x, y).to("srgb").toGamut({ method: "clip" });
            // var rgba = shader(x, y);
            renderTexture.data[i + 0] = color.srgb.r * 255;
            renderTexture.data[i + 1] = color.srgb.g * 255;
            renderTexture.data[i + 2] = color.srgb.b * 255;
            renderTexture.data[i + 3] = color.alpha * 255;
        }
    }
    context.putImageData(renderTexture, 0, 0);
}
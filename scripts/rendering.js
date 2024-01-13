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

function renderChromaWheel(canvas, mainColor) {
    var okhsl = toOkhsl(mainColor);
    canvas.renderShader(function (x, y) {
        var uv = polarCoordinates(x, 1.0 - y);
        okhsl.h = uv.angle;
        okhsl.s = saturate(uv.radius);
        return fromOkhsl(okhsl);
    });

}

function renderChromaWheelHandle(canvas, mainColor) {
    var okhsl = toOkhsl(mainColor);
    var x = ((okhsl.s * Math.sin(okhsl.h * (2.0 * Math.PI))) + 1.0) / 2.0;
    var y = ((okhsl.s * -Math.cos(okhsl.h * (2.0 * Math.PI))) + 1.0) / 2.0;

    canvas.context.clearRect(0, 0, chromaWheelHandle.width, chromaWheelHandle.height);
    canvas.context.beginPath();
    canvas.context.arc(x * chromaWheelHandle.width, y * chromaWheelHandle.height, 24, 0, 2.0 * Math.PI);
    canvas.context.lineWidth = 4;
    canvas.context.strokeStyle = "#000000";
    canvas.context.stroke();
    canvas.context.fillStyle = mainColor.display();
    canvas.context.fill();
    canvas.context.lineWidth = 2;
    canvas.context.strokeStyle = "#ffffff";
    canvas.context.stroke();
    canvas.context.closePath();
}

function renderHue(canvas, mainColor) {
    var okhsv = toOkhsv(mainColor);
    canvas.renderShader(function (x, y) {
        okhsv.h = x;
        return fromOkhsv(okhsv);
    });
}

function renderSaturation(canvas, mainColor) {
    var okhsv = toOkhsv(mainColor);
    canvas.renderShader(function (x, y) {
        okhsv.s = x;
        return fromOkhsv(okhsv);
    });
}

function renderValue(canvas, mainColor) {
    var okhsv = toOkhsv(mainColor);
    canvas.renderShader(function (x, y) {
        okhsv.v = x;
        return fromOkhsv(okhsv);
    });
}

function renderLightness(canvas, mainColor) {
    var okhsl = toOkhsl(mainColor);
    canvas.renderShader(function (x, y) {
        okhsl.l = x;
        return fromOkhsl(okhsl);
    });
}
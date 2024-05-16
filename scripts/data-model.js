const mainColor = new LiveData(new Color("#a033ee"));
const scheme = new LiveData("mono");
const gradientSteps = new LiveData(9);
const startL = new LiveData(10.0);
const endL = new LiveData(90.0);
const generatedColors = new LiveData([[mainColor.value], [mainColor.value]]);
const selectedColor = new LiveData(new Color("#a033ee"));
const isOkhsl = new LiveData(false);
const customL = new LiveData(50.0);
const uiSaturation = new LiveData(1.0);

var colorLock = false;
var hueLock = false;
var saturationLock = false;
var valueLightnessLock = false;
var gradientSizeLock = false;
var startLLock = false;
var endLLock = false;
var colorSchemeLock = false;
var uiSatLock = false;

function getHash() {
    var code = mainColor.value.to("srgb").toGamut({ method: "clip" }).toString({ format: "hex" });
    code += "/" + scheme.value;
    code += "/" + Math.round(clamp(gradientSteps.value, 3, 21));
    code += "/" + startL.value;
    code += "/" + endL.value;
    code += "/" + (uiSaturation.value * 100.0).toFixed(2);
    return code;
}

function setHash(string) {
    var keywords = string.split("/");
    randomize();
    try {
        mainColor.value = new Color(keywords[0]);
    } catch {
        try {
            mainColor.value = new Color(keywords[0].slice(1));
        } catch { }
    }
    scheme.value = keywords[1] || scheme.value;
    gradientSteps.value = Math.round(Number(keywords[2] || gradientSteps.value));
    startL.value = Number(keywords[3] || startL.value);
    endL.value = Number(keywords[4] || endL.value);
    uiSaturation.value = keywords[5] ? Number(keywords[5]) / 100.0 : uiSaturation.value;
}

function L(l) {
    return clamp(lerp(startL.value, endL.value, l) / 100.0, 0.0, 1.0);
}

const schemes = ["mono", "comp", "anal3", "anal5", "split", "tri", "tetral", "tetrar", "square", "cmpd", "dsc", "poly", "analc"];

function randomize() {
    if (!colorLock) {
        var okhsv = {
            h: Math.random(),
            s: lerp(0.618, 1.0, Math.random()),
            v: lerp(0.75, 1.0, Math.random())
        };
        let newColor = fromOkhsv(okhsv);
        if (isOkhsl.value) {
            let okhsl = toOkhsl(mainColor.value);
            let newOkhsl = toOkhsl(newColor);
            if (hueLock) {
                newOkhsl.h = okhsl.h;
            }
            if (saturationLock) {
                newOkhsl.s = okhsl.s;
            }
            if (valueLightnessLock) {
                newOkhsl.l = okhsl.l;
            }
            mainColor.value = fromOkhsl(newOkhsl);
        } else {
            let okhsv = toOkhsv(mainColor.value);
            let newOkhsv = toOkhsv(newColor);
            if (hueLock) {
                newOkhsv.h = okhsv.h;
            }
            if (saturationLock) {
                newOkhsv.s = okhsv.s;
            }
            if (valueLightnessLock) {
                newOkhsv.v = okhsv.v;
            }
            mainColor.value = fromOkhsv(newOkhsv);
        }
    }
    if (!colorSchemeLock) {
        scheme.value = schemes[Math.floor(Math.pow(Math.random(), 1.618) * schemes.length)];
    }

    if (!uiSatLock) {
        var saturation = lerp(0.85, 1.0, Math.random());
        switch (scheme.value) {
            case "mono": //Monochromatic
                saturation = lerp(0.0, 0.618, Math.random());
                break;
            case "anal3": //Analogous 3
                saturation = lerp(0.382, 1.0, Math.random());
                break;
            case "anal5": //Analogous 5
                saturation = lerp(0.618, 1.0, Math.random());
                break;
        }
        let currentOkhsv = toOkhsv(mainColor.value);
        currentOkhsv.s = 1.0;
        currentOkhsv.v = 1.0;
        var maxChromaLightness = toOkhsl(fromOkhsv(currentOkhsv)).l;
        saturation = lerp(saturation, saturation * 0.382, maxChromaLightness);
        uiSaturation.value = saturation;
    }

    if (!gradientSizeLock) {
        switch (scheme.value) {
            case "mono": //Monochromatic
            case "comp": //Complementary
                gradientSteps.value = Math.round(lerp(3, 11, Math.random()));
                break;
            case "anal3": //Analogous 3
            case "split": //Split Complementary
            case "tri": //Triadic
                gradientSteps.value = Math.random() < 0.618 ? 9 : Math.random() < 0.618 ? 6 : 3;
                break;
            case "square": //Square
            case "tetral": //Tetradic Left
            case "tetrar": //Tetradic Right
            case "cmpd": //Compound
                gradientSteps.value = Math.random() < 0.618 ? 8 : 4;
                break;
            case "anal5": //Analogous 5
            case "dsc": //Double Split Complementary
                gradientSteps.value = Math.random() < 0.618 ? 10 : 5;
                break;
            case "poly": //Polychromatic
            case "analc": //Complementary Analogous
                gradientSteps.value = 6;
                break;
            case "full": //All Colors
                gradientSteps.value = 10
                break;
        }
    }

    var sl = 0.0;
    var el = 1.0;

    sl = spline([
        0.0,
        toOkhsl(generatedColors.value[1][0]).l,
        1.0 / (gradientSteps.value + 1.0)
    ], Math.random());

    el = spline([
        1.0,
        toOkhsl(generatedColors.value[1][generatedColors.value[1].length - 1]).l,
        1.0 - sl
    ], Math.random());

    if (Math.random() <= 0.05) {
        sl = 1.0 - sl;
        el = 1.0 - el;
    }
    if (!startLLock) {
        startL.value = Number((sl * 100.0).toFixed(1));
    }
    if (!endLLock) {
        endL.value = Number((el * 100.0).toFixed(1));
    }

}

ready(function () {
    scheme.listen((value) => {
        switch (value) {
            case "mono": //Monochromatic
                generatedColors.value = [[mainColor.value], [mainColor.value]];
                break;
            case "comp": //Complementary
                generatedColors.value = getComplementaryScheme(mainColor.value);
                break;
            case "anal3": //Analogous 3
                generatedColors.value = getAnalogous3Scheme(mainColor.value);
                break;
            case "split": //Split Complementary
                generatedColors.value = getSplitComplementaryScheme(mainColor.value);
                break;
            case "tri": //Triadic
                generatedColors.value = getTriadicScheme(mainColor.value);
                break;
            case "square": //Square
                generatedColors.value = getSquareScheme(mainColor.value);
                break;
            case "tetral": //Tetradic Left
                generatedColors.value = getTetradicLeftScheme(mainColor.value);
                break;
            case "tetrar": //Tetradic Right
                generatedColors.value = getTetradicRightScheme(mainColor.value);
                break;
            case "cmpd": //Tetradic Right
                generatedColors.value = getCompoundScheme(mainColor.value);
                break;
            case "anal5": //Analogous 5
                generatedColors.value = getAnalogous5Scheme(mainColor.value);
                break;
            case "dsc": //Double Split Complementary
                generatedColors.value = getDoubleSplitComplementaryScheme(mainColor.value);
                break;
            case "poly": //Polychromatic
                generatedColors.value = getPolychromaticScheme(mainColor.value);
                break;
            case "analc": //Complementary Analogous
                generatedColors.value = getComplementaryAnalogous(mainColor.value);
                break;
            case "full": //All Colors
                generatedColors.value = getAllColors(mainColor.value);
                break;
        }
    });

    setHash(window.location.hash);
    selectedColor.value = mainColor.value;
    customL.value = toOkhsl(mainColor.value).l;
    window.addEventListener('hashchange', (e) => {
        setHash(window.location.hash);
    });
});
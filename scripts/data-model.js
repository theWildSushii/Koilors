const mainColor = new LiveData(new Color("#7141ff"));
const scheme = new LiveData("comp");
const gradientSteps = new LiveData(9);
const startL = new LiveData(10.0);
const endL = new LiveData(90.0);
const palette = new LiveData([new Color("#7141ff"), new Color("#fff432")]);
const selectedColor = new LiveData(new Color("#7141ff"));

function getHash() {
    var code = mainColor.value.to("srgb").toGamut({ method: "clip" }).toString({ format: "hex" });
    code += "/" + scheme.value;
    code += "/" + Math.round(gradientSteps.value);
    code += "/" + startL.value;
    code += "/" + endL.value;
    return code;
}

function setHash(string) {
    var keywords = string.split("/");
    randomize();
    try {
        mainColor.value = new Color(keywords[0]);
        scheme.value = keywords[1];
        gradientSteps.value = Math.round(Number(keywords[2]));
        startL.value = Number(keywords[3]);
        endL.value = Number(keywords[4]);
    } catch { }
}

function L(l) {
    return clamp(lerp(startL.value, endL.value, l) / 100.0, 0.0, 1.0);
}

const schemes = ["mono", "comp", "anal3", "split", "tri", "square", "tetral", "tetrar", "anal5", "dsc", "poly", "analc"];

function randomize() {
    var okhsv = {
        h: Math.random(),
        s: lerp(0.618, 1.0, Math.random()),
        v: lerp(0.75, 1.0, Math.random())
    };
    mainColor.value = fromOkhsv(okhsv);
    scheme.value = schemes[Math.floor(Math.random() * schemes.length)];
    switch (scheme.value) {
        case "mono": //Monochromatic
        case "comp": //Complementary
            gradientSteps.value = Math.round(lerp(3, 11, Math.random()));
            break;
        case "anal3": //Analogous 3
        case "split": //Split Complementary
        case "tri": //Triadic
            gradientSteps.value = Math.random() < 0.25 ? 3 : 6;
            break;
        case "square": //Square
        case "tetral": //Tetradic Left
        case "tetrar": //Tetradic Right
            gradientSteps.value = Math.random() < 0.382 ? 4 : 8;
            break;
        case "anal5": //Analogous 5
        case "dsc": //Double Split Complementary
            gradientSteps.value = Math.random() < 0.5 ? 5 : 10;
            break;
        case "poly": //Polychromatic
        case "analc": //Complementary Analogous
            gradientSteps.value = 6;
            break;
        case "full": //All Colors
            gradientSteps.value = 10
            break;
    }
    startL.value = Math.round(100.0 / (gradientSteps.value + 1.0));
    endL.value = Math.round(100.0 - startL.value);
    if (Math.random() <= 0.1) {
        startL.value = 100 - startL.value;
        endL.value = 100 - endL.value;
    }
}

ready(function () {
    scheme.listen((value) => {
        switch (value) {
            case "mono": //Monochromatic
                palette.value = [mainColor.value];
                break;
            case "comp": //Complementary
                palette.value = getComplementaryScheme(mainColor.value);
                break;
            case "anal3": //Analogous 3
                palette.value = getAnalogous3Scheme(mainColor.value);
                break;
            case "split": //Split Complementary
                palette.value = getSplitComplementaryScheme(mainColor.value);
                break;
            case "tri": //Triadic
                palette.value = getTriadicScheme(mainColor.value);
                break;
            case "square": //Square
                palette.value = getSquareScheme(mainColor.value);
                break;
            case "tetral": //Tetradic Left
                palette.value = getTetradicLeftScheme(mainColor.value);
                break;
            case "tetrar": //Tetradic Right
                palette.value = getTetradicRightScheme(mainColor.value);
                break;
            case "anal5": //Analogous 5
                palette.value = getAnalogous5Scheme(mainColor.value);
                break;
            case "dsc": //Double Split Complementary
                palette.value = getDoubleSplitComplementaryScheme(mainColor.value);
                break;
            case "poly": //Polychromatic
                palette.value = getPolychromaticScheme(mainColor.value);
                break;
            case "analc": //Complementary Analogous
                palette.value = getComplementaryAnalogous(mainColor.value);
                break;
            case "full": //All Colors
                palette.value = getAllColors(mainColor.value);
                break;
        }
    });
    setHash(window.location.hash);
    selectedColor.value = mainColor.value;
    window.addEventListener('hashchange', (e) => {
        setHash(window.location.hash);
    });
});
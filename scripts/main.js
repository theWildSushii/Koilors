var mainColor = new Color("#7141ff");
var palette = getComplementaryScheme(mainColor);
var gradientSteps = 5;
var startL = 0.1;
var endL = 0.9;

var colorSchemes = [
    "mono",
    "comp",
    "anal3",
    "split",
    "tri",
    "square",
    "tetral",
    "tetrar",
    // "tones",
    "anal5",
    "dsc",
    "poly",
    "analc",
    "full"
];

var root;

var hexInput;
var hRange;
var hValue;
var sRange;
var sValue;
var vRange;
var vValue;
var lRange;
var lValue;

var schemeSelect;

var colorspaceSelect;

var daynightButton;

var colorsContainer;
var gradientContainer;

var gradientSizeRange;
var gradientSizeText;
var LStartRange;
var LStartText;
var LEndRange;
var LEndText;

var clipboardP;
var copiedText;

ready(function () {
    hexInput = document.getElementById("hex");

    root = document.querySelector(":root");

    hRange = document.getElementById("h-range");
    hValue = document.getElementById("h-value");
    sRange = document.getElementById("s-range");
    sValue = document.getElementById("s-value");
    vRange = document.getElementById("v-range");
    vValue = document.getElementById("v-value");
    lRange = document.getElementById("l-range");
    lValue = document.getElementById("l-value");

    clipboardP = document.getElementById("clipboardP");
    copiedText = document.getElementById("copiedText");

    schemeSelect = document.getElementById("scheme");
    colorspaceSelect = document.getElementById("colorspace");

    daynightButton = document.getElementById("daynight-button");

    colorsContainer = document.getElementById("colors");
    gradientContainer = document.getElementById("gradient");

    gradientSizeRange = document.getElementById("gradientSizeRange");
    gradientSizeText = document.getElementById("gradientSizeText");
    LStartRange = document.getElementById("LStartRange");
    LStartText = document.getElementById("LStartText");
    LEndRange = document.getElementById("LEndRange");
    LEndText = document.getElementById("LEndText");

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        daynightButton.innerHTML = "light_mode";
        root.classList.add("light");
        root.classList.remove("dark");
    } else {
        daynightButton.innerHTML = "dark_mode";
        root.classList.add("dark");
        root.classList.remove("light");
    }

    hexInput.addEventListener("change", function (e) {
        try {
            mainColor = new Color(hexInput.value);
            onMainColorChanged();
            renderAllPickers();
        } catch {
            try {
                mainColor = new Color("#" + hexInput.value);
                onMainColorChanged();
                renderAllPickers();
            } catch { }
        }
    });

    onRangeChange(hRange, onHueChanged);
    hValue.addEventListener("change", onHueChanged);

    onRangeChange(sRange, onSaturationChanged);
    sValue.addEventListener("change", onSaturationChanged);

    onRangeChange(vRange, onValueChanged);
    vValue.addEventListener("change", onValueChanged);

    onRangeChange(lRange, onLightnessChanged);
    lValue.addEventListener("change", onLightnessChanged);

    onRangeChange(gradientSizeRange, onGradientStepsChanged);
    gradientSizeText.addEventListener("change", onGradientStepsChanged);
    onRangeChange(LStartRange, onStartLChanged);
    LStartText.addEventListener("change", onStartLChanged);
    onRangeChange(LEndRange, onEndLChanged);
    LEndText.addEventListener("change", onEndLChanged);

    var keywords = window.location.hash.split("/");
    try {
        mainColor = new Color(keywords[0]);
        schemeSelect.value = keywords[1];
        gradientSteps = Math.round(Number(keywords[2]));
        startL = clamp(Math.round(Number(keywords[3])) / 100.0, 0.004, 0.999);
        endL = clamp(Math.round(Number(keywords[4])) / 100.0, 0.004, 0.999);
        onMainColorChanged();
    } catch {
        randomize();
    }

});

function onHueChanged(e) {
    mainColor = setHue(mainColor, loopDegrees(Number(e.target.value)));
    onMainColorChanged();
    renderChromaWheel();
    renderChromaWheelHandle();
    renderSaturation();
    renderValue();
    renderLightness();
}

function onSaturationChanged(e) {
    mainColor = setSaturation(mainColor, clamp(Number(e.target.value / 100.0), 0.004, 1.0));
    onMainColorChanged();
    renderChromaWheel();
    renderChromaWheelHandle();
    renderHue();
    renderValue();
    renderLightness();
}

function onValueChanged(e) {
    mainColor = setValue(mainColor, clamp(Number(e.target.value / 100.0), 0.004, 1.0));
    onMainColorChanged();
    renderChromaWheel();
    renderHue();
    renderSaturation();
    renderLightness();
}

function onLightnessChanged(e) {
    mainColor = setLightness(mainColor, clamp(Number(e.target.value / 100.0), 0.004, 0.999));
    onMainColorChanged();
    renderChromaWheel();
    renderHue();
    renderSaturation();
}

function onGradientStepsChanged(e) {
    gradientSteps = Number(e.target.value);
    if (e.target == gradientSizeText) {
        gradientSizeRange.value = gradientSteps;
    } else {
        gradientSizeText.value = gradientSteps;
    }
    generateSimpleGradient();
}

function onStartLChanged(e) {
    startL = Number(e.target.value);
    if (e.target == LStartRange) {
        LStartText.value = startL;
    } else {
        LStartRange.value = startL;
    }
    startL = clamp(startL / 100.0, 0.004, 0.999);
    generateSimpleGradient();
}

function onEndLChanged(e) {
    endL = Number(e.target.value);
    if (e.target == LEndRange) {
        LEndText.value = endL;
    } else {
        LEndRange.value = endL;
    }
    endL = clamp(endL / 100.0, 0.004, 0.999);
    generateSimpleGradient();
}

function onMainColorChanged() {

    root.style.setProperty("--mainColor", mainColor.to("oklab").display());
    root.style.setProperty("--onMainColor", mainColor.oklch.l > 0.5 ? "#000000" : "#ffffff");

    var okhsv = toOkhsv(mainColor);
    var okhsl = toOkhsl(mainColor);

    hexInput.value = mainColor.to("srgb").toGamut({ method: "clip" }).toString({ format: "hex" });

    var hue = Math.round(loopDegrees(okhsv.h * 360.0));
    var saturation = Math.round(okhsv.s * 100.0);
    var value = Math.round(okhsv.v * 100.0);
    var lightness = Math.round(okhsl.l * 100.0);

    hRange.value = hue;
    hValue.value = hue;
    sRange.value = saturation;
    sValue.value = saturation;
    vRange.value = value;
    vValue.value = value;
    lRange.value = lightness;
    lValue.value = lightness;

    fillShades("--P", mainColor);

    fillNeutralColors(mainColor);

    var errorColor = {
        h: 27.0 / 360.0,
        s: 1.0,
        l: 0.57
    };
    errorColor.h = getClosestHarmonicHue(hue, errorColor.h * 360.0) / 360.0;
    fillShades("--E", fromOkhsl(errorColor));

    var warningColor = {
        h: 63.0 / 360.0,
        s: 1.0,
        l: 0.73
    };
    warningColor.h = getClosestHarmonicHue(hue, warningColor.h * 360.0) / 360.0;
    fillShades("--W", fromOkhsl(warningColor));

    var successColor = {
        h: 135.0 / 360.0,
        s: 1.0,
        l: 0.87
    };
    successColor.h = getClosestHarmonicHue(hue, successColor.h * 360.0) / 360.0;
    fillShades("--OK", fromOkhsl(successColor));

    onSchemeChanged();

}

function onSchemeChanged() {
    removeChilds(colorsContainer);
    switch (schemeSelect.value) {
        case "mono": //Monochromatic
            palette = [mainColor];
            break;
        case "comp": //Complementary
            palette = getComplementaryScheme(mainColor);
            break;
        case "anal3": //Analogous 3
            palette = getAnalogous3Scheme(mainColor);
            break;
        case "split": //Split Complementary
            palette = getSplitComplementaryScheme(mainColor);
            break;
        case "tri": //Triadic
            palette = getTriadicScheme(mainColor);
            break;
        case "square": //Square
            palette = getSquareScheme(mainColor);
            break;
        case "tetral": //Tetradic Left
            palette = getTetradicLeftScheme(mainColor);
            break;
        case "tetrar": //Tetradic Right
            palette = getTetradicRightScheme(mainColor);
            break;
        // case "tones": //Tones
        //     palette = getTonesScheme(mainColor);
        //     break;
        case "anal5": //Analogous 5
            palette = getAnalogous5Scheme(mainColor);
            break;
        case "dsc": //Double Split Complementary
            palette = getDoubleSplitComplementaryScheme(mainColor);
            break;
        case "poly": //Polychromatic
            palette = getPolychromaticScheme(mainColor);
            break;
        case "analc": //Complementary Analogous
            palette = getComplementaryAnalogous(mainColor);
            break;
        case "full": //All Colors
            palette = getAllColors(mainColor);
            break;
    }

    for (var i = 0; i < palette.length; i++) {
        createShadeDivs(palette[i]);
    }

    generateSimpleGradient();
}

function createShadeDivs(color) {
    var shadesContainer = document.createElement("div");
    colorsContainer.appendChild(shadesContainer);
    var colorDiv = document.createElement("div");
    colorDiv.style.backgroundColor = color.display();
    colorDiv.addEventListener("click", copyBackgroundColorToClipboard);
    shadesContainer.appendChild(colorDiv);
    for (var i = 1; i <= 9; i++) {
        var shade = document.createElement("div");
        shade.style.backgroundColor = getShade(color, i / 10.0).to("oklab").display();
        shade.addEventListener("click", copyBackgroundColorToClipboard);
        shadesContainer.appendChild(shade);
    }
}

function toggleDaynight() {
    if (root.classList.contains("light")) {
        daynightButton.innerHTML = "dark_mode";
        root.classList.add("dark");
        root.classList.remove("light");
    } else {
        daynightButton.innerHTML = "light_mode";
        root.classList.add("light");
        root.classList.remove("dark");
    }
}

function fillShades(prefix, color) {
    for (var i = 0; i <= 100; i += 10) {
        root.style.setProperty(prefix + i, getShade(color, i / 100.0).to("oklab").display());
    }
}

function fillNeutralColors(color) {
    var okhsl = toOkhsl(color);
    okhsl.s *= 0.382;
    var neutralColor = fromOkhsl(okhsl);
    root.style.setProperty("--N4", getShade(neutralColor, 0.04).to("oklab").display());
    root.style.setProperty("--N6", getShade(neutralColor, 0.06).to("oklab").display());
    root.style.setProperty("--N10", getShade(neutralColor, 0.10).to("oklab").display());
    root.style.setProperty("--N12", getShade(neutralColor, 0.12).to("oklab").display());
    root.style.setProperty("--N17", getShade(neutralColor, 0.17).to("oklab").display());
    root.style.setProperty("--N22", getShade(neutralColor, 0.22).to("oklab").display());
    root.style.setProperty("--N24", getShade(neutralColor, 0.24).to("oklab").display());
    root.style.setProperty("--N87", getShade(neutralColor, 0.87).to("oklab").display());
    root.style.setProperty("--N90", getShade(neutralColor, 0.90).to("oklab").display());
    root.style.setProperty("--N92", getShade(neutralColor, 0.92).to("oklab").display());
    root.style.setProperty("--N96", getShade(neutralColor, 0.96).to("oklab").display());
    root.style.setProperty("--N98", getShade(neutralColor, 0.98).to("oklab").display());
    root.style.setProperty("--N100", getShade(neutralColor, 1.0).to("oklab").display());
}

function randomize() {
    var okhsv = {
        h: Math.random(),
        s: lerp(0.618, 1.0, Math.random()),
        v: lerp(0.618, 1.0, Math.random())
    };
    mainColor = fromOkhsv(okhsv);
    schemeSelect.value = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    onMainColorChanged();
    renderAllPickers();
}

function copyBackgroundColorToClipboard(event) {
    var color = new Color(event.target.style.backgroundColor);
    var hex = color.to("srgb").clone().toGamut({ method: "clip" }).toString({ format: "hex" });
    clipboardP.style.display = "block";
    copiedText.innerText = hex;
    copiedText.style.textShadowColor = color.display();
    navigator.clipboard.writeText(hex);
}

function generateSimpleGradient() {

    var code = mainColor.to("srgb").toGamut({ method: "clip" }).toString({ format: "hex" });
    code += "/" + schemeSelect.value;
    code += "/" + Math.round(gradientSteps);
    code += "/" + clamp(Math.round(startL * 100.0), 0, 100);
    code += "/" + clamp(Math.round(endL * 100.0), 0, 100);
    
    history.replaceState(undefined, undefined, code);
    
    removeChilds(gradientContainer);

    if (palette.length == 1) {
        for (var i = 0; i < gradientSteps; i++) {
            var shade = document.createElement("div");
            shade.style.backgroundColor = getShade(palette[0], lerp(startL, endL, i / (gradientSteps - 1))).to("oklab").display();
            shade.addEventListener("click", copyBackgroundColorToClipboard);
            gradientContainer.appendChild(shade);
        }
        return;
    }

    var sortedPalette = sortColors(palette);
    for (var i = 0; i < gradientSteps; i++) {
        var t = i / (gradientSteps - 1);
        var shade = t;
        // var index = remap(t, 0.0, 1.0, 0.0, sortedPalette.length - 1.0)
        // var indexA = Math.floor(index);
        // var indexB = Math.ceil(index);
        // t = remap(t * (sortedPalette.length - 1.0), indexA, indexB, 0.0, 1.0);
        // var color = lerpColor(sortedPalette[indexA], sortedPalette[indexB], t);
        // var color = sortedPalette[Math.round(index)];

        // var color = colorSpline(sortedPalette, shade);
        color = sortedPalette[Math.round(remap(shade, 0.0, 1.0, 0.0, sortedPalette.length - 1))];

        color = getShade(color, lerp(startL, endL, shade));

        var colorDiv = document.createElement("div");
        colorDiv.style.backgroundColor = color.display();
        colorDiv.addEventListener("click", copyBackgroundColorToClipboard);
        gradientContainer.appendChild(colorDiv);
    }
}

function colorSpline(colors, t) {
    if (colors.length == 1) {
        return colors[0];
    }
    if (colors.length == 2) {
        return lerpColor(colors[0], colors[1], t);
    }
    var recursive = [];
    for (var i = 0; i < colors.length - 1; i++) {
        recursive.push(lerpColor(colors[i], colors[i + 1], t));
    }
    return colorSpline(recursive, t);
}

function invertLChanged() {
    invertLightness = invertLButton.checked;
    generateSimpleGradient();
}
const mainData = new DataModel();
var palette = [new Color("#7141ff")];

var root;
var hexInput, hSlider, sSlider, vSlider, lSlider;
var schemeSelect, colorspaceSelect;
var daynightButton;
var colorsContainer, gradientContainer;
var gradientSizeSlider, LStartSlider, LEndSlider;
var clipboardP, copiedText;

ready(function () {
    root = document.querySelector(":root");
    hexInput = document.getElementById("hex");
    hSlider = new TextSlider("h-range", "h-value");
    sSlider = new TextSlider("s-range", "s-value");
    vSlider = new TextSlider("v-range", "v-value");
    lSlider = new TextSlider("l-range", "l-value");

    clipboardP = document.getElementById("clipboardP");
    copiedText = document.getElementById("copiedText");

    schemeSelect = document.getElementById("scheme");

    daynightButton = document.getElementById("daynight-button");

    colorsContainer = document.getElementById("colors");
    gradientContainer = document.getElementById("gradient");

    gradientSizeSlider = new TextSlider("gradientSizeRange", "gradientSizeText");
    LStartSlider = new TextSlider("LStartRange", "LStartText");
    LEndSlider = new TextSlider("LEndRange", "LEndText");

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        daynightButton.innerHTML = "light_mode";
        root.classList.add("light");
        root.classList.remove("dark");
    } else {
        daynightButton.innerHTML = "dark_mode";
        root.classList.add("dark");
        root.classList.remove("light");
    }

    hexInput.addEventListener("change", onHexChanged);

    hSlider.addListener(onHueChanged);
    sSlider.addListener(onSaturationChanged);
    vSlider.addListener(onValueChanged);
    lSlider.addListener(onLightnessChanged);
    gradientSizeSlider.addListener(onGradientStepsChanged);
    LStartSlider.addListener(onStartLChanged);
    LEndSlider.addListener(onEndLChanged);

    mainData.string = window.location.hash;

    window.addEventListener('hashchange', onHashChanged);

    updateUI();
});

function updateUI() {
    renderAllPickers();
    onMainColorChanged();
    generateBasePalette();
    generateSimplePalette();
    generateFullPalette();
    schemeSelect.value = mainData.scheme;
    gradientSizeSlider.value = mainData.gradientSteps;
    LStartSlider.value = mainData.startL;
    LEndSlider.value = mainData.endL;
    history.replaceState(undefined, undefined, mainData.string);
}

function onMainColorChanged() {

    root.style.setProperty("--mainColor", mainData.mainColor.to("oklab").display());
    root.style.setProperty("--onMainColor", mainData.mainColor.oklch.l > 0.5 ? "#000000" : "#ffffff");

    var okhsv = toOkhsv(mainData.mainColor);
    var okhsl = toOkhsl(mainData.mainColor);

    hexInput.value = mainData.mainColor.to("srgb").toGamut({ method: "clip" }).toString({ format: "hex" });

    var hue = Number(stepValue(loopDegrees(okhsv.h * 360.0), 0.36).toFixed(2));
    var saturation = Number(stepValue(okhsv.s * 100.0, 0.1).toFixed(2));
    var value = Number(stepValue(okhsv.v * 100.0, 0.1).toFixed(2));
    var lightness = Number(stepValue(okhsl.l * 100.0, 0.1).toFixed(2));

    hSlider.value = hue;
    sSlider.value = saturation;
    vSlider.value = value;
    lSlider.value = lightness;

    fillShades("--P", mainData.mainColor);

    fillNeutralColors(mainData.mainColor);

    var errorColor = {
        h: 27.0 / 360.0,
        s: 1.0,
        v: 1.0
    };
    errorColor.h = getClosestHarmonicHue(hue, errorColor.h * 360.0) / 360.0;
    fillShades("--E", fromOkhsv(errorColor));

    var warningColor = {
        h: 63.0 / 360.0,
        s: 1.0,
        v: 1.0
    };
    warningColor.h = getClosestHarmonicHue(hue, warningColor.h * 360.0) / 360.0;
    fillShades("--W", fromOkhsv(warningColor));

    var successColor = {
        h: 135.0 / 360.0,
        s: 1.0,
        v: 1.0
    };
    successColor.h = getClosestHarmonicHue(hue, successColor.h * 360.0) / 360.0;
    fillShades("--OK", fromOkhsv(successColor));
}

function generateBasePalette() {
    switch (mainData.scheme) {
        case "mono": //Monochromatic
            palette = [mainData.mainColor];
            break;
        case "comp": //Complementary
            palette = getComplementaryScheme(mainData.mainColor);
            break;
        case "anal3": //Analogous 3
            palette = getAnalogous3Scheme(mainData.mainColor);
            break;
        case "split": //Split Complementary
            palette = getSplitComplementaryScheme(mainData.mainColor);
            break;
        case "tri": //Triadic
            palette = getTriadicScheme(mainData.mainColor);
            break;
        case "square": //Square
            palette = getSquareScheme(mainData.mainColor);
            break;
        case "tetral": //Tetradic Left
            palette = getTetradicLeftScheme(mainData.mainColor);
            break;
        case "tetrar": //Tetradic Right
            palette = getTetradicRightScheme(mainData.mainColor);
            break;
        case "anal5": //Analogous 5
            palette = getAnalogous5Scheme(mainData.mainColor);
            break;
        case "dsc": //Double Split Complementary
            palette = getDoubleSplitComplementaryScheme(mainData.mainColor);
            break;
        case "poly": //Polychromatic
            palette = getPolychromaticScheme(mainData.mainColor);
            break;
        case "analc": //Complementary Analogous
            palette = getComplementaryAnalogous(mainData.mainColor);
            break;
        case "full": //All Colors
            palette = getAllColors(mainData.mainColor);
            break;
    }
}

function createShadeDivs(color) {
    var shadesContainer = document.createElement("div");
    colorsContainer.appendChild(shadesContainer);
    var colorDiv = document.createElement("div");
    colorDiv.style.backgroundColor = color.display();
    colorDiv.addEventListener("click", copyBackgroundColorToClipboard);
    shadesContainer.appendChild(colorDiv);
    for (var i = 0; i < mainData.gradientSteps; i++) {
        var shade = i / (mainData.gradientSteps - 1.0);
        var shadeDiv = document.createElement("div");
        shadeDiv.style.backgroundColor = getShade(color, mainData.L(shade)).to("oklab").display();
        shadeDiv.addEventListener("click", copyBackgroundColorToClipboard);
        shadesContainer.appendChild(shadeDiv);
    }
}

function generateFullPalette() {
    removeChilds(colorsContainer);
    for (var i = 0; i < palette.length; i++) {
        createShadeDivs(palette[i]);
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

function fillNeutralColors() {
    var okhsl = toOkhsl(mainData.mainColor);
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

function generateSimplePalette() {

    removeChilds(gradientContainer);

    if (palette.length == 1) {
        for (var i = 0; i < mainData.gradientSteps; i++) {
            var shade = document.createElement("div");
            shade.style.backgroundColor = getShade(palette[0], mainData.L(i / (mainData.gradientSteps - 1))).to("oklab").display();
            shade.addEventListener("click", copyBackgroundColorToClipboard);
            gradientContainer.appendChild(shade);
        }
        return;
    }

    var sortedPalette = sortColors(palette);
    for (var i = 0; i < mainData.gradientSteps; i++) {

        var shade = i / (mainData.gradientSteps - 1.0);
        var index = remap(i, 0.0, mainData.gradientSteps - 1.0, 0.0, sortedPalette.length - 1);

        var color = sortedPalette[Math.round(index)];
        var colorA = sortedPalette[Math.floor(index)];
        var colorB = sortedPalette[Math.ceil(index)];

        var color = colorSpline([colorA, color, colorB], index % 1);

        color = getShade(color, mainData.L(shade));

        var colorDiv = document.createElement("div");
        colorDiv.style.backgroundColor = color.display();
        colorDiv.addEventListener("click", copyBackgroundColorToClipboard);
        gradientContainer.appendChild(colorDiv);
    }
}
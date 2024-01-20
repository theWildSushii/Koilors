var root;
var colorInput, hueInput, saturationInput, valueInput, lightnessSlider;
var gradientSizeSlider, startLSlider, endLSlider, colorSchemeSelect;
var baseColorsDiv, generatedShadesDiv, individualShadesSection;
var daynightButton, snackbar, colorsTab, detailsTab;
var selectedColorDiv;
var hex, srgb, oklab, oklch, lab, lch, hsv, hsl, hwb, displayP3, rec2020;

function toggleDaynight() {
    if (root.classList.contains("light")) {
        daynightButton.innerText = "dark_mode";
        root.classList.add("dark");
        root.classList.remove("light");
    } else {
        daynightButton.innerText = "light_mode";
        root.classList.add("light");
        root.classList.remove("dark");
    }
}

function copyFrom(elementId) {
    var element = id(elementId);
    var range = document.createRange();
    var selection = window.getSelection();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    try {
        navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
            if (result.state === "granted" || result.state === "prompt") {
                navigator.clipboard.writeText(element.innerText).then(
                    () => {
                        /* clipboard successfully set */
                        showSnackbar("Copied: " + element.innerText);
                    },
                    () => {
                        /* clipboard write failed */
                        document.execCommand("copy");
                        showSnackbar("Copied: " + element.innerText);
                    },
                );
            } else {
                document.execCommand("copy");
                showSnackbar("Copied: " + element.innerText);
            }
        });
    } catch {
        document.execCommand("copy");
        showSnackbar("Copied: " + element.innerText);
    }
}

var snackbarTimerId;
function showSnackbar(text) {
    snackbar.innerText = text;
    if (snackbar.classList.contains("open")) {
        clearTimeout(snackbarTimerId);
    }
    snackbar.classList.add("open");
    snackbarTimerId = setTimeout(function () {
        snackbar.classList.remove("open");
    }, 3141);
}

ready(function () {
    root = document.querySelector(":root");
    colorInput = id("colorInput");
    hueInput = id("hue");
    saturationInput = id("saturation");
    valueInput = id("value");
    colorSchemeSelect = id("colorScheme");
    baseColorsDiv = id("baseColors");
    generatedShadesDiv = id("generatedShades");
    individualShadesSection = id("individualShades");
    daynightButton = id("daynight-button");
    colorsTab = id("colorsTab");
    detailsTab = id("detailsTab");
    snackbar = id("snackbar");
    selectedColorDiv = id("selectedColor");
    hex = id("hex");
    srgb = id("srgb");
    oklab = id("oklab");
    oklch = id("oklch");
    lab = id("lab");
    lch = id("lch");
    hsv = id("hsv");
    hsl = id("hsl");
    hwb = id("hwb");
    hexP3 = id("hex-display-p3");
    displayP3 = id("display-p3");
    rec2020 = id("rec2020");
    lightnessSlider = new TextSlider("lightnessRange", "lightnessText");
    gradientSizeSlider = new TextSlider("gradientSizeRange", "gradientSizeText");
    startLSlider = new TextSlider("LStartRange", "LStartText");
    endLSlider = new TextSlider("LEndRange", "LEndText");

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        daynightButton.innerHTML = "light_mode";
        root.classList.add("light");
        root.classList.remove("dark");
    } else {
        daynightButton.innerHTML = "dark_mode";
        root.classList.add("dark");
        root.classList.remove("light");
    }

    root.style.setProperty("--gray", (fromOkhsl({ h: 0.5, s: 0.0, l: 0.5 })).to("oklab").display());


    // var colorInput, hueInput, saturationInput, valueInput, lightnessSlider;
    // var gradientSizeSlider, startLSlider, endLSlider, colorSchemeSelect;

    addChangeListener(colorInput, (e) => {
        try {
            mainColor.value = new Color(colorInput.value);
        } catch {
            try {
                mainColor.value = new Color("#" + colorInput.value);
            } catch { }
        }
    });

    addChangeListener(hueInput, (e) => {
        mainColor.value = setHue(mainColor.value, hueInput.value);
    });

    addChangeListener(saturationInput, (e) => {
        mainColor.value = setSaturation(mainColor.value, clamp(saturationInput.value / 100.0, 0.05, 0.999));
    });

    addChangeListener(valueInput, (e) => {
        mainColor.value = setValue(mainColor.value, clamp(valueInput.value / 100.0, 0.05, 0.999));
    });

    lightnessSlider.addListener((e) => {
        mainColor.value = setLightness(mainColor.value, clamp(lightnessSlider.value / 100.0, 0.09, 0.999));
    });

    gradientSizeSlider.addListener((e) => {
        gradientSteps.value = gradientSizeSlider.value;
    });

    startLSlider.addListener((e) => {
        startL.value = startLSlider.value;
    });

    endLSlider.addListener((e) => {
        endL.value = endLSlider.value;
    });

    colorSchemeSelect.addEventListener("change", (e) => {
        scheme.value = colorSchemeSelect.value;
    });

    mainColor.listen((color) => {
        var okhsv = toOkhsv(color);
        var okhsl = toOkhsl(color);
        root.style.setProperty("--mainColor", color.to("oklab").display());
        root.style.setProperty("--onMainColor", color.oklch.l > 0.5 ? "#000000" : "#ffffff");
        colorInput.value = color.to("srgb").toGamut({ method: "clip" }).toString({ format: "hex" });
        hueInput.value = Number(stepValue(loopDegrees(okhsv.h * 360.0), 0.36).toFixed(2));
        saturationInput.value = Number(stepValue(okhsv.s * 100.0, 0.1).toFixed(2));
        valueInput.value = Number(stepValue(okhsv.v * 100.0, 0.1).toFixed(2));
        lightnessSlider.value = Number(stepValue(okhsl.l * 100.0, 0.1).toFixed(2));

        for (var i = 0; i <= 100; i += 10) {
            root.style.setProperty("--P" + i, getShade(color, i / 100.0).to("oklab").display());
        }
        okhsl.s *= 0.382;
        var neutralColor = fromOkhsl(okhsl);
        root.style.setProperty("--N2", getShade(neutralColor, 0.02).to("oklab").display());
        root.style.setProperty("--N4", getShade(neutralColor, 0.04).to("oklab").display());
        root.style.setProperty("--N6", getShade(neutralColor, 0.06).to("oklab").display());
        root.style.setProperty("--N10", getShade(neutralColor, 0.10).to("oklab").display());
        root.style.setProperty("--N12", getShade(neutralColor, 0.12).to("oklab").display());
        root.style.setProperty("--N13", getShade(neutralColor, 0.13).to("oklab").display());
        root.style.setProperty("--N17", getShade(neutralColor, 0.17).to("oklab").display());
        root.style.setProperty("--N22", getShade(neutralColor, 0.22).to("oklab").display());
        root.style.setProperty("--N24", getShade(neutralColor, 0.24).to("oklab").display());
        root.style.setProperty("--N87", getShade(neutralColor, 0.87).to("oklab").display());
        root.style.setProperty("--N90", getShade(neutralColor, 0.90).to("oklab").display());
        root.style.setProperty("--N92", getShade(neutralColor, 0.92).to("oklab").display());
        root.style.setProperty("--N96", getShade(neutralColor, 0.96).to("oklab").display());
        root.style.setProperty("--N98", getShade(neutralColor, 0.98).to("oklab").display());
        root.style.setProperty("--N100", getShade(neutralColor, 1.0).to("oklab").display());

        updateHash();

        scheme.notifyListeners();

    });

    scheme.listen((value) => {
        colorSchemeSelect.value = value;
        updateHash();
    });

    gradientSteps.listen((value) => {
        gradientSizeSlider.value = value;
        updateHash();
        updateColors();
    });

    startL.listen((value) => {
        startLSlider.value = value;
        updateHash();
        updateColors();
    });

    endL.listen((value) => {
        endLSlider.value = value;
        updateHash();
        updateColors();
    });

    palette.listen((value) => {
        updateColors();
    });

    selectedColor.listen((value) => {
        detailsTab.checked = true;
        selectedColorDiv.style.backgroundColor = value.display();
        hex.innerText = value.to("srgb").toGamut({ method: "clip" }).toString({ format: "hex" });
        srgb.innerText = value.to("srgb").toGamut({ method: "clip" }).toString({
            format: {
                name: "rgb",
                coords: [
                    "<number>[0, 255]",
                    "<number>[0, 255]",
                    "<number>[0, 255]"
                ]
            }
        });
        oklab.innerText = value.to("oklab").toString();
        oklch.innerText = value.to("oklch").toString();
        lab.innerText = value.to("lab").toString();
        lch.innerText = value.to("lch").toString();
        hsv.innerText = value.to("hsv").toGamut({ method: "clip" }).toString({ format: "hsv" });
        hsl.innerText = value.to("hsl").toGamut({ method: "clip" }).toString({ format: "hsl" });
        hwb.innerText = value.to("hwb").toGamut({ method: "clip" }).toString({ format: "hwb" });
        displayP3.innerText = value.to("p3").toGamut({ method: "clip" }).toString();
        rec2020.innerText = value.to("rec2020").toGamut({ method: "clip" }).toString();
    });

    colorsTab.checked = true;

});

var isUpdatingColors = false;
function updateColors() {
    if (isUpdatingColors) {
        return;
    }
    isUpdatingColors = true;
    // var baseColorsDiv, generatedShadesDiv, individualShadesSection;
    setTimeout(function () {
        removeChilds(baseColorsDiv);
        removeChilds(generatedShadesDiv);
        removeChilds(individualShadesSection);

        palette.value.forEach(color => {
            var div = document.createElement("div");
            div.style.backgroundColor = color.display();
            div.addEventListener("click", selectBackgroundColor);
            baseColorsDiv.appendChild(div);

            var parentDiv = document.createElement("div");
            for (var i = 0; i < gradientSteps.value; i++) {
                var shade = i / (gradientSteps.value - 1.0);

                var shadedColor = getShade(color, L(shade));

                var shadeDiv = document.createElement("div");
                shadeDiv.style.backgroundColor = shadedColor.display();
                shadeDiv.addEventListener("click", selectBackgroundColor);
                parentDiv.appendChild(shadeDiv);
            }
            individualShadesSection.appendChild(parentDiv);

        });

        var sortedPalette = sortColors(palette.value);
        for (var i = 0; i < gradientSteps.value; i++) {
            var shade = i / (gradientSteps.value - 1.0);
            var index = remap(i, 0.0, gradientSteps.value - 1.0, 0.0, sortedPalette.length - 1);

            var colorA = sortedPalette[Math.floor(index)];
            var colorB = sortedPalette[Math.round(index)];
            var colorC = sortedPalette[Math.ceil(index)];

            var color = colorSpline([colorA, colorB, colorC], index % 1);
            color = getShade(color, L(shade));

            var div = document.createElement("div");
            div.style.backgroundColor = color.display();
            div.addEventListener("click", selectBackgroundColor);
            generatedShadesDiv.appendChild(div);
        }

        isUpdatingColors = false;
    });
}

function selectBackgroundColor(e) {
    selectedColor.value = new Color(e.target.style.backgroundColor);
}

var isUpdatingHash = false;
function updateHash() {
    if (isUpdatingHash) {
        return;
    }
    isUpdatingHash = true;
    setTimeout(function () {
        history.replaceState(undefined, undefined, getHash());
        isUpdatingHash = false;
    });
}
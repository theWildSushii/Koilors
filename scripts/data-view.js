var root;
var colorInput, hueInput, saturationInput, valueInput;
var gradientSizeSlider, startLSlider, endLSlider, colorSchemeSelect;
var baseColorsDiv, generatedShadesDiv, individualShadesSection;
var daynightButton, snackbar, colorsTab, detailsTab;
var selectedColorDiv;
var hex, srgb, oklab, oklch, lab, lch, hsv, hsl, hwb, displayP3, rec2020;
var okhslCheckBox, valueLightnessLabel;
var uiSatSlider;
var colorsCss;
var palette = [];
var sortedPalette = [];
var discreteMix = true;
var invertedLightness = new LiveData(false);

function toggleDaynight() {
    isLightMode.value = !isLightMode.value;
}

function copyFrom(elementId, customMessage) {
    var element = id(elementId);
    if (!element.innerText) {
        return;
    }
    if (!customMessage) {
        copyFrom(elementId, "Copied: " + element.innerText);
        return;
    }
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
                        showSnackbar(customMessage);
                    },
                    () => {
                        /* clipboard write failed */
                        document.execCommand("copy");
                        showSnackbar(customMessage);
                    },
                );
            } else {
                document.execCommand("copy");
                showSnackbar(customMessage);
            }
        });
    } catch {
        document.execCommand("copy");
        showSnackbar(customMessage);
    }
}

function downloadInto(element, path) {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        element.innerText = this.responseText;
    }
    xhttp.open("GET", path, true);
    xhttp.send();
}

function downloadFromElement(filename, elementId) {
    var from = id(elementId);
    if (!from.innerText) {
        return;
    }
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(from.innerText));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
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
    gradientSizeSlider = new TextSlider("gradientSizeRange", "gradientSizeText");
    startLSlider = new TextSlider("LStartRange", "LStartText");
    endLSlider = new TextSlider("LEndRange", "LEndText");
    okhslCheckBox = id("okhsl");
    valueLightnessLabel = id("valuelightness");
    colorsCss = id("colors-css");
    uiSatSlider = new TextSlider("uisatRange", "uisatText");

    downloadInto(id("light-css"), "styles/roles-light.css");
    downloadInto(id("dark-css"), "styles/roles-dark.css");

    root.style.setProperty("--gray", (fromOkhsl({ h: 0.5, s: 0.0, l: 0.5 })).to("oklab").display());

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
        if (isOkhsl.value) {
            var okhsl = toOkhsl(mainColor.value);
            okhsl.h = hueInput.value / 360.0;
            mainColor.value = fromOkhsl(okhsl);
        } else {
            var okhsv = toOkhsv(mainColor.value);
            okhsv.h = hueInput.value / 360.0;
            mainColor.value = fromOkhsv(okhsv);
        }
    });

    addChangeListener(saturationInput, (e) => {
        if (isOkhsl.value) {
            var okhsl = toOkhsl(mainColor.value);
            okhsl.s = clamp(saturationInput.value / 100.0, 0.05, 0.999);
            mainColor.value = fromOkhsl(okhsl);
        } else {
            var okhsv = toOkhsv(mainColor.value);
            okhsv.s = clamp(saturationInput.value / 100.0, 0.05, 0.999);
            mainColor.value = fromOkhsv(okhsv);
        }
    });

    addChangeListener(valueInput, (e) => {
        if (isOkhsl.value) {
            var okhsl = toOkhsl(mainColor.value);
            okhsl.l = clamp(valueInput.value / 100.0, 0.05, 0.999);
            mainColor.value = fromOkhsl(okhsl);
        } else {
            var okhsv = toOkhsv(mainColor.value);
            okhsv.v = clamp(valueInput.value / 100.0, 0.05, 0.999);
            mainColor.value = fromOkhsv(okhsv);
        }
    });

    gradientSizeSlider.addListener((e) => {
        gradientSteps.value = clamp(gradientSizeSlider.value, 3, 21);
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

        if (isOkhsl.value) {
            var okhsl = toOkhsl(color);
            hueInput.value = Number(loopDegrees(okhsl.h * 360.0).toFixed(2));
            saturationInput.value = Number((okhsl.s * 100.0).toFixed(2));
            valueInput.value = Number((okhsl.l * 100.0).toFixed(2));
        } else {
            var okhsv = toOkhsv(color);
            hueInput.value = Number(loopDegrees(okhsv.h * 360.0).toFixed(2));
            saturationInput.value = Number((okhsv.s * 100.0)).toFixed(2);
            valueInput.value = Number((okhsv.v * 100.0).toFixed(2));
        }

        colorInput.value = colorToHex(color);

        root.style.setProperty("--mainColor", color.display());
        root.style.setProperty("--onMainColor", color.oklab.l > 0.5 ? "#000000" : "#ffffff");

        updateHash();

        scheme.notifyListeners();
        updateCSS();

    });

    scheme.listen((value) => {
        colorSchemeSelect.value = value;
        updateHash();
    });

    gradientSteps.listen((value) => {
        gradientSizeSlider.value = clamp(value, 3, 21);
        updateHash();
        updateColors();
    });

    startL.listen((value) => {
        startLSlider.value = value;
        updateHash();
        validateSortedPaletteOrder();
        updateColors();
    });

    endL.listen((value) => {
        endLSlider.value = value;
        updateHash();
        validateSortedPaletteOrder();
        updateColors();
    });

    generatedColors.listen((value) => {
        palette = value[0];
        sortedPalette = value[1];
        discreteMix = true;
        switch (scheme.value) {
            case "full": //All Colors
            case "mono": //Monochromatic
            case "anal3": //Analogous 3
            case "anal5": //Analogous 5
                discreteMix = false;
                break;
        }
        updateColors();
        updateExtras();
        updateCSS();
    });

    uiSaturation.listen((x) => {
        updateHash();
        updateCSS();
        uiSatSlider.value = Number((x * 100.0).toFixed(2));
    });

    uiSatSlider.addListener((e) => {
        uiSaturation.value = clamp(uiSatSlider.value / 100.0, 0.0, 1.0);
    });

    selectedColor.listen((value) => {
        detailsTab.checked = true;
        selectedColorDiv.style.backgroundColor = value.display();
        hex.innerText = colorToHex(value);
        //We create a Color object from the hex value to round up sRGB values
        //and avoid possible conflicts on other softwares
        var srgbColor = new Color(hex.innerText);
        srgb.innerText = srgbColor.toString({
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
        hsv.innerText = srgbColor.to("hsv").toString({ format: "hsv" });
        hsl.innerText = srgbColor.to("hsl").toString({ format: "hsl" });
        hwb.innerText = srgbColor.to("hwb").toString({ format: "hwb" });
        displayP3.innerText = value.to("p3").toGamut({ method: "clip" }).toString();
        rec2020.innerText = value.to("rec2020").toGamut({ method: "clip" }).toString();
    });

    colorsTab.checked = true;

    isOkhsl.listen((value) => {
        okhslCheckBox.checked = value;
        valueLightnessLabel.innerText = value ? "Lightness" : "Value";
        if (value) {
            var okhsl = toOkhsl(mainColor.value);
            hueInput.value = Number(loopDegrees(okhsl.h * 360.0).toFixed(2));
            saturationInput.value = Number((okhsl.s * 100.0).toFixed(2));
            valueInput.value = Number((okhsl.l * 100.0).toFixed(2));
        } else {
            var okhsv = toOkhsv(mainColor.value);
            hueInput.value = Number(loopDegrees(okhsv.h * 360.0).toFixed(2));
            saturationInput.value = Number((okhsv.s * 100.0)).toFixed(2);
            valueInput.value = Number((okhsv.v * 100.0).toFixed(2));
        }

    });

    okhslCheckBox.addEventListener("change", (e) => {
        isOkhsl.value = okhslCheckBox.checked;
    });

    invertedLightness.listen((x) => {
        updateCSS();
    })

    isLightMode.listen((x) => {
        if(x) {
            daynightButton.innerText = "light_mode";
            root.classList.add("light");
            root.classList.remove("dark");
        } else {
            daynightButton.innerText = "dark_mode";
            root.classList.add("dark");
            root.classList.remove("light");
        }
        updateHash();
    });

});

var isUpdatingColors = false;
function updateColors() {
    if (isUpdatingColors) {
        return;
    }
    isUpdatingColors = true;
    setTimeout(function () {
        removeChilds(baseColorsDiv);
        removeChilds(generatedShadesDiv);
        removeChilds(individualShadesSection);

        palette.forEach(color => {
            var div = document.createElement("div");
            //This prevents an exception thrown on Color.js
            //when a value is too small. Probably caused by its
            //string parser and exponential notation
            if (Math.abs(color.oklab.a) <= 0.0001) {
                color.oklab.a = 0.0;
            }
            if (Math.abs(color.oklab.b) <= 0.0001) {
                color.oklab.b = 0.0;
            }
            div.style.backgroundColor = color.display();
            div.addEventListener("click", selectBackgroundColor);
            baseColorsDiv.appendChild(div);

            var parentDiv = document.createElement("div");
            parentDiv.classList.add("colorSwatch");
            for (var i = 0; i < gradientSteps.value; i++) {
                var shade = i / (gradientSteps.value - 1.0);

                var shadedColor = getShade(color, L(shade));
                //This prevents an exception thrown on Color.js
                //when a value is too small. Probably caused by its
                //string parser and exponential notation
                if (Math.abs(shadedColor.oklab.a) <= 0.0001) {
                    shadedColor.oklab.a = 0.0;
                }
                if (Math.abs(shadedColor.oklab.b) <= 0.0001) {
                    shadedColor.oklab.b = 0.0;
                }

                var shadeDiv = document.createElement("div");
                shadeDiv.style.backgroundColor = shadedColor.display();
                shadeDiv.addEventListener("click", selectBackgroundColor);
                parentDiv.appendChild(shadeDiv);
            }
            individualShadesSection.appendChild(parentDiv);

        });

        currentPreviewList = [];

        for (var i = 0; i < gradientSteps.value; i++) {
            var shade = i / (gradientSteps.value - 1.0);

            var color = mainColor.value; //Temporal value

            if (discreteMix) {
                var index = remap(i, 0.0, gradientSteps.value - 1.0, 0.0, sortedPalette.length - 1);
                var colorA = sortedPalette[Math.floor(index)];
                var colorB = sortedPalette[Math.round(index)];
                var colorC = sortedPalette[Math.ceil(index)];
                color = colorSpline([colorA, colorB, colorC], index % 1);
            } else {
                color = colorSpline(sortedPalette, shade);
            }
            color = getShade(color, L(shade));
            //This prevents an exception thrown on Color.js
            //when a value is too small. Probably caused by its
            //string parser and exponential notation
            if (Math.abs(color.oklab.a) <= 0.0001) {
                color.oklab.a = 0.0;
            }
            if (Math.abs(color.oklab.b) <= 0.0001) {
                color.oklab.b = 0.0;
            }

            var div = document.createElement("div");
            div.style.backgroundColor = color.display();
            currentPreviewList.push(color.display());
            div.addEventListener("click", selectBackgroundColor);
            generatedShadesDiv.appendChild(div);
        }

        isUpdatingColors = false;
    });
}

function selectBackgroundColor(e) {
    try {
        selectedColor.value = new Color(e.target.style.backgroundColor);
    } catch {
        var propertyName = e.target.style.backgroundColor.slice(4, -1);
        var computed = window.getComputedStyle(e.target).getPropertyValue(propertyName);
        selectedColor.value = new Color(computed);
    }
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

var isValidatingSortedPaletteOrder = false;
function validateSortedPaletteOrder() {
    if (isValidatingSortedPaletteOrder) {
        return;
    }
    isValidatingSortedPaletteOrder = true;
    setTimeout(function () {
        var isInverted = (startL.value > endL.value);
        if (invertedLightness.value != isInverted) {
            invertedLightness.value = isInverted;
        }
        isValidatingSortedPaletteOrder = false;
    });
}

var isUpdatingCSS = false;
function updateCSS() {
    if (isUpdatingCSS) {
        return;
    }
    isUpdatingCSS = true;
    setTimeout(function () {
        var css = ":root {";
        var okhsl = toOkhsl(mainColor.value);
        okhsl.s *= uiSaturation.value;

        function getPrimaryColor(prefix, l) {
            if (l <= 0.0) {
                okhsl.l = 0.02;
                var color = fromOkhsl(okhsl);
                okhsl.l = l;
                color.oklab.l = 0.0;
                var cssColor = color.to("oklab").display();
                root.style.setProperty(prefix, cssColor);
                return "\n    " + prefix + ": " + cssColor + ";";
            }
            if (l >= 1.0) {
                okhsl.l = 0.02;
                var color = fromOkhsl(okhsl);
                okhsl.l = l;
                color.oklab.l = 1.0;
                var cssColor = color.to("oklab").display();
                root.style.setProperty(prefix, cssColor);
                return "\n    " + prefix + ": " + cssColor + ";";
            }
            okhsl.l = l;
            var cssColor = fromOkhsl(okhsl).to("oklab").display();
            root.style.setProperty(prefix, cssColor);
            return "\n    " + prefix + ": " + cssColor + ";";
        }

        css += getPrimaryColor("--P0", 0.00);
        css += getPrimaryColor("--P4", 0.04);
        css += getPrimaryColor("--P6", 0.06);
        css += getPrimaryColor("--P10", 0.10);
        css += getPrimaryColor("--P12", 0.12);
        css += getPrimaryColor("--P17", 0.17);
        css += getPrimaryColor("--P20", 0.20);
        css += getPrimaryColor("--P22", 0.22);
        css += getPrimaryColor("--P24", 0.24);
        css += getPrimaryColor("--P30", 0.30);
        css += getPrimaryColor("--P40", 0.40);
        css += getPrimaryColor("--P50", 0.50);
        css += getPrimaryColor("--P60", 0.60);
        css += getPrimaryColor("--P70", 0.70);
        css += getPrimaryColor("--P80", 0.80);
        css += getPrimaryColor("--P87", 0.87);
        css += getPrimaryColor("--P90", 0.90);
        css += getPrimaryColor("--P92", 0.92);
        css += getPrimaryColor("--P94", 0.94);
        css += getPrimaryColor("--P95", 0.95);
        css += getPrimaryColor("--P96", 0.96);
        css += getPrimaryColor("--P98", 0.98);
        css += getPrimaryColor("--P100", 1.00);
        css += "\n";

        if (invertedLightness.value) {
            sortedPalette.reverse();
        }
        for (var i = 0; i <= 100; i += 10) {
            var color = mainColor.value;
            var shade = i / 100.0;
            if (discreteMix) {
                var index = remap(i, 0.0, 100.0, 0.0, sortedPalette.length - 1);
                var colorA = sortedPalette[Math.floor(index)];
                var colorB = sortedPalette[Math.round(index)];
                var colorC = sortedPalette[Math.ceil(index)];
                color = colorSpline([colorA, colorB, colorC], index % 1);
            } else {
                color = colorSpline(sortedPalette, shade);
            }
            var cssColor = getShade(color, shade).display();
            root.style.setProperty("--A" + i, cssColor);
            css += "\n    --A" + i + ": " + cssColor + ";";
        }
        if (invertedLightness.value) {
            sortedPalette.reverse();
        }
        css += "\n";

        var errorOkhsv = toOkhsv(mainColor.value);
        errorOkhsv.h = getClosestHarmonicHue(errorOkhsv.h * 360.0, 27.0) / 360.0;
        var errorColor = fromOkhsv(errorOkhsv);
        for (var i = 0; i <= 100; i += 10) {
            var shade = i / 100.0;
            var cssColor = getShade(errorColor, shade).display();
            root.style.setProperty("--E" + i, cssColor);
            css += "\n    --E" + i + ": " + cssColor + ";";
        }

        css += "\n}";
        colorsCss.innerText = css;

        isUpdatingCSS = false;
    });
}
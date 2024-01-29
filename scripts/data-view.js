var root;
var colorInput, hueInput, saturationInput, valueInput;
var gradientSizeSlider, startLSlider, endLSlider, colorSchemeSelect;
var baseColorsDiv, generatedShadesDiv, individualShadesSection;
var daynightButton, snackbar, colorsTab, detailsTab;
var selectedColorDiv;
var hex, srgb, oklab, oklch, lab, lch, hsv, hsl, hwb, displayP3, rec2020;
var okhslCheckBox, valueLightnessLabel;

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
    gradientSizeSlider = new TextSlider("gradientSizeRange", "gradientSizeText");
    startLSlider = new TextSlider("LStartRange", "LStartText");
    endLSlider = new TextSlider("LEndRange", "LEndText");
    okhslCheckBox = id("okhsl");
    valueLightnessLabel = id("valuelightness");

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

        root.style.setProperty("--P0", getShade(mainColor.value, 0.00).to("oklab").display());
        root.style.setProperty("--P4", getShade(mainColor.value, 0.04).to("oklab").display());
        root.style.setProperty("--P6", getShade(mainColor.value, 0.06).to("oklab").display());
        root.style.setProperty("--P10", getShade(mainColor.value, 0.10).to("oklab").display());
        root.style.setProperty("--P12", getShade(mainColor.value, 0.12).to("oklab").display());
        root.style.setProperty("--P17", getShade(mainColor.value, 0.17).to("oklab").display());
        root.style.setProperty("--P20", getShade(mainColor.value, 0.20).to("oklab").display());
        root.style.setProperty("--P22", getShade(mainColor.value, 0.22).to("oklab").display());
        root.style.setProperty("--P30", getShade(mainColor.value, 0.30).to("oklab").display());
        root.style.setProperty("--P40", getShade(mainColor.value, 0.40).to("oklab").display());
        root.style.setProperty("--P50", getShade(mainColor.value, 0.50).to("oklab").display());
        root.style.setProperty("--P60", getShade(mainColor.value, 0.60).to("oklab").display());
        root.style.setProperty("--P80", getShade(mainColor.value, 0.80).to("oklab").display());
        root.style.setProperty("--P90", getShade(mainColor.value, 0.90).to("oklab").display());
        root.style.setProperty("--P92", getShade(mainColor.value, 0.92).to("oklab").display());
        root.style.setProperty("--P94", getShade(mainColor.value, 0.94).to("oklab").display());
        root.style.setProperty("--P95", getShade(mainColor.value, 0.95).to("oklab").display());
        root.style.setProperty("--P96", getShade(mainColor.value, 0.96).to("oklab").display());
        root.style.setProperty("--P98", getShade(mainColor.value, 0.98).to("oklab").display());
        root.style.setProperty("--P100", getShade(mainColor.value, 1.0).to("oklab").display());

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

        palette.value.forEach(color => {
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

        var sortedPalette = [...palette.value];
        var discreteMix = true;
        switch (scheme.value) {
            case "full": //All Colors
                sortedPalette.push(sortedPalette[0]);
                discreteMix = false;
                break;
            case "mono": //Monochromatic
                discreteMix = false;
                break;
            case "anal3": //Analogous 3
            case "anal5": //Analogous 5
                discreteMix = false;
                var headL = sortedPalette[0].oklab.l;
                var tailL = sortedPalette[sortedPalette.length - 1].oklab.l;
                if(headL > tailL){
                    sortedPalette.reverse();
                }
                break;
            default:
                sortedPalette.push(mainColor.value);
                sortedPalette.push(...palette.value);
                sortedPalette = sortColors(sortedPalette);
                break;
        }
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
            div.addEventListener("click", selectBackgroundColor);
            generatedShadesDiv.appendChild(div);
        }

        if(startL.value > endL.value) {
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
            root.style.setProperty("--A" + i, getShade(color, shade).display());
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
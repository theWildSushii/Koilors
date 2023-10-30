function onHexChanged(e) {
    try {
        mainData.mainColor = new Color(e.target.value);
        updateUI();
    } catch {
        try {
            mainData.mainColor = new Color("#" + e.target.value);
            updateUI();
        } catch { }
    }
}

function onHueChanged(e) {
    mainData.mainColor = setHue(mainData.mainColor, loopDegrees(Number(e.target.value)));
    updateUI();
}

function onSaturationChanged(e) {
    mainData.mainColor = setSaturation(mainData.mainColor, clamp(Number(e.target.value / 100.0), 0.004, 1.0));
    updateUI();
}

function onValueChanged(e) {
    mainData.mainColor = setValue(mainData.mainColor, clamp(Number(e.target.value / 100.0), 0.004, 1.0));
    updateUI();
}

function onLightnessChanged(e) {
    mainData.mainColor = setLightness(mainData.mainColor, clamp(Number(e.target.value / 100.0), 0.004, 0.999));
    updateUI();
}

function onSchemeChanged() {
    mainData.scheme = schemeSelect.value;
    updateUI();
}

function onGradientStepsChanged(e) {
    mainData.gradientSteps = Number(e.target.value);
    updateUI();
}

function onStartLChanged(e) {
    mainData.startL = Number(e.target.value);
    updateUI();
}

function onEndLChanged(e) {
    mainData.endL = Number(e.target.value);
    updateUI();
}

function copyBackgroundColorToClipboard(event) {
    var color = new Color(event.target.style.backgroundColor);
    var hex = color.to("srgb").clone().toGamut({ method: "clip" }).toString({ format: "hex" });
    clipboardP.style.display = "block";
    copiedText.innerText = hex;
    copiedText.style.textShadowColor = color.display();
    navigator.clipboard.writeText(hex);
}

function randomize() {
    mainData.randomize();
    updateUI();
}
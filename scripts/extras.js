const customL = new LiveData(0.5);

var customLSlider, customLSection;

ready(function() {

    customLSlider = new TextSlider("CustomLRange", "CustomLText");
    customLSection = id("customBaseColors");

    customL.listen((x) => {
        customLSlider.value = clamp(Number((x * 100.0).toFixed(2)), 0.0, 100.0);
        updateCustomLightness();
    });

    customLSlider.addListener((e) => {
        customL.value = customLSlider.value / 100.0;
    });

});

var isUpdatingCustomLightness = false;
function updateCustomLightness() {
    if (isUpdatingCustomLightness) {
        return;
    }
    isUpdatingCustomLightness = true;
    setTimeout(function () {

        removeChilds(customLSection);

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
            var okhsl = toOkhsl(color);
            okhsl.l = clamp(customL.value, 0.0005, 0.9999);
            var customColor = fromOkhsl(okhsl);
            div.style.backgroundColor = customColor.display();
            div.addEventListener("click", selectBackgroundColor);
            customLSection.appendChild(div);

        });

        isUpdatingCustomLightness = false;
    });
}

function updateExtras() {
    updateCustomLightness();
}
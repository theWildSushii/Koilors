class TextSlider {

    #range;
    #text;

    constructor(rangeId, textId) {
        this.#range = document.getElementById(rangeId);
        this.#text = document.getElementById(textId);
    }

    get value() {
        return Number(this.#range.value);
    }

    set value(newValue) {
        this.#range.value = newValue;
        this.#text.value = newValue;
    }

    static onRangeChange(rangeInputElmt, listener) {
        var inputEvtHasNeverFired = true;
        var rangeValue = { current: undefined, mostRecent: undefined };
        rangeInputElmt.addEventListener("input", function (evt) {
            inputEvtHasNeverFired = false;
            rangeValue.current = evt.target.value;
            if (rangeValue.current !== rangeValue.mostRecent) {
                listener(evt);
            }
            rangeValue.mostRecent = rangeValue.current;
        });
        rangeInputElmt.addEventListener("change", function (evt) {
            if (inputEvtHasNeverFired) {
                listener(evt);
            }
        });
    }

    addListener(func) {
        var rangeCopy = this.#range;
        var textCopy = this.#text;
        TextSlider.onRangeChange(this.#range, function (e) {
            textCopy.value = e.target.value;
            func(e);
        });
        this.#text.addEventListener("change", function (e) {
            rangeCopy.value = e.target.value;
            func(e);
        });
    }

}
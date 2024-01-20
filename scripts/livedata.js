class LiveData {

    #value;
    #listeners;

    constructor(defaultValue) {
        this.#value = defaultValue;
        this.#listeners = [];
    }

    get value() {
        return this.#value;
    }

    set value(x) {
        this.#value = x;
        this.notifyListeners();
    }

    listen(listener) {
        this.#listeners.push(listener);
        listener(this.#value);
    }

    unregisterListener(listener) {
        this.#listeners = this.#listeners.filter((x) => x !== listener);
    }

    notifyListeners() {
        this.#listeners.forEach(listener => {
            listener(this.#value);
        });
    }

}
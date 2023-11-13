class DataModel {

    static randomScheme() {
        var schemes = [
            "mono",
            "comp",
            "anal3",
            "split",
            "tri",
            "square",
            "tetral",
            "tetrar",
            "anal5",
            "dsc",
            "poly",
            "analc"
        ];
        return schemes[Math.floor(Math.random() * schemes.length)];
    }

    get string() {
        var code = this.mainColor.to("srgb").toGamut({ method: "clip" }).toString({ format: "hex" });
        code += "/" + this.scheme;
        code += "/" + Math.round(this.gradientSteps);
        code += "/" + Math.round(this.startL);
        code += "/" + Math.round(this.endL);
        return code;
    }

    set string(string) {
        var keywords = string.split("/");
        this.randomize();
        try {
            this.mainColor = new Color(keywords[0]);
            this.scheme = keywords[1];
            this.gradientSteps = Math.round(Number(keywords[2]));
            this.startL = Math.round(Number(keywords[3]));
            this.endL = Math.round(Number(keywords[4]));
        } catch {}
    }

    randomize() {
        var okhsv = {
            h: Math.random(),
            s: lerp(0.618, 1.0, Math.random()),
            v: lerp(0.75, 1.0, Math.random())
        };
        this.scheme = DataModel.randomScheme();
        this.mainColor = fromOkhsv(okhsv);
        this.gradientSteps = Math.round(lerp(3, 11, Math.random()));
        this.startL = Math.round(100.0 / (this.gradientSteps + 1.0));
        this.endL = Math.round(100.0 - this.startL);
    }

    L(l) {
        return clamp(lerp(this.startL, this.endL, l) / 100.0, 0.0, 1.0);
    }

}
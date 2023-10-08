function oklab_to_linear_srgb(L, a, b) {
    let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    let s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    let l = l_ * l_ * l_;
    let m = m_ * m_ * m_;
    let s = s_ * s_ * s_;
    return [
        (+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
        (-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
        (-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
    ];
}

function toe(x) {
    const k_1 = 0.206
    const k_2 = 0.03
    const k_3 = (1 + k_1) / (1 + k_2)
    return 0.5 * (k_3 * x - k_1 + Math.sqrt((k_3 * x - k_1) * (k_3 * x - k_1) + 4 * k_2 * k_3 * x))
}

function toe_inv(x) {
    const k_1 = 0.206
    const k_2 = 0.03
    const k_3 = (1 + k_1) / (1 + k_2)
    return (x * x + k_1 * x) / (k_3 * (x + k_2))
}

function compute_max_saturation(a, b) {
    let k0, k1, k2, k3, k4, wl, wm, ws;
    if (-1.88170328 * a - 0.80936493 * b > 1) {
        k0 = +1.19086277; k1 = +1.76576728; k2 = +0.59662641; k3 = +0.75515197; k4 = +0.56771245;
        wl = +4.0767416621; wm = -3.3077115913; ws = +0.2309699292;
    } else if (1.81444104 * a - 1.19445276 * b > 1) {
        k0 = +0.73956515; k1 = -0.45954404; k2 = +0.08285427; k3 = +0.12541070; k4 = +0.14503204;
        wl = -1.2684380046; wm = +2.6097574011; ws = -0.3413193965;
    } else {
        k0 = +1.35733652; k1 = -0.00915799; k2 = -1.15130210; k3 = -0.50559606; k4 = +0.00692167;
        wl = -0.0041960863; wm = -0.7034186147; ws = +1.7076147010;
    }
    let S = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;
    let k_l = +0.3963377774 * a + 0.2158037573 * b;
    let k_m = -0.1055613458 * a - 0.0638541728 * b;
    let k_s = -0.0894841775 * a - 1.2914855480 * b;
    {
        let l_ = 1 + S * k_l;
        let m_ = 1 + S * k_m;
        let s_ = 1 + S * k_s;
        let l = l_ * l_ * l_;
        let m = m_ * m_ * m_;
        let s = s_ * s_ * s_;
        let l_dS = 3 * k_l * l_ * l_;
        let m_dS = 3 * k_m * m_ * m_;
        let s_dS = 3 * k_s * s_ * s_;
        let l_dS2 = 6 * k_l * k_l * l_;
        let m_dS2 = 6 * k_m * k_m * m_;
        let s_dS2 = 6 * k_s * k_s * s_;
        let f = wl * l + wm * m + ws * s;
        let f1 = wl * l_dS + wm * m_dS + ws * s_dS;
        let f2 = wl * l_dS2 + wm * m_dS2 + ws * s_dS2;
        S = S - f * f1 / (f1 * f1 - 0.5 * f * f2);
    }
    return S;
}

function find_cusp(a, b) {
    let S_cusp = compute_max_saturation(a, b);
    let rgb_at_max = oklab_to_linear_srgb(1, S_cusp * a, S_cusp * b);
    let L_cusp = Math.cbrt(1 / Math.max(Math.max(rgb_at_max[0], rgb_at_max[1]), rgb_at_max[2]));
    let C_cusp = L_cusp * S_cusp;
    return [L_cusp, C_cusp];
}

function find_gamut_intersection(a, b, L1, C1, L0, cusp = null) {
    if (!cusp) {
        cusp = find_cusp(a, b);
    }
    let t;
    if (((L1 - L0) * cusp[1] - (cusp[0] - L0) * C1) <= 0) {
        t = cusp[1] * L0 / (C1 * cusp[0] + cusp[1] * (L0 - L1));
    } else {
        t = cusp[1] * (L0 - 1) / (C1 * (cusp[0] - 1) + cusp[1] * (L0 - L1));
        {
            let dL = L1 - L0;
            let dC = C1;
            let k_l = +0.3963377774 * a + 0.2158037573 * b;
            let k_m = -0.1055613458 * a - 0.0638541728 * b;
            let k_s = -0.0894841775 * a - 1.2914855480 * b;
            let l_dt = dL + dC * k_l;
            let m_dt = dL + dC * k_m;
            let s_dt = dL + dC * k_s;
            {
                let L = L0 * (1 - t) + t * L1;
                let C = t * C1;
                let l_ = L + C * k_l;
                let m_ = L + C * k_m;
                let s_ = L + C * k_s;
                let l = l_ * l_ * l_;
                let m = m_ * m_ * m_;
                let s = s_ * s_ * s_;
                let ldt = 3 * l_dt * l_ * l_;
                let mdt = 3 * m_dt * m_ * m_;
                let sdt = 3 * s_dt * s_ * s_;
                let ldt2 = 6 * l_dt * l_dt * l_;
                let mdt2 = 6 * m_dt * m_dt * m_;
                let sdt2 = 6 * s_dt * s_dt * s_;
                let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s - 1;
                let r1 = 4.0767416621 * ldt - 3.3077115913 * mdt + 0.2309699292 * sdt;
                let r2 = 4.0767416621 * ldt2 - 3.3077115913 * mdt2 + 0.2309699292 * sdt2;
                let u_r = r1 / (r1 * r1 - 0.5 * r * r2);
                let t_r = -r * u_r;
                let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s - 1;
                let g1 = -1.2684380046 * ldt + 2.6097574011 * mdt - 0.3413193965 * sdt;
                let g2 = -1.2684380046 * ldt2 + 2.6097574011 * mdt2 - 0.3413193965 * sdt2;
                let u_g = g1 / (g1 * g1 - 0.5 * g * g2);
                let t_g = -g * u_g;
                let b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s - 1;
                let b1 = -0.0041960863 * ldt - 0.7034186147 * mdt + 1.7076147010 * sdt;
                let b2 = -0.0041960863 * ldt2 - 0.7034186147 * mdt2 + 1.7076147010 * sdt2;
                let u_b = b1 / (b1 * b1 - 0.5 * b * b2);
                let t_b = -b * u_b;
                t_r = u_r >= 0 ? t_r : 10e5;
                t_g = u_g >= 0 ? t_g : 10e5;
                t_b = u_b >= 0 ? t_b : 10e5;
                t += Math.min(t_r, Math.min(t_g, t_b));
            }
        }
    }
    return t;
}

function get_ST_max(a_, b_, cusp = null) {
    if (!cusp) {
        cusp = find_cusp(a_, b_);
    }
    let L = cusp[0];
    let C = cusp[1];
    return [C / L, C / (1 - L)];
}

function get_ST_mid(a_, b_) {
    S = 0.11516993 + 1 / (
        + 7.44778970 + 4.15901240 * b_
        + a_ * (- 2.19557347 + 1.75198401 * b_
            + a_ * (- 2.13704948 - 10.02301043 * b_
                + a_ * (- 4.24894561 + 5.38770819 * b_ + 4.69891013 * a_
                )))
    );
    T = 0.11239642 + 1 / (
        + 1.61320320 - 0.68124379 * b_
        + a_ * (+ 0.40370612 + 0.90148123 * b_
            + a_ * (- 0.27087943 + 0.61223990 * b_
                + a_ * (+ 0.00299215 - 0.45399568 * b_ - 0.14661872 * a_
                )))
    );
    return [S, T];
}

function get_Cs(L, a_, b_) {
    cusp = find_cusp(a_, b_);
    let C_max = find_gamut_intersection(a_, b_, L, 1, L, cusp);
    let ST_max = get_ST_max(a_, b_, cusp);
    let S_mid = 0.11516993 + 1 / (
        + 7.44778970 + 4.15901240 * b_
        + a_ * (- 2.19557347 + 1.75198401 * b_
            + a_ * (- 2.13704948 - 10.02301043 * b_
                + a_ * (- 4.24894561 + 5.38770819 * b_ + 4.69891013 * a_
                )))
    );
    let T_mid = 0.11239642 + 1 / (
        + 1.61320320 - 0.68124379 * b_
        + a_ * (+ 0.40370612 + 0.90148123 * b_
            + a_ * (- 0.27087943 + 0.61223990 * b_
                + a_ * (+ 0.00299215 - 0.45399568 * b_ - 0.14661872 * a_
                )))
    );
    let k = C_max / Math.min((L * ST_max[0]), (1 - L) * ST_max[1]);
    let C_mid;
    {
        let C_a = L * S_mid;
        let C_b = (1 - L) * T_mid;
        C_mid = 0.9 * k * Math.sqrt(Math.sqrt(1 / (1 / (C_a * C_a * C_a * C_a) + 1 / (C_b * C_b * C_b * C_b))));
    }
    let C_0;
    {
        let C_a = L * 0.4;
        let C_b = (1 - L) * 0.8;
        C_0 = Math.sqrt(1 / (1 / (C_a * C_a) + 1 / (C_b * C_b)));
    }
    return [C_0, C_mid, C_max];
}

function toOkhsl(color) {

    let C = Math.sqrt(color.oklab.a * color.oklab.a + color.oklab.b * color.oklab.b);
    let a_ = color.oklab.a / C;
    let b_ = color.oklab.b / C;

    let L = color.oklab.l;
    // let h = 0.5 + 0.5 * Math.atan2(-color.oklab.b, -color.oklab.a) / Math.PI;

    let Cs = get_Cs(L, a_, b_);
    let C_0 = Cs[0];
    let C_mid = Cs[1];
    let C_max = Cs[2];

    let s;
    if (C < C_mid) {
        let k_0 = 0;
        let k_1 = 0.8 * C_0;
        let k_2 = (1 - k_1 / C_mid);

        let t = (C - k_0) / (k_1 + k_2 * (C - k_0));
        s = t * 0.8;
    }
    else {
        let k_0 = C_mid;
        let k_1 = 0.2 * C_mid * C_mid * 1.25 * 1.25 / C_0;
        let k_2 = (1 - (k_1) / (C_max - C_mid));

        let t = (C - k_0) / (k_1 + k_2 * (C - k_0));
        s = 0.8 + 0.2 * t;
    }

    // let l = toe(L);

    return {
        h: 0.5 + 0.5 * Math.atan2(-color.oklab.b, -color.oklab.a) / Math.PI,
        s: s,
        l: toe(L)
    }
}

function fromOkhsl(okhsl) {
    let a_ = Math.cos(2 * Math.PI * okhsl.h);
    let b_ = Math.sin(2 * Math.PI * okhsl.h);
    let L = toe_inv(okhsl.l);

    let Cs = get_Cs(L, a_, b_);
    let C_0 = Cs[0];
    let C_mid = Cs[1];
    let C_max = Cs[2];

    let C, t, k_0, k_1, k_2;
    if (okhsl.s < 0.8) {
        t = 1.25 * okhsl.s;
        k_0 = 0;
        k_1 = 0.8 * C_0;
        k_2 = (1 - k_1 / C_mid);
    } else {
        t = 5 * (okhsl.s - 0.8);
        k_0 = C_mid;
        k_1 = 0.2 * C_mid * C_mid * 1.25 * 1.25 / C_0;
        k_2 = (1 - (k_1) / (C_max - C_mid));
    }

    C = k_0 + t * k_1 / (1 - k_2 * t);

    // If we would only use one of the Cs:
    //C = s*C_0;
    //C = s*1.25*C_mid;
    //C = s*C_max;

    // let rgb = oklab_to_linear_srgb(L, C * a_, C * b_);

    var output = new Color("oklab", [L, C * a_, C * b_]);
    output.alpha = 1;
    return output;
}

function toOkhsv(color) {
    let C = Math.sqrt(color.oklab.a * color.oklab.a + color.oklab.b * color.oklab.b);
    let a_ = color.oklab.a / C;
    let b_ = color.oklab.b / C;

    let L = color.oklab.l;
    // let h = 0.5 + 0.5 * Math.atan2(-color.oklab.b, -color.oklab.a) / Math.PI;

    let ST_max = get_ST_max(a_, b_);
    let S_max = ST_max[0];
    let S_0 = 0.5;
    let T = ST_max[1];
    let k = 1 - S_0 / S_max;

    t = T / (C + L * T);
    let L_v = t * L;
    let C_v = t * C;

    L_vt = toe_inv(L_v);
    C_vt = C_v * L_vt / L_v;

    rgb_scale = oklab_to_linear_srgb(L_vt, a_ * C_vt, b_ * C_vt);
    scale_L = Math.cbrt(1 / (Math.max(rgb_scale[0], rgb_scale[1], rgb_scale[2], 0)));

    L = L / scale_L;
    C = C / scale_L;

    C = C * toe(L) / L;
    L = toe(L);

    // v = L / L_v;
    // s = (S_0 + T) * C_v / ((T * S_0) + T * k * C_v);

    return {
        h: 0.5 + 0.5 * Math.atan2(-color.oklab.b, -color.oklab.a) / Math.PI,
        s: (S_0 + T) * C_v / ((T * S_0) + T * k * C_v),
        v: L / L_v
    };
}

function fromOkhsv(okhsv) {
    let a_ = Math.cos(2 * Math.PI * okhsv.h);
    let b_ = Math.sin(2 * Math.PI * okhsv.h);
    let ST_max = get_ST_max(a_, b_);
    let S_max = ST_max[0];
    let S_0 = 0.5;
    let T = ST_max[1];
    let k = 1 - S_0 / S_max;
    let L_v = 1 - okhsv.s * S_0 / (S_0 + T - T * k * okhsv.s);
    let C_v = okhsv.s * T * S_0 / (S_0 + T - T * k * okhsv.s);
    let L = okhsv.v * L_v;
    let C = okhsv.v * C_v;
    // to present steps along the way
    //L = v;
    //C = v*s*S_max;
    //L = v*(1 - s*S_max/(S_max+T));
    //C = v*s*S_max*T/(S_max+T);
    let L_vt = toe_inv(L_v);
    let C_vt = C_v * L_vt / L_v;
    let L_new = toe_inv(L); // * L_v/L_vt;
    C = C * L_new / L;
    L = L_new;
    let rgb_scale = oklab_to_linear_srgb(L_vt, a_ * C_vt, b_ * C_vt);
    let scale_L = Math.cbrt(1 / (Math.max(rgb_scale[0], rgb_scale[1], rgb_scale[2], 0)));
    // remove to see effect without rescaling
    L = L * scale_L;
    C = C * scale_L;

    var output = new Color("oklab", [L, C * a_, C * b_]);
    output.alpha = 1;
    return output;
}

function extractOklch(color) {
    return {
        l: color.oklch.l,
        c: color.oklch.c,
        h: color.oklch.h
    }
}

function fromOklch(oklch) {
    return new Color("oklch", [oklch.l, oklch.c, oklch.h]);
}

function setHue(color, hue) {
    var okhsv = toOkhsv(color);
    okhsv.h = hue/360.0;
    return fromOkhsv(okhsv);
}

function setSaturation(color, saturation) {
    var okhsv = toOkhsv(color);
    okhsv.s = saturation;
    return fromOkhsv(okhsv);
}

function setValue(color, value) {
    var okhsv = toOkhsv(color);
    okhsv.v = value;
    return fromOkhsv(okhsv);
}

function getShade(color, shade) {
    var okhsl = toOkhsl(color);
    okhsl.l = shade;
    return fromOkhsl(okhsl);
}

function getTone(color, tone) {
    var okhsl = toOkhsl(color);
    okhsl.s *= tone;
    return fromOkhsl(okhsl);
}

function getClosestHarmonicHue(from, to) {
    if (Math.abs(loopDegrees(to) - loopDegrees(from)) <= 18.0) {
        return from;
    }
    return getClosestHarmonicHue(from + 36.0, to);
}
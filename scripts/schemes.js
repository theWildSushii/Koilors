function rotateOkhsv(color, delta) {
    var okhsv = toOkhsv(color);
    okhsv.h = loopDegrees(okhsv.h + (delta / 360.0));
    return fromOkhsv(okhsv);
}

function rotateOkhsl(color, delta) {
    var okhsl = toOkhsl(color);
    okhsl.h = loopDegrees(okhsl.h + (delta / 360.0));
    return fromOkhsl(okhsl);
}

function getComplementaryScheme(color) {
    var palette = [
        color,
        rotateOkhsv(color, 180)
    ];

    var sortedPalette = sortColors(palette);

    return [palette, [
        sortedPalette[0],
        sortedPalette[0],
        color,
        color,
        sortedPalette[1],
        sortedPalette[1]
    ]];
}

function getAnalogous3Scheme(color) {
    var palette = [
        rotateOkhsv(color, -36.0),
        color,
        rotateOkhsv(color, 36.0)
    ];
    if (palette[0].oklab.l < palette[2].oklab.l) {
        return [palette, [...palette]];
    } else {
        return [palette, [...palette].reverse()];
    }
}

function getSplitComplementaryScheme(color) {
    var palette = [
        rotateOkhsv(color, -144.0),
        color,
        rotateOkhsv(color, 144.0)
    ];
    var sortedPalette = [
        palette[0],
        palette[0],
        palette[1],
        palette[1],
        palette[1],
        palette[2],
        palette[2]
    ];
    return [palette, sortColors(sortedPalette)];
    // if (palette[0].oklab.l < palette[2].oklab.l) {
    //     return [palette, sortedPalette];
    // } else {
    //     return [palette, sortedPalette.reverse()];
    // }
}

function getTriadicScheme(color) {
    var palette = [
        rotateOkhsv(color, -120.0),
        color,
        rotateOkhsv(color, 120.0)
    ];
    var sortedPalette = [
        palette[0],
        palette[0],
        palette[1],
        palette[1],
        palette[1],
        palette[2],
        palette[2]
    ];
    return [palette, sortColors(sortedPalette)];
    // if (palette[0].oklab.l < palette[2].oklab.l) {
    //     return [palette, sortedPalette];
    // } else {
    //     return [palette, sortedPalette.reverse()];
    // }
}

function getSquareScheme(color) {
    var palette = [
        rotateOkhsv(color, -90.0),
        color,
        rotateOkhsv(color, 90.0),
        rotateOkhsv(color, 180.0)
    ];
    var innerPalette = [palette[0], palette[1], palette[2]];
    if (innerPalette[0].oklab.l >= innerPalette[2].oklab.l) {
        innerPalette.reverse();
    }
    if (palette[1].oklab.l < palette[3].oklab.l) {
        return [palette, [
            innerPalette[0],
            innerPalette[1],
            innerPalette[1],
            innerPalette[2],
            palette[3],
            palette[3]
        ]];
    } else {
        return [palette, [
            palette[3],
            palette[3],
            innerPalette[0],
            innerPalette[1],
            innerPalette[1],
            innerPalette[2]
        ]];
    }
}

function getTetradicLeftScheme(color) {
    var palette = [
        rotateOkhsv(color, -72.0),
        color,
        rotateOkhsv(color, 180.0 - 72.0),
        rotateOkhsv(color, 180.0)
    ];
    var mainPalette = sortColors([palette[1], palette[1], palette[0]]);
    var complementaryPalette = sortColors([palette[3], palette[2]]);
    if (palette[1].oklab.l < palette[3].oklab.l) {
        return [palette, [...mainPalette, ...complementaryPalette]];
    } else {
        return [palette, [...complementaryPalette, ...mainPalette]];
    }
}

function getTetradicRightScheme(color) {
    var palette = [
        rotateOkhsv(color, 72.0),
        color,
        rotateOkhsv(color, 180.0 + 72.0),
        rotateOkhsv(color, 180.0)
    ];
    var mainPalette = sortColors([palette[1], palette[1], palette[0]]);
    var complementaryPalette = sortColors([palette[3], palette[2]]);
    if (palette[1].oklab.l < palette[3].oklab.l) {
        return [palette, [...mainPalette, ...complementaryPalette]];
    } else {
        return [palette, [...complementaryPalette, ...mainPalette]];
    }
}

function getCompoundScheme(color) {
    var palette = [
        rotateOkhsv(color, -36.0),
        rotateOkhsv(color, 180.0 + 36.0),
        color,
        rotateOkhsv(color, 180.0)
    ];
    var sortedPalette = [
        palette[2],
        palette[2],
        palette[2],
        palette[0],
        palette[1],
        palette[3],
        palette[3]
    ];
    if (palette[2].oklab.l >= palette[3].oklab.l) {
        sortedPalette.reverse();
    }
    return [palette, sortedPalette];
}

function getAnalogous5Scheme(color) {
    var palette = [
        rotateOkhsv(color, -72.0),
        rotateOkhsv(color, -36.0),
        color,
        rotateOkhsv(color, 36.0),
        rotateOkhsv(color, 72.0)
    ];
    if (palette[1].oklab.l < palette[3].oklab.l) {
        return [palette, [...palette]];
    } else {
        return [palette, [...palette].reverse()];
    }
}

function getDoubleSplitComplementaryScheme(color) {
    var palette = [
        rotateOkhsv(color, 180.0 - 36.0),
        rotateOkhsv(color, -36.0),
        color,
        rotateOkhsv(color, 36.0),
        rotateOkhsv(color, 180.0 + 36.0)
    ];
    var innerPalette = [palette[1], palette[1], palette[3]];
    if (innerPalette[0].oklab.l >= innerPalette[2].oklab.l) {
        innerPalette.reverse();
    }
    var outerPalette = [palette[0], palette[4]];
    outerPalette = sortColors(outerPalette);
    return [palette, [
        outerPalette[0],
        outerPalette[0],
        innerPalette[0],
        innerPalette[1],
        innerPalette[1],
        innerPalette[1],
        innerPalette[2],
        outerPalette[1],
        outerPalette[1]
    ]];
}

function getPolychromaticScheme(color) {
    var palette = [
        color,
        rotateOkhsv(color, 60.0),
        rotateOkhsv(color, 2.0 * 60.0),
        rotateOkhsv(color, 3.0 * 60.0),//Complementary
        rotateOkhsv(color, 4.0 * 60.0),
        rotateOkhsv(color, 5.0 * 60.0)
    ];
    var sortedPalette = [
        palette[4],
        palette[5],
        palette[0],
        palette[0],
        palette[0],
        palette[1],
        palette[2]
    ];
    if (sortedPalette[1].oklab.l >= sortedPalette[5].oklab.l) {
        sortedPalette.reverse();
    }
    if (palette[0].oklab.l <= palette[3].oklab.l) {
        return [palette, [
            ...sortedPalette,
            palette[3],
            palette[3]
        ]];
    } else {
        return [palette, [
            palette[3],
            palette[3],
            ...sortedPalette
        ]];
    }
}

function getComplementaryAnalogous(color) {
    var complementary = getComplementaryScheme(color)[0];
    var anal1 = getAnalogous3Scheme(complementary[0])[1];
    var anal2 = getAnalogous3Scheme(complementary[1])[1];
    var palette = [...anal1, ...anal2];

    var mainPalette = [
        anal1[0],
        anal1[0],
        anal1[0],
        anal1[1],
        anal1[1],
        anal1[1],
        anal1[1],
        anal1[2],
        anal1[2],
        anal1[2]
    ];
    var complementaryPalette = [
        anal2[0],
        anal2[0],
        anal2[1],
        anal2[1],
        anal2[1],
        anal2[2],
        anal2[2]
    ];
    if (complementary[0].oklab.l < complementary[1].oklab.l) {
        return [palette, [...mainPalette, ...complementaryPalette]];
    } else {
        return [palette, [...complementaryPalette, ...mainPalette]];
    }
}

function getAllColors(color) {
    var palette = [
        rotateOkhsv(color, -180.0),
        rotateOkhsv(color, -144.0),
        rotateOkhsv(color, -108.0),
        rotateOkhsv(color, -72.0),
        rotateOkhsv(color, -36.0),
        color,
        rotateOkhsv(color, 36.0),
        rotateOkhsv(color, 72.0),
        rotateOkhsv(color, 108.0),
        rotateOkhsv(color, 144.0)
    ]

    var sortedPalette = [
        rotateOkhsv(color, -180.0),
        rotateOkhsv(color, -144.0),
        rotateOkhsv(color, -108.0),
        rotateOkhsv(color, -72.0),
        rotateOkhsv(color, -36.0),
        color,
        color,
        color,
        rotateOkhsv(color, 36.0),
        rotateOkhsv(color, 72.0),
        rotateOkhsv(color, 108.0),
        rotateOkhsv(color, 144.0),
        rotateOkhsv(color, 180.0)
    ];
    if (sortedPalette[4].oklab.l >= sortedPalette[8].oklab.l) {
        sortedPalette.reverse();
    }

    return [palette, sortedPalette];
}
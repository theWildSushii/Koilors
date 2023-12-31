function rotateColor(color, delta) {
    var okhsv = toOkhsv(color);
    okhsv.h = loopDegrees(okhsv.h + (delta / 360.0));
    return fromOkhsv(okhsv);
}


function getComplementaryScheme(color) {
    return [
        color,
        rotateColor(color, 180)
    ];
}

function getAnalogous3Scheme(color) {
    return [
        rotateColor(color, -36.0),
        color,
        rotateColor(color, 36.0)
    ];
}

function getSplitComplementaryScheme(color) {
    return [
        rotateColor(color, -144.0),
        color,
        rotateColor(color, 144.0)
    ];
}

function getTriadicScheme(color) {
    return [
        rotateColor(color, -120.0),
        color,
        rotateColor(color, 120.0)
    ];
}

function getSquareScheme(color) {
    return [
        rotateColor(color, -90.0),
        color,
        rotateColor(color, 90.0),
        rotateColor(color, 180.0)
    ];
}

function getTetradicLeftScheme(color) {
    return [color,
        rotateColor(color, 180.0 - 72.0),
        rotateColor(color, 180.0),
        rotateColor(color, -72.0)
    ];
}

function getTetradicRightScheme(color) {
    return [color,
        rotateColor(color, 180.0 + 72.0),
        rotateColor(color, 180.0),
        rotateColor(color, 72.0)
    ];
}

function getAnalogous5Scheme(color) {
    return [
        rotateColor(color, -36.0),
        rotateColor(color, -18.0),
        color,
        rotateColor(color, 18.0),
        rotateColor(color, 36.0)
    ];
}

function getDoubleSplitComplementaryScheme(color) {
    return [
        rotateColor(color, -36.0),
        rotateColor(color, 180.0 + 36.0),
        color,
        rotateColor(color, 180.0 - 36.0),
        rotateColor(color, 36.0)
    ];
}

function getPolychromaticScheme(color) {
    return [color,
        rotateColor(color, 60.0),
        rotateColor(color, 2.0 * 60.0),
        rotateColor(color, 3.0 * 60.0),
        rotateColor(color, 4.0 * 60.0),
        rotateColor(color, 5.0 * 60.0)
    ];
}

function getComplementaryAnalogous(color) {
    var complementary = getComplementaryScheme(color);
    var anal1 = getAnalogous3Scheme(complementary[0]);
    var anal2 = getAnalogous3Scheme(complementary[1]);
    return [...anal1, ...anal2];
}

function getAllColors(color) {
    var okhsv = toOkhsv(color);
    okhsv.h = getClosestHarmonicHue(okhsv.h * 360.0 , 27.0) / 360.0;
    var red = fromOkhsv(okhsv);
    return [red,
        rotateColor(red, 36.0),
        rotateColor(red, 72.0),
        rotateColor(red, 108.0),
        rotateColor(red, 144.0),
        rotateColor(red, 180.0),
        rotateColor(red, 216.0),
        rotateColor(red, 252.0),
        rotateColor(red, 288.0),
        rotateColor(red, 324.0)
    ];
}
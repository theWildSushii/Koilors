function ready(callback) {
    if (document.readyState != 'loading') callback();
    else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
    else document.attachEvent('onreadystatechange', function () {
        if (document.readyState == 'complete') callback();
    });
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

function saturate(x) {
    return clamp(x, 0.0, 1.0);
}

function remap(x, inMin, inMax, outMin, outMax) {
    return outMin + (x - inMin) * (outMax - outMin) / (inMax - inMin);
}

function lerp(a, b, t) {
    return (1.0 - t) * a + t * b;
}

function lerp3(a, b, c, t) {
    if (t > 0.0) {
        return lerp(b, c, t);
    }
    if (t < 0.0) {
        return lerp(b, a, Math.abs(t));
    }
    return b;
}

function rate(value, rate) {
    return lerp3(0.0, value, 1.0, rate);
}

// function loopValue(x) {
//     if (x > 1.0) {
//         return loopValue(x - 1.0);
//     }
//     if (x < 0.0) {
//         return loopValue(x + 1.0);
//     }
//     return x;
// }

function loopDegrees(x) {
    if (x > 360) {
        return loopDegrees(x - 360.0);
    }
    if (x < 0.0) {
        return loopDegrees(x + 360.0);
    }
    return x;
}

function stepValue(value, step) {
    return Math.round(value / step) * step;
}

function removeChilds(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.lastChild);
    }
}

function sortColors(colors) {
    return [...colors].sort(function (a, b) {
        return a.oklab.l - b.oklab.l;
    });
}

function polarCoordinates(u, v) {
    var deltaX = u - 0.5;
    var deltaY = v - 0.5;
    return {
        radius: Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 2.0,
        angle: Math.atan2(deltaX, deltaY) * 1.0 / (2.0 * Math.PI)
    };
}
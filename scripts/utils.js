function ready(callback) {
    if (document.readyState != 'loading') callback();
    else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
    else document.attachEvent('onreadystatechange', function () {
        if (document.readyState == 'complete') callback();
    });
}

function onRangeChange(rangeInputElmt, listener) {

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

function removeChilds(parent) {
    while(parent.firstChild) {
        parent.removeChild(parent.lastChild);
    }
}
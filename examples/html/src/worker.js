var Browser = {
    IE: "Internet Explorer",
    Safari: "Safari",
    Edge: "Edge",
    Chrome: "Chrome",
    Firefox: "Firefox Mozilla",
};
/**
 * Returns info about browser
 */
function BrowserInfo() {
    var res = {
        name: "",
        version: ""
    };
    var userAgent = self.navigator.userAgent;
    var reg;
    if (reg = /edge\/([\d\.]+)/i.exec(userAgent)) {
        res.name = Browser.Edge;
        res.version = reg[1];
    }
    else if (/msie/i.test(userAgent)) {
        res.name = Browser.IE;
        res.version = /msie ([\d\.]+)/i.exec(userAgent)[1];
    }
    else if (/Trident/i.test(userAgent)) {
        res.name = Browser.IE;
        res.version = /rv:([\d\.]+)/i.exec(userAgent)[1];
    }
    else if (/chrome/i.test(userAgent)) {
        res.name = Browser.Chrome;
        res.version = /chrome\/([\d\.]+)/i.exec(userAgent)[1];
    }
    else if (/safari/i.test(userAgent)) {
        res.name = Browser.Safari;
        res.version = /([\d\.]+) safari/i.exec(userAgent)[1];
    }
    else if (/firefox/i.test(userAgent)) {
        res.name = Browser.Firefox;
        res.version = /firefox\/([\d\.]+)/i.exec(userAgent)[1];
    }
    return res;
}

stringToBuffer = function (text) {
    var res = new Uint8Array(text.length);
    for (var i = 0; i < text.length; i++)
        res[i] = text.charCodeAt(i);
    return res;
};
buffer2string = function (buffer) {
    var res = "";
    for (var i = 0; i < buffer.length; i++)
        res += String.fromCharCode(buffer[i]);
    return res;
};


// Crypto ==============================

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
function getRandomValues(buffer) {
    var buf = new Uint8Array(buffer.buffer);
    var i = 0;
    while (i < buf.length) {
        buf[i++] = getRandomArbitrary(0, 255);
    }
    return buffer;
}

var PATH = "";

var _self = self;
if (!(_self.crypto || _self.msCrypto)) {
    console.warn("WebCrypto: !WARNING! Webcrypto unable to get crypto || msCrypto getRandomValues, relying on supplied seed.");
    importScripts(PATH + "seedrandom.js");
    postMessage(["seed", 20]);
    _self.crypto = { getRandomValues: getRandomValues };
}


importScripts(PATH + "webcrypto-liner.lib.js");
switch (BrowserInfo().name) {
    case Browser.IE:
        importScripts(PATH + "promise.min.js");
    case Browser.Edge:
    case Browser.Safari:
        importScripts(PATH + "asmcrypto.min.js");
        importScripts(PATH + "elliptic.min.js");
}

let crypto = liner.crypto;

// ===============================================

importScripts("../../../dist/xmldsig.js");

function generateKey(alg) {
    return crypto.subtle.generateKey(alg, false, ["sign", "verify"])
}

function exportKey(key) {
    return crypto.subtle.exportKey("jwk", key)
}

onmessage = function (e) {
    switch (e.data[0]) {
        case "seed":
            Math.seedrandom(buffer2string(e.data[1]));
            break;
        case "sign":
            sign(e.data[1], e.data[2]);
            break;
        default:
            throw new Error("Unknown command from script '" + e.data[0] + "'");
    }
}



console.log("XMLSerializer", !!self.XMLSerializer);
console.log("DOMParser", !!self.DOMParser);
"use strict";
var xmljs_1 = require("xmljs");
var _crypto = null;
var Application = (function () {
    function Application() {
    }
    /**
     * Sets crypto engine for the current Application
     * @param  {string} name
     * @param  {Crypto} crypto
     * @returns void
     */
    Application.setEngine = function (name, crypto) {
        _crypto = crypto;
        _crypto.name = name;
    };
    Object.defineProperty(Application, "crypto", {
        /**
         * Gets the crypto module from the Application
         */
        get: function () {
            if (!_crypto)
                throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC_NO_MODULE);
            return _crypto;
        },
        enumerable: true,
        configurable: true
    });
    Application.isNodePlugin = function () {
        return (typeof module !== "undefined");
    };
    return Application;
}());
exports.Application = Application;
// set default w3 WebCrypto
+function init() {
    if (!Application.isNodePlugin()) {
        Application.setEngine("W3 WebCrypto module", window.crypto);
    }
}();

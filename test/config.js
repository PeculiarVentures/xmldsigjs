console.warn("Runing: NodeJS");

var fs = require("fs");
var assert = require("assert");
var select = require("xpath.js");
require("babel-polyfill");
var DOMParser = require("xmldom-alpha").DOMParser;
var XMLSerializer = require("xmldom-alpha").XMLSerializer;
var XmlCore = require("xml-core");
xmldsig = require("../");

var WebCrypto = require("node-webcrypto-ossl");
xmldsig.Application.setEngine("OpenSSL", new WebCrypto());
console.log("WebCrypto:", xmldsig.Application.crypto.name);

var readXml = function(path, cb) {
    fs.readFile(path, function(e, buf) {
        if (e)
            assert.equal(false, true, "Error on XML reading " + path);
        else {
            var doc = xmldsig.Parse(buf.toString());
            cb(doc);
        }
    })
}

module.exports = {
    select: select,
    xmldsig: xmldsig,
    DOMParser: DOMParser,
    XMLSerializer: XMLSerializer,
    readXml: readXml,
    assert: assert,
    XmlCore: XmlCore,
    crypto: new WebCrypto(),
}
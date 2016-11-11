"use strict";
var signed_xml_1 = require("./signed_xml");
exports.SignedXml = signed_xml_1.SignedXml;
var signed_xml_2 = require("./signed_xml");
var signed_info_1 = require("./signed_info");
exports.SignedInfo = signed_info_1.SignedInfo;
var signed_info_2 = require("./signed_info");
if (typeof self === "undefined") {
    var _w = self;
    _w.SignedXml = signed_xml_2.SignedXml;
    _w.SignedInfo = signed_info_2.SignedInfo;
}

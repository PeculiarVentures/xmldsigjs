export { SignedXml } from "./signed_xml";
import { SignedXml } from "./signed_xml";
export { SignedInfo } from "./signed_info";
import { SignedInfo } from "./signed_info";

if (typeof self === "undefined") {
    let _w = self as any;
    _w.SignedXml = SignedXml;
    _w.SignedInfo = SignedInfo;
}

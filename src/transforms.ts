import { XmlError, XE } from "xmljs";
import { XmlSignatureCollection } from "./xml_object";
import { XmlSignature } from "./xml";
import { Transform } from "./transform";
import { CryptoConfig } from "./crypto_config";

/**
 * The Transforms element contains a collection of transformations
 */
export class Transforms extends XmlSignatureCollection<Transform> {

    protected name = XmlSignature.ElementNames.Transforms;

    protected OnLoadChildElement(element: Element) {
        if (element.hasAttribute(XmlSignature.AttributeNames.Algorithm)) {
            const alg = element.getAttribute(XmlSignature.AttributeNames.Algorithm);
            let obj = CryptoConfig.CreateFromName(alg);
            obj.LoadXml(element);
            return obj;
        }
        throw new XmlError(XE.ELEMENT_MALFORMED, XmlSignature.ElementNames.Transform);
    }

}

import { XmlError, XE, select } from "xmljs";
import { Transform } from "../transform";

/**
 * Represents the enveloped signature transform for an XML digital signature as defined by the W3C.
 */
export class XmlDsigEnvelopedSignatureTransform extends Transform {

    Algorithm = "http://www.w3.org/2000/09/xmldsig#enveloped-signature";

    /**
     * Returns the output of the current XmlDsigEnvelopedSignatureTransform object.
     * @returns string
     */
    GetOutput(): any {
        if (!this.innerXml)
            throw new XmlError(XE.PARAM_REQUIRED, "innerXml");

        let signature = select(this.innerXml, ".//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
        if (signature) signature.parentNode.removeChild(signature);
        return this.innerXml;
    }

}

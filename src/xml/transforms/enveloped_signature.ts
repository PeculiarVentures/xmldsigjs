import { Select, XE, XmlError } from "xml-core";

import { Transform } from "../transform";

/**
 * Represents the enveloped signature transform for an XML digital signature as defined by the W3C.
 */
export class XmlDsigEnvelopedSignatureTransform extends Transform {

    public Algorithm = "http://www.w3.org/2000/09/xmldsig#enveloped-signature";

    /**
     * Returns the output of the current XmlDsigEnvelopedSignatureTransform object.
     * @returns string
     */
    public GetOutput(): any {
        if (!this.innerXml) {
            throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
        }

        const signature = Select(this.innerXml, ".//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
        if (signature) {
            signature.parentNode!.removeChild(signature);
        }
        return this.innerXml;
    }

}

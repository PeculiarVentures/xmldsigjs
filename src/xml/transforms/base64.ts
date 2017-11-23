import { Convert } from "xml-core";
import { XE, XmlError } from "xml-core";

import { Transform } from "../transform";
import { XmlSignature } from "../xml_names";

export class XmlDsigBase64Transform extends Transform {

    public Algorithm = XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform;

    /**
     * Returns the output of the current XmlDsigBase64Transform object
     */
    public GetOutput(): any {
        if (!this.innerXml) {
            throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
        }
        return Convert.FromString(this.innerXml.textContent || "", "base64");
    }

}

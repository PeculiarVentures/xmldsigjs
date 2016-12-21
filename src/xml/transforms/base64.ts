import { XmlSignature } from "../xml_names";
import { Convert } from "xml-core";
import { XmlError, XE } from "xml-core";
import { Transform } from "../transform";

export class XmlDsigBase64Transform extends Transform {

    Algorithm = XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform;

    /**
     * Returns the output of the current XmlDsigBase64Transform object
     */
    GetOutput(): any {
        if (!this.innerXml)
            throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
        return Convert.FromString(this.innerXml.textContent || "", "base64");
    }

}

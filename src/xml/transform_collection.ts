import { XE, XmlError } from "xml-core";
import { XmlElement } from "xml-core";

import { Transform } from "./transform";
import { XmlSignature } from "./xml_names";
import { XmlSignatureCollection } from "./xml_object";

/**
 * The Transforms element contains a collection of transformations
 */
@XmlElement({
    localName: XmlSignature.ElementNames.Transforms,
    parser: Transform,
})
export class Transforms extends XmlSignatureCollection<Transform> {
    protected OnLoadXml(element: Element) {
        super.OnLoadXml(element);
        // Update parsed objects
        this.items = this.GetIterator().map((item) => {
            switch (item.Algorithm) {
                case XmlSignature.AlgorithmNamespaces.XmlDsigEnvelopedSignatureTransform:
                    return ChangeTransform(item, transforms.XmlDsigEnvelopedSignatureTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigXPathFilter2Transform:
                    return ChangeTransform(item, transforms.XmlDsigXPathFilter2Transform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigC14NTransform:
                    return ChangeTransform(item, transforms.XmlDsigC14NTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigC14NWithCommentsTransform:
                    return ChangeTransform(item, transforms.XmlDsigC14NWithCommentsTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NTransform:
                    return ChangeTransform(item, transforms.XmlDsigExcC14NTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NWithCommentsTransform:
                    return ChangeTransform(item, transforms.XmlDsigExcC14NWithCommentsTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform:
                    return ChangeTransform(item, transforms.XmlDsigBase64Transform);
                default:
                    throw new XmlError(XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM, item.Algorithm);
            }
        });
    }
}

function ChangeTransform(t1: Transform, t2: typeof Transform) {
    const t = new t2();
    (t as any).element = t1.Element;
    return t;
}

import * as transforms from "./transforms";

import { isElement, XE, XmlError } from 'xml-core';

import { Transform } from '../transform.js';
import { XmlSignature } from '../xml_names.js';

/**
 * Represents the enveloped signature transform for an XML digital signature as defined by the W3C.
 */
export class XmlDsigEnvelopedSignatureTransform extends Transform {
  public Algorithm = 'http://www.w3.org/2000/09/xmldsig#enveloped-signature';

  /**
   * Returns the output of the current XmlDsigEnvelopedSignatureTransform object.
   * @returns string
   */
  public GetOutput(): any {
    if (!this.innerXml) {
      throw new XmlError(XE.PARAM_REQUIRED, 'innerXml');
    }

    let child = this.innerXml.firstChild;
    const signatures: Element[] = [];
    while (child) {
      if (
        isElement(child) &&
        child.localName === XmlSignature.ElementNames.Signature &&
        child.namespaceURI === XmlSignature.NamespaceURI
      ) {
        signatures.push(child);
      }
      child = child.nextSibling;
    }
    for (const signature of signatures) {
      signature.parentNode?.removeChild(signature);
    }
    return this.innerXml;
  }
}

import { describe, it, assert } from 'vitest';
import '../../../core/test/config.js';
import { DocumentationReference, ObjectIdentifier } from './object_identifier.js';

describe('ObjectIdentifier', () => {
  it('Parse', () => {
    const xmlObject = new ObjectIdentifier();

    xmlObject.Description = 'Description';
    xmlObject.Identifier.Value = 'uri:oid';
    xmlObject.Identifier.Qualifier = 'OIDAsURI';

    const ref = new DocumentationReference();

    ref.Uri = 'http://some1.com';
    xmlObject.DocumentationReferences.Add(ref);
    assert.equal(xmlObject.DocumentationReferences.Count, 1);

    const xml = xmlObject.toString();

    assert.equal(
      xml,
      `<xades:ObjectIdentifier xmlns:xades="http://uri.etsi.org/01903/v1.3.2#"><xades:Identifier Qualifier="OIDAsURI">uri:oid</xades:Identifier><xades:Description>Description</xades:Description><xades:DocumentationReferences><xades:DocumentationReference>http://some1.com</xades:DocumentationReference></xades:DocumentationReferences></xades:ObjectIdentifier>`,
    );

    const xmlObject2 = ObjectIdentifier.LoadXml(xml);

    assert.equal(xmlObject2.Description, xmlObject.Description);
    assert.equal(xmlObject2.Identifier.Value, xmlObject.Identifier.Value);
    assert.equal(xmlObject2.Identifier.Qualifier, xmlObject.Identifier.Qualifier);
    assert.equal(xmlObject2.DocumentationReferences.Count, 1);
    assert.equal(xmlObject2.DocumentationReferences.Item(0)?.Uri, ref.Uri);
  });
});

import { describe, it, assert } from 'vitest';
import '../test/config.js';
import {
  XmlAttribute,
  XmlElement,
  XmlObject,
  XmlBase64Converter,
  XmlBooleanConverter,
  XmlNumberConverter,
} from './index.js';

describe('Convertors', () => {
  it('String', () => {
    @XmlElement({ localName: 'test' })
    class XmlTest extends XmlObject {
      @XmlAttribute({})
      public Value!: string;
    }

    const test = new XmlTest();
    test.Value = '';
    const xmlTest = test.toString();
    const xml = `<test Value=""/>`;
    assert.equal(xmlTest, xml);

    const test2 = XmlTest.LoadXml(xml);
    assert.equal(test2.Value, '');
  });

  it('Number', () => {
    @XmlElement({ localName: 'test' })
    class XmlTest extends XmlObject {
      @XmlAttribute({ converter: XmlNumberConverter })
      public Value!: number;
    }

    const test = new XmlTest();
    test.Value = 15;
    const xmlTest = test.toString();
    const xml = `<test Value="15"/>`;
    assert.equal(xmlTest, xml);

    const test2 = XmlTest.LoadXml(xml);
    assert.equal(test2.Value, 15);
  });

  it('Base64', () => {
    @XmlElement({ localName: 'test' })
    class XmlTest extends XmlObject {
      @XmlAttribute({ converter: XmlBase64Converter })
      public Value!: Uint8Array;
    }

    const test = new XmlTest();
    test.Value = new Uint8Array([1, 0, 1]);
    const xmlTest = test.toString();
    const xml = `<test Value="AQAB"/>`;
    assert.equal(xmlTest, xml);

    const test2 = XmlTest.LoadXml(xml);
    assert.equal(test2.Value.length, 3);
    assert.equal(test2.Value[0], 1);
    assert.equal(test2.Value[1], 0);
    assert.equal(test2.Value[2], 1);
  });

  it('Boolean', () => {
    @XmlElement({ localName: 'test' })
    class XmlTest extends XmlObject {
      @XmlAttribute({ converter: XmlBooleanConverter })
      public ValueTrue!: boolean;

      @XmlAttribute({ converter: XmlBooleanConverter })
      public ValueFalse!: boolean;
    }

    const test = new XmlTest();
    test.ValueTrue = true;
    test.ValueFalse = false;
    const xmlTest = test.toString();
    const xml = `<test ValueTrue="true" ValueFalse="false"/>`;
    assert.equal(xmlTest, xml);

    const test2 = XmlTest.LoadXml(xml);
    assert.equal(test2.ValueTrue, true);
    assert.equal(test2.ValueFalse, false);
  });
});

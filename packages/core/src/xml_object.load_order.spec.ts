import { describe, it, assert } from "vitest";
import "../test/config.js";
// Load xml_object.js before xml_collection.js, the order the generated build/index.js uses.
import { XmlObject } from "./xml_object.js";
import { XmlCollection } from "./xml_collection.js";
import { XmlChildElement, XmlElement } from "./decorators.js";
import { XmlError } from "./error.js";

describe("XmlObject module load order", () => {
  it("defines XmlCollection when xml_object.js is loaded first", () => {
    assert.instanceOf(new XmlCollection(), XmlObject);
  });

  it("still rejects a noRoot parser that isn't an XmlCollection", () => {
    @XmlElement({ localName: "item" })
    class XmlItem extends XmlObject {}

    @XmlElement({ localName: "test" })
    class XmlTest extends XmlObject {
      @XmlChildElement({ parser: XmlItem, noRoot: true })
      public Items!: XmlItem;
    }

    assert.throws(() => XmlTest.LoadXml("<test><item/></test>"), XmlError, "must have 'parser' like instance of XmlCollection");
  });
});

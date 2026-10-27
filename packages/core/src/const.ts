export const ELEMENT = "element";
export const ATTRIBUTE = "attribute";
export const CONTENT = "content";

/** Marks XmlCollection instances, so xml_object.ts can recognize them without importing xml_collection.ts (which extends XmlObject). */
export const XML_COLLECTION = Symbol("XmlCollection");

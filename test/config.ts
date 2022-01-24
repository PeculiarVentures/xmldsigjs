import { Crypto } from "@peculiar/webcrypto";
import * as fs from "fs";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import * as xmldsig from "../src";
// tslint:disable-next-line: no-var-requires

const crypto = new Crypto();
global["crypto"] = crypto;
global["DOMParser"] = DOMParser;
global["XMLSerializer"] = XMLSerializer;

// Set crypto to XML application
xmldsig.Application.setEngine("NodeJS", crypto);

export function readXml(path: string) {
  const data = fs.readFileSync(path, { encoding: "utf8" });
  const doc = xmldsig.Parse(data);
  return doc;
}

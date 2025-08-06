import * as fs from 'fs';
import { Crypto } from '@peculiar/webcrypto';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import * as xmldsig from '../src';

global['DOMParser'] = DOMParser as any;
global['XMLSerializer'] = XMLSerializer as any;

// Set crypto to XML application
xmldsig.Application.setEngine('NodeJS', new Crypto());

export function readXml(path: string) {
  const data = fs.readFileSync(path, { encoding: 'utf8' });
  const doc = xmldsig.Parse(data);
  return doc;
}

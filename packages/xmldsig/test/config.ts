import * as fs from 'node:fs';
import { Crypto } from '@peculiar/webcrypto';
import '../../core/test/config.js';
import * as xmldsig from '../src/index.js';

// Set crypto to XML application
xmldsig.Application.setEngine('NodeJS', new Crypto());

export function readXml(path: string) {
  const data = fs.readFileSync(path, { encoding: 'utf8' });
  const doc = xmldsig.Parse(data);
  return doc;
}

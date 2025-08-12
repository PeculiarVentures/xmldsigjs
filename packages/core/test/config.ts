import * as xmldom from '@xmldom/xmldom';
import xpath from 'xpath';
import { setNodeDependencies } from 'xml-core';

setNodeDependencies({
  XMLSerializer: xmldom.XMLSerializer,
  DOMParser: xmldom.DOMParser,
  DOMImplementation: xmldom.DOMImplementation,
  xpath,
});

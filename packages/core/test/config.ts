import * as xmldom from '@xmldom/xmldom';
import { setNodeDependencies } from 'xml-core';
import xpath from 'xpath';

setNodeDependencies({
  XMLSerializer: xmldom.XMLSerializer,
  DOMParser: xmldom.DOMParser,
  DOMImplementation: xmldom.DOMImplementation,
  xpath,
});

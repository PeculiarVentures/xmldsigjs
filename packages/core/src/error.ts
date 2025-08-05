function printf(text: string, ...args: any[]) {
  // Replace all %1, %2, ... with args[0], args[1], ...
  let msg = text.replace(/%([1-9]\d*)/g, (m, n) => {
    const idx = parseInt(n, 10) - 1;
    return args[idx] !== undefined ? args[idx] : '';
  });
  // convert %% -> %
  msg = msg.replace(/%%/g, '%');
  return msg;
}

function padNum(num: number, size: number): string {
  let s = num + '';
  while (s.length < size) {
    s = '0' + s;
  }
  return s;
}

export class XmlError implements Error {
  public stack: any;
  public code: number;
  public name: string;
  public message: string;
  protected readonly prefix = 'XMLJS';
  constructor(code: XE, ...args: any[]) {
    this.code = code;
    this.name = (this.constructor as any).name;
    const message = printf(xes[code], ...args);
    this.message = `${this.prefix}${padNum(code, 4)}: ${message}`;
    this.stack = (new Error(this.message) as any).stack;
  }
}

export enum XE {
  NONE,
  NULL_REFERENCE,
  NULL_PARAM,
  DECORATOR_NULL_PARAM,
  COLLECTION_LIMIT,
  METHOD_NOT_IMPLEMENTED,
  METHOD_NOT_SUPPORTED,
  PARAM_REQUIRED,
  CONVERTER_UNSUPPORTED,
  ELEMENT_MALFORMED,
  ELEMENT_MISSING,
  ATTRIBUTE_MISSING,
  CONTENT_MISSING,
  CRYPTOGRAPHIC,
  CRYPTOGRAPHIC_NO_MODULE,
  CRYPTOGRAPHIC_UNKNOWN_TRANSFORM,
  ALGORITHM_NOT_SUPPORTED,
  ALGORITHM_WRONG_NAME,
  XML_EXCEPTION,
}

type IXmlError = Record<number, string>;

const xes: IXmlError = {};
xes[XE.NONE] = 'No description';
xes[XE.NULL_REFERENCE] = 'Null reference';
xes[XE.NULL_PARAM] = `'%1' has empty '%2' object`;
xes[XE.DECORATOR_NULL_PARAM] = `Decorator '%1' has empty '%2' parameter`;
xes[XE.COLLECTION_LIMIT] = `Collection of '%1' in element '%2' has wrong amount of items`;
xes[XE.METHOD_NOT_IMPLEMENTED] = 'Method is not implemented';
xes[XE.METHOD_NOT_SUPPORTED] = 'Method is not supported';
xes[XE.PARAM_REQUIRED] = `Required parameter is missing '%1'`;
xes[XE.CONVERTER_UNSUPPORTED] = 'Converter is not supported';
xes[XE.ELEMENT_MALFORMED] = `Malformed element '%1'`;
xes[XE.ELEMENT_MISSING] = `Element '%1' is missing in '%2'`;
xes[XE.ATTRIBUTE_MISSING] = `Attribute '%1' is missing in '%2'`;
xes[XE.CONTENT_MISSING] = `Content is missing in '%1'`;
xes[XE.CRYPTOGRAPHIC] = 'Cryptographic error: %1';
xes[XE.CRYPTOGRAPHIC_NO_MODULE] = 'WebCrypto module is not found';
xes[XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM] = 'Unknown transform %1';
xes[XE.ALGORITHM_NOT_SUPPORTED] = `Algorithm is not supported '%1'`;
xes[XE.ALGORITHM_WRONG_NAME] = `Algorithm wrong name in use '%1'`;
xes[XE.XML_EXCEPTION] = 'XML exception: %1';

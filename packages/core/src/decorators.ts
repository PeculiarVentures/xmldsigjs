import * as CONST from './const.js';
import {
  XmlAttributeType,
  XmlChildElementType,
  XmlContentType,
  XmlElementType,
  XmlSchema,
} from './types.js';

const MAX = 1e9;

function assign(_target: any, ...sources: any[]) {
  const res = _target;
  for (let i = 0; i < sources.length; i++) {
    const obj = sources[i];
    for (const prop in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
        continue;
      }
      res[prop] = obj[prop];
    }
  }
  return res;
}

export function XmlElement(params: XmlElementType) {
  return <TFunction extends new (...args: any[]) => any>(target: TFunction) => {
    const t = target as XmlSchema;

    t.localName = params.localName || (t as any).name;
    t.namespaceURI = params.namespaceURI || t.namespaceURI || null;
    t.prefix = params.prefix || t.prefix || null;
    t.parser = params.parser || t.parser;
    if (t.target !== t) {
      t.items = assign({}, t.items);
    }
    t.target = target;
  };
}

export function XmlChildElement<T>(params: XmlChildElementType<T> = {}) {
  return (target: object, propertyKey: string | symbol) => {
    const t = target.constructor as XmlSchema;
    const key = propertyKey as string;

    if (!t.items) {
      t.items = {};
    }

    if (t.target !== t) {
      t.items = assign({}, t.items);
    }
    t.target = target;

    // Create item configuration based on whether parser is provided
    let itemConfig;
    if (params.parser) {
      itemConfig = {
        parser: params.parser,
        required: params.required || false,
        maxOccurs: params.maxOccurs || MAX,
        minOccurs: params.minOccurs === void 0 ? 0 : params.minOccurs,
        noRoot: params.noRoot || false,
      };
    } else {
      itemConfig = {
        namespaceURI: params.namespaceURI || null,
        required: params.required || false,
        prefix: params.prefix || null,
        defaultValue: params.defaultValue,
        converter: params.converter,
        noRoot: params.noRoot || false,
      };
    }

    // Set the localName for params
    params.localName =
      params.localName || (params.parser && (params.parser as any).localName) || key;

    // Create the final item with all properties
    const items = t.items as NonNullable<typeof t.items>;
    const parserNamespaceURI = params.parser && (params.parser as any).namespaceURI;
    items[key] = {
      ...itemConfig,
      namespaceURI: params.namespaceURI || parserNamespaceURI || null,
      prefix: params.prefix || (params.parser && (params.parser as any).prefix) || null,
      localName: params.localName,
      type: CONST.ELEMENT,
    };

    defineProperty(target, key, params);
  };
}

export function XmlAttribute<T>(
  params: XmlAttributeType<T> = { required: false, namespaceURI: null },
) {
  return (target: object, propertyKey: string) => {
    const t = target.constructor as XmlSchema;
    const key = propertyKey as string;

    if (!params.localName) {
      params.localName = propertyKey as string;
    }

    if (!t.items) {
      t.items = {};
    }

    if (t.target !== t) {
      t.items = assign({}, t.items);
    }
    t.target = target;

    const items = t.items as NonNullable<typeof t.items>;
    items[propertyKey] = params;
    items[propertyKey].type = CONST.ATTRIBUTE;

    defineProperty(target, key, params);
  };
}

export function XmlContent<T>(params: XmlContentType<T> = { required: false }) {
  return (target: object, propertyKey: string) => {
    const t = target.constructor as XmlSchema;
    const key = propertyKey as string;

    if (!t.items) {
      t.items = {};
    }

    if (t.target !== t) {
      t.items = assign({}, t.items);
    }
    t.target = target;

    const items = t.items as NonNullable<typeof t.items>;
    items[propertyKey] = params;
    items[propertyKey].type = CONST.CONTENT;

    defineProperty(target, key, params);
  };
}

function defineProperty(target: any, key: string, params: any) {
  const key2 = `_${key}`;

  const opt = {
    set: function (this: any, v: any) {
      if (this[key2] !== v) {
        this.element = null;
        this[key2] = v;
      }
    },
    get: function (this: any) {
      if (this[key2] === void 0) {
        let defaultValue = params.defaultValue;
        if (params.parser) {
          defaultValue = new params.parser();
          defaultValue.localName = params.localName;
        }
        this[key2] = defaultValue;
      }
      return this[key2];
    },
  };

  // private property
  Object.defineProperty(target, key2, { writable: true, enumerable: false });
  // public property
  Object.defineProperty(target, key, opt);
}

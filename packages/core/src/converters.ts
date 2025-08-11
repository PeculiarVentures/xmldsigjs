import { Convert } from './convert.js';
import { IConverter } from './types.js';

export const XmlBase64Converter: IConverter<Uint8Array> = {
  get: (value: Uint8Array) => {
    if (value) {
      return Convert.ToBase64(value);
    }
    return void 0;
  },
  set: (value: string) => {
    return Convert.FromBase64(value);
  },
};

export const XmlNumberConverter: IConverter<number> = {
  get: (value: number) => {
    if (value) {
      return value.toString();
    }
    return '0';
  },
  set: (value: string) => {
    return Number(value);
  },
};

export const XmlBooleanConverter: IConverter<boolean> = {
  get: (value: boolean) => {
    if (value) {
      return value.toString();
    }
    return 'false';
  },
  set: (value: string) => {
    if (value && value.toLowerCase() === 'true') {
      return true;
    } else {
      return false;
    }
  },
};

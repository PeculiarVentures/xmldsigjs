import { base64, base64url, binary, hex, toUint8Array, utf8 } from "@peculiar/utils";
import { XE, XmlError } from "./error.js";
import type { XmlBufferEncoding } from "./types.js";

// The @peculiar/utils decoders always allocate a new ArrayBuffer, but are typed with ArrayBufferLike.
type Bytes = Uint8Array<ArrayBuffer>;

export class Convert {
  public static ToString(buffer: BufferSource, enc: XmlBufferEncoding = "utf8") {
    const buf = toUint8Array(buffer);
    switch (enc.toLowerCase()) {
      case "utf8":
        return this.ToUtf8String(buf);
      case "binary":
        return this.ToBinary(buf);
      case "hex":
        return this.ToHex(buf);
      case "base64":
        return this.ToBase64(buf);
      case "base64url":
        return this.ToBase64Url(buf);
      default:
        throw new XmlError(XE.CONVERTER_UNSUPPORTED);
    }
  }

  public static FromString(str: string, enc: XmlBufferEncoding = "utf8"): Uint8Array<ArrayBuffer> {
    switch (enc.toLowerCase()) {
      case "utf8":
        return this.FromUtf8String(str);
      case "binary":
        return this.FromBinary(str);
      case "hex":
        return this.FromHex(str);
      case "base64":
        return this.FromBase64(str);
      case "base64url":
        return this.FromBase64Url(str);
      default:
        throw new XmlError(XE.CONVERTER_UNSUPPORTED);
    }
  }

  public static ToBase64(buf: Uint8Array): string {
    return base64.encode(buf);
  }

  /**
   * Decodes Base64 text. Whitespace is ignored and missing padding is accepted, as in XML Schema base64Binary values.
   * @throws {TypeError} The text is not Base64
   */
  public static FromBase64(base64Text: string): Uint8Array<ArrayBuffer> {
    return base64.decode(base64.pad(base64Text.replace(/\s/g, ""))) as Bytes;
  }

  /**
   * Decodes Base64Url text, with or without padding.
   * @throws {TypeError} The text is not Base64Url
   */
  public static FromBase64Url(base64url: string): Uint8Array<ArrayBuffer> {
    return base64urlDecode(base64url.replace(/\s/g, ""));
  }

  public static ToBase64Url(data: Uint8Array): string {
    return base64url.encode(data);
  }

  public static FromUtf8String(text: string): Uint8Array<ArrayBuffer> {
    return utf8.encode(text) as Bytes;
  }

  /**
   * Decodes UTF-8 bytes. Invalid sequences become U+FFFD.
   */
  public static ToUtf8String(buffer: Uint8Array): string {
    return utf8.decode(buffer);
  }

  public static FromBinary(text: string): Uint8Array<ArrayBuffer> {
    return binary.decode(text) as Bytes;
  }

  public static ToBinary(buffer: Uint8Array): string {
    return binary.encode(buffer);
  }

  /**
   * Converts buffer to HEX string
   * @param  {BufferSource} buffer Incoming buffer
   * @returns string
   */
  public static ToHex(buffer: Uint8Array): string {
    return hex.encode(buffer);
  }

  /**
   * Converts HEX string to buffer
   *
   * @static
   * @param {string} hexString
   * @returns {Uint8Array}
   * @throws {TypeError} The text has an odd length or a character that is not hexadecimal
   *
   * @memberOf Convert
   */
  public static FromHex(hexString: string): Uint8Array<ArrayBuffer> {
    return hex.decode(hexString) as Bytes;
  }

  /**
   * Converts string to Date
   *
   * @static
   * @param {string} dateTime
   * @returns {Date}
   *
   * @memberOf Convert
   */
  public static ToDateTime(dateTime: string): Date {
    return new Date(dateTime);
  }

  /**
   * Converts Date to string
   *
   * @static
   * @param {Date} dateTime
   * @returns {string}
   *
   * @memberOf Convert
   */
  public static FromDateTime(dateTime: Date): string {
    const str = dateTime.toISOString();
    return str;
  }

  protected static Base64Padding(base64: string): string {
    const padCount = 4 - (base64.length % 4);
    if (padCount < 4) {
      for (let i = 0; i < padCount; i++) {
        base64 += "=";
      }
    }
    return base64;
  }
}

function base64urlDecode(text: string): Bytes {
  return base64url.decode(text, { allowPadding: true }) as Bytes;
}

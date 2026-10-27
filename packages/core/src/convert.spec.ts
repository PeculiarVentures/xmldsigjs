import { describe, it, assert } from "vitest";
import { Convert } from "./index.js";

describe("Convert", () => {
  it("DateTime", () => {
    const date = new Date();
    const str = Convert.FromDateTime(date);
    assert.equal(str.length > 0, true);
    const newDate = Convert.ToDateTime(str);
    assert.equal(newDate.getTime(), date.getTime());
  });

  ["utf8", "binary", "hex", "base64", "base64url"].forEach((enc) => {
    [
      new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      Convert.FromString("Привет", "utf8"),
      Convert.FromString("123456789", "binary"),
      Convert.FromString("010203040506070809", "hex"),
      Convert.FromString("Awa=", "base64"),
      Convert.FromString("Aw_=", "base64url"),
    ].forEach((buf) => {
      it(`Encoding ${enc} buf:${Convert.ToString(buf, enc)}`, () => {
        const str = Convert.ToString(buf, enc);
        assert.equal(typeof str, "string");
        const newBuf = Convert.FromString(str, enc);
        assert.equal(
          buf.every((c: number, i: number) => c === newBuf[i]),
          true,
        );
      });
    });
  });

  describe("edge cases", () => {
    it("decodes large UTF-8 buffers", () => {
      const text = "a".repeat(1_000_000);
      assert.equal(Convert.ToUtf8String(Convert.FromUtf8String(text)), text);
    });

    it("replaces invalid UTF-8 and lone surrogates with U+FFFD", () => {
      assert.equal(Convert.ToUtf8String(new Uint8Array([0x61, 0xff, 0x62])), "a\uFFFDb");
      assert.deepEqual(Convert.FromUtf8String("\uD800"), new Uint8Array([0xef, 0xbf, 0xbd]));
    });

    it("reads only the viewed bytes of a DataView", () => {
      const view = new DataView(new Uint8Array([1, 2, 3, 4]).buffer, 1, 2);
      assert.equal(Convert.ToString(view, "hex"), "0203");
    });

    it("accepts whitespace and missing padding in Base64", () => {
      assert.deepEqual(Convert.FromBase64(" YW\nJj\tZA "), new Uint8Array([0x61, 0x62, 0x63, 0x64]));
      assert.deepEqual(Convert.FromBase64("YQ"), new Uint8Array([0x61]));
      assert.deepEqual(Convert.FromBase64(""), new Uint8Array());
    });

    it("rejects text that is not Base64", () => {
      assert.throws(() => Convert.FromBase64("@@@@"), TypeError);
      assert.throws(() => Convert.FromBase64("YWJjZ"), TypeError);
    });

    it("decodes Base64Url with and without padding", () => {
      assert.deepEqual(Convert.FromBase64Url("_-8"), new Uint8Array([0xff, 0xef]));
      assert.deepEqual(Convert.FromBase64Url("_-8="), new Uint8Array([0xff, 0xef]));
      assert.throws(() => Convert.FromBase64Url("+/8"), TypeError);
    });

    it("rejects hex with an odd length or invalid characters", () => {
      assert.deepEqual(Convert.FromHex("0A:0b"), new Uint8Array([0x0a, 0x0b]));
      assert.throws(() => Convert.FromHex("abc"), TypeError);
      assert.throws(() => Convert.FromHex("zz"), TypeError);
    });
  });
});

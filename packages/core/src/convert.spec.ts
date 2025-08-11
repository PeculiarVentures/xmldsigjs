import { describe, it, assert } from 'vitest';
import { Convert } from './index.js';

describe('Convert', () => {
  it('DateTime', () => {
    const date = new Date();
    const str = Convert.FromDateTime(date);
    assert.equal(str.length > 0, true);
    const newDate = Convert.ToDateTime(str);
    assert.equal(newDate.getTime(), date.getTime());
  });

  ['utf8', 'binary', 'hex', 'base64', 'base64url'].forEach((enc) => {
    [
      new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      Convert.FromString('Привет', 'utf8'),
      Convert.FromString('123456789', 'binary'),
      Convert.FromString('010203040506070809', 'hex'),
      Convert.FromString('Awa=', 'base64'),
      Convert.FromString('Aw_=', 'base64url'),
    ].forEach((buf) => {
      it(`Encoding ${enc} buf:${Convert.ToString(buf, enc)}`, () => {
        const str = Convert.ToString(buf, enc);
        assert.equal(typeof str, 'string');
        const newBuf = Convert.FromString(str, enc);
        assert.equal(
          buf.every((c: number, i: number) => c === newBuf[i]),
          true,
        );
      });
    });
  });
});

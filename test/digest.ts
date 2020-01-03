import * as assert from "assert";
import * as xmldsig from "../src";

context("Digest", () => {

  const vector = {
    data: new Uint8Array([116, 101, 115, 116]), // "test"
    algs: {
      "SHA-1": "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3",
      "SHA-256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      "SHA-384": "768412320f7b0aa5812fce428dc4706b3cae50e02a64caa16a782249bfe8efc4b7ef1ccb126255d196047dfedf17a0a9",
      "SHA-512": "ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff",
    },
  };

  function getIncomingData() {
    return {
      String: "test",
      ArrayBuffer: vector.data.buffer,
      Uint8Array: vector.data,
      Uint16Array: new Uint16Array(vector.data.buffer),
      Uint32Array: new Uint32Array(vector.data.buffer),
    };
  }

  // length
  [
    "SHA-1",
    "SHA-256",
    "SHA-384",
    "SHA-512",
  ].forEach((alg) => {

    context(alg, () => {
      const dataList = getIncomingData();
      for (const type in dataList) {
        const data = dataList[type];
        it(type, async () => {

          const sha = xmldsig.CryptoConfig.GetHashAlgorithm(alg);
          const hash = await sha.Digest(data);

          assert.equal(Buffer.from(hash).toString("hex").toLowerCase(), vector.algs[alg]);
        });
      }
    });
  });
});

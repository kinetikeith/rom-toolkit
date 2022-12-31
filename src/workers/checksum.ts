import { expose } from "comlink";
import { Buffer } from "buffer";

import crc32 from "crc/crc32";
import md5 from "md5";
import jsSHA from "jssha";

const checksum = {
  getCrc32(buffer: Buffer) {
    return crc32(buffer);
  },
  getMd5(buffer: Buffer) {
    return md5(buffer);
  },
  getSha1(buffer: Buffer) {
    const sha1Obj = new jsSHA("SHA-1", "UINT8ARRAY");
    sha1Obj.update(buffer);
    return sha1Obj.getHash("HEX");
  },
  getSha256(buffer: Buffer) {
    const sha256Obj = new jsSHA("SHA-256", "UINT8ARRAY");
    sha256Obj.update(buffer);
    return sha256Obj.getHash("HEX");
  },
};

export type Checksum = typeof checksum;

expose(checksum);

import { expose } from "comlink";
import { Buffer } from "buffer";

import crc32 from "crc/calculators/crc32";
import md5 from "md5";
import { sha1, sha256 } from "sha.js";

const checksumInterface = {
  getCrc32(buffer: Buffer) {
    return crc32(buffer);
  },
  getMd5(buffer: Buffer) {
    return md5(buffer);
  },
  getSha1(buffer: Buffer) {
    return new sha1().update(buffer).digest("hex");
  },
  getSha256(buffer: Buffer) {
    return new sha256().update(buffer).digest("hex");
  },
};

export type ChecksumInterface = typeof checksumInterface;

expose(checksumInterface);

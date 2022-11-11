import { Buffer } from "buffer";

const logoBufferValid = Buffer.from(
  "CEED6666CC0D000B03730083000C000D" +
    "0008111F8889000EDCCC6EE6DDDDD999" +
    "BBBB67636E0EECCCDDDC999FBBB9333E",
  "hex"
);

const logoBufferClear = Buffer.alloc(48);

function iMask(x: number, y: number): [number, number] {
  const xWrapped = x % 48;
  const yWrapped = y % 8;
  const byteI =
    ((xWrapped & 0b0111100) >>> 1) +
    ((yWrapped & 0b00000010) >>> 1) +
    (yWrapped & 0b00000100) * 6;

  const bitI = (x & 0b011) + ((y & 0b001) << 2);
  const mask = 128 >>> bitI;

  return [byteI, mask];
}

export default class GbLogo {
  _buffer: Buffer;
  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  get isValid() {
    return this._buffer.equals(logoBufferValid);
  }

  get pixelArray(): Array<boolean> {
    let pixelArray = Array<boolean>(384).fill(false);
    this.eachPixel((x, y, value) => {
      pixelArray[x + y * 48] = value;
    });

    return pixelArray;
  }

  eachPixel(func: (x: number, y: number, value: boolean) => any) {
    let byteI = 0;
    for (const byte of this._buffer.values()) {
      const globalX = ((byteI >> 1) % 12) * 4;
      const globalY = ((byteI & 0b001) << 1) + ((byteI / 24) << 2);

      for (let bitI = 0; bitI < 8; bitI++) {
        const localX = bitI & 0b011;
        const localY = bitI >> 2;

        const x = globalX + localX;
        const y = globalY + localY;

        const mask = 128 >> bitI;
        func(x, y, (byte & mask) !== 0);
      }

      // Update enumerator
      byteI++;
    }
  }

  setPixel(x: number, y: number, value: boolean) {
    const [byteI, mask] = iMask(x, y);
    let byte = this._buffer.readUInt8(byteI);
    byte = value ? (byte |= mask) : (byte &= ~mask);
    this._buffer.writeUInt8(byte);
  }

  togglePixel(x: number, y: number) {
    const [byteI, mask] = iMask(x, y);
    let byte = this._buffer.readUInt8(byteI);
    byte ^= mask;
    this._buffer.writeUInt8(byte, byteI);
  }

  invert() {
    let byteI = 0;
    for (const byte of this._buffer.values()) {
      this._buffer.writeUInt8(byte ^ 0xff, byteI);
      byteI++;
    }
  }

  makeClear() {
    logoBufferClear.copy(this._buffer);
  }

  makeValid() {
    logoBufferValid.copy(this._buffer);
  }

  get ascii() {
    let lines = Array.from(Array(8), () => " ".repeat(48));

    this.eachPixel((x, y, value) => {
      if (value) {
        const line = lines[y];
        lines[y] = line.substring(0, x) + "@" + line.substring(x + 1, 48);
      }
    });
    return lines.join("\n");
  }

  copy() {
    return new GbLogo(Buffer.from(this._buffer));
  }

  static fromRom(buffer: Buffer) {
    return new GbLogo(buffer.subarray(0x0104, 0x0134));
  }
}

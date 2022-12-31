export function asHexRaw(value: number | undefined, width: number = 2): string {
  if (value === undefined) return "Unknown";
  if (Number.isNaN(value)) return "Unknown";

  return value.toString(16).slice(-width).toUpperCase().padStart(width, "0");
}

export function asHex(value: number | undefined, width: number = 2) {
  if (value === undefined) return "Unknown";
  if (Number.isNaN(value)) return "Unknown";

  return "0x" + asHexRaw(value, width);
}

const base1024 = Math.log(1024);
const units: { [index: number]: { name: string; div: number } } = {
  0: { name: "B", div: 1 },
  1: { name: "KiB", div: 1024 },
  2: { name: "MiB", div: 1024 * 1024 },
  3: { name: "GiB", div: 1024 * 1024 * 1024 },
  4: { name: "TiB", div: 1024 * 1024 * 1024 * 1024 },
};

export function asBytes(value: number | undefined): string {
  if (value === undefined) return "Unknown";
  const unitIndex = Math.floor(Math.log(value) / base1024);
  let unit = units[unitIndex];

  if (unit === undefined) unit = { name: "B", div: 1 };

  const valueString = (value / unit.div).toFixed(1);

  return valueString + " " + unit.name;
}

export function asMemory(size: number, banks: number): string {
  const bankUnit = banks === 1 ? "bank" : "banks";
  return `${asBytes(size)} (${banks} ${bankUnit})`;
}

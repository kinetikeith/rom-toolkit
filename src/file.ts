import { useEffect } from "react";
import { Buffer } from "buffer";

export function useUpload(
  onUpload: (file: File) => any,
  accept: string[] = []
) {
  const elem = document.createElement("input");
  elem.hidden = true;
  elem.setAttribute("type", "file");
  elem.setAttribute("accept", accept.join(","));

  const onChange = (event: any) => {
    const file = event.target.files?.[0];
    if (file === undefined) return;
    if (file === null) return;

    onUpload(file);
  };

  useEffect(() => {
    document.body.appendChild(elem);
    elem.addEventListener("change", onChange);
    return () => {
      elem.removeEventListener("change", onChange);
      document.body.removeChild(elem);
    };
  });

  const triggerUpload = () => {
    elem.click();
  };

  return triggerUpload;
}

export function useDownload(
  name: string,
  data: Buffer | ArrayBuffer,
  mimeType: string = "application/octet-stream"
) {
  const cleanData = Buffer.from(data);
  const dataUrl = `data:${mimeType};base64,` + cleanData.toString("base64");
  const elem = document.createElement("a");
  elem.setAttribute("download", name);
  elem.setAttribute("href", dataUrl);

  useEffect(() => {
    document.body.appendChild(elem);

    return () => {
      document.body.removeChild(elem);
    };
  });

  const triggerDownload = () => {
    elem.click();
  };

  return triggerDownload;
}

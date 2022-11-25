import { useEffect } from "react";
import { Buffer } from "buffer";

function useUploadElem(
  accept: string[],
  multiple: boolean,
  onChange: (event: any) => void
) {
  /* Gnarly react hook for creating hidden file input at top level of document */

  /* Create an input element and set its attributes */
  const elem = document.createElement("input");
  elem.hidden = true;
  elem.setAttribute("type", "file");
  elem.setAttribute("accept", accept.join(","));
  elem.multiple = multiple;

  /* Use an effect to set up and tear down the input element */
  useEffect(() => {
    document.body.appendChild(elem);
    elem.addEventListener("change", onChange);
    return () => {
      elem.removeEventListener("change", onChange);
      document.body.removeChild(elem);
    };
  });

  /* return the upload trigger function */
  return () => {
    elem.click();
  };
}

export function useUpload(
  onUpload: (file: File) => any,
  accept: string[] = []
) {
  /* Handle uploading of a single file */
  const onChange = (event: any) => {
    const file = event.target.files?.[0];
    if (file === undefined) return;
    if (file === null) return;

    onUpload(file);
  };

  const triggerUpload = useUploadElem(accept, false, onChange);

  return triggerUpload;
}

export function useUploads(
  onUpload: (file: File[]) => any,
  accept: string[] = []
) {
  /* Handle uploading of multiple files */
  const onChange = (event: any) => {
    const files = event.target.files;
    if (files === undefined) return;

    onUpload(Array.from(files));
  };

  const triggerUpload = useUploadElem(accept, true, onChange);

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

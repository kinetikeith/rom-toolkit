import { useEffect, useCallback, useRef } from "react";

function useUploadElem(
  accept: string[],
  multiple: boolean,
  onChange: (event: any) => void
) {
  /* Gnarly react hook for creating hidden file input at top level of document.
   * Use the greatest of care to ensure that this does not get refreshed
   * between the calling of clickFunc and when a file is selected. */
  const elemRef = useRef<HTMLElement>();

  /* Use an effect to set up and tear down the input element */
  useEffect(() => {
    /* Create an input element and set its attributes */
    const elem = document.createElement("input");
    elem.hidden = true;
    elem.setAttribute("type", "file");
    elem.setAttribute("accept", accept.join(","));
    elem.multiple = multiple;

    document.body.appendChild(elem);
    elem.addEventListener("change", onChange);

    elemRef.current = elem;

    return () => {
      elem.removeEventListener("change", onChange);
      document.body.removeChild(elem);
    };
  }, [accept, multiple, onChange]);

  const clickFunc = useCallback(() => {
    if (elemRef.current !== undefined) elemRef.current.click();
  }, []);

  /* return the upload trigger function */
  return clickFunc;
}

export function useUpload(
  onUpload: (file: File) => any,
  accept: string[] = []
) {
  /* Handle uploading of a single file */
  const onChange = useCallback(
    (event: any) => {
      const file = event.target.files?.[0];
      if (file === undefined) return;
      if (file === null) return;

      onUpload(file);
    },
    [onUpload]
  );

  const triggerUpload = useUploadElem(accept, false, onChange);

  return triggerUpload;
}

export function useUploads(
  onUpload: (file: File[]) => any,
  accept: string[] = []
) {
  /* Handle uploading of multiple files */
  const onChange = useCallback(
    (event: any) => {
      const files = event.target.files;
      if (files === undefined) return;

      onUpload(Array.from(files));
    },
    [onUpload]
  );

  const clickFunc = useUploadElem(accept, true, onChange);

  return clickFunc;
}

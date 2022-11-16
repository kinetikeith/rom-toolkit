import { useState } from "react";

interface Wrapper<Type> {
  value: Type;
}

function wrap<Type>(obj: Type): Wrapper<Type> {
  return { value: obj };
}

type UpdateFunc<Type> = (oldObj: Type) => (Type | void);
export type UpdateArg<Type> = UpdateFunc<Type> | Type;

type UseWrapFunc<Type> = (value?: UpdateArg<Type>) => void;

export function useWrap<Type>(obj: Type): [Type, UseWrapFunc<Type>] {
  const [wrappedState, setWrappedState] = useState<Wrapper<Type>>(wrap(obj));
  function updateValue(value?: UpdateArg<Type>) {
    if (value === undefined) {
      setWrappedState(wrap(wrappedState.value));
    } else if (value instanceof Function) {
      const newObj = value(wrappedState.value);
      if (newObj === undefined) {
        setWrappedState(wrap(wrappedState.value));
      } else {
        setWrappedState(wrap(newObj));
      }
    } else {
      setWrappedState(wrap(value));
    }
  }
  return [wrappedState.value, updateValue];
}

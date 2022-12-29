import { useState } from "react";

interface Wrapper<Type> {
  value: Type;
}

function wrap<Type>(value: Type): Wrapper<Type> {
  return { value: value };
}

type UpdateFunc<Type> = (oldObj: Type) => Type | void;
export type UpdateArg<Type> = UpdateFunc<Type> | Type;

type UseWrapFunc<Type> = (value?: UpdateArg<Type>) => Type;

export function useWrap<Type>(v: Type): [Type, UseWrapFunc<Type>] {
  const [wrappedState, setWrappedState] = useState<Wrapper<Type>>(wrap(v));
  function updateValue(value?: UpdateArg<Type>): Type {
    if (value === undefined) {
      setWrappedState(wrap(wrappedState.value));
      return wrappedState.value;
    } else if (value instanceof Function) {
      const newValue = value(wrappedState.value);
      if (newValue === undefined) {
        setWrappedState(wrap(wrappedState.value));
        return wrappedState.value;
      } else {
        setWrappedState(wrap(newValue));
        return newValue;
      }
    } else {
      setWrappedState(wrap(value));
      return value;
    }
  }
  return [wrappedState.value, updateValue];
}

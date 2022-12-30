export default function cached<Type>(getter: () => Type): () => Type {
  let cachedValue: Type | undefined = undefined;

  const getterCached = () => {
    if (cachedValue === undefined) {
      cachedValue = getter();
      return cachedValue;
    } else return cachedValue;
  };

  return getterCached;
}

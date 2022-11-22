export type IsUniqueWithProp<
  Prop extends string,
  A extends readonly unknown[]
> = A extends readonly [infer X, ...infer Rest]
  ? Rest[number] extends { [key in Prop]: infer RestKind }
    ? X extends { [key in Prop]: infer XKind }
      ? RestKind extends XKind
        ? false
        : IsUniqueWithProp<Prop, Rest>
      : false
    : false
  : true;

export type UniqueArrayWithProp<
  Prop extends string,
  A extends readonly unknown[]
> = IsUniqueWithProp<Prop, A> extends true ? A : never;

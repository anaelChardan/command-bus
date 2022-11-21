export type Command<R, K extends string, P extends {}> = {
  kind: K;
  payload: P;

  // NOT_USED_AT_ALL_IS_TO_KEEP_R_AT_COMPILE_TIME
  _returnType?: R;
};

export type CommandReturnType<Type> = Type extends Command<infer R, infer _K, infer _P>
  ? R
  : never;
export type CommandKind<Type> = Type extends Command<infer _R, infer K, infer _P>
  ? K
  : never;

export type CommandPayload<Type> = Type extends Command<
  infer _R,
  infer _K,
  infer P
>
  ? P
  : never;

export type CommandType<TCommand> = Command<
  CommandReturnType<TCommand>,
  CommandKind<TCommand>,
  CommandPayload<TCommand>
>;

// type Toto = Command<{ hasEdited: boolean}, "toto", { toto: string }>;
// type TotoReturnType = CommandReturnType<Toto>;
// type TotoKind = CommandKind<Toto>;
// type TotoPayload = CommandPayload<Toto>;

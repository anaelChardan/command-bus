import { CommandReturnType, CommandType } from "./command";
import { createMiddlewareChain } from "./middleware/chain";
import { Middleware } from "./middleware/types";
import { result as R } from "@dev-spendesk/general-type-helpers";
import { AnyCommandHandler } from "./handler";
import { Logger } from "./logger";

export type CommandBus = {
  handle<TCommand extends CommandType<TCommand>>(
    command: TCommand
  ): Promise<BusResult<TCommand>>;
};

type BusResult<TCommand extends CommandType<TCommand>> = R.Result<
  | { outcome: "NO_NEXT_MIDDLEWARE"; from: string }
  | { outcome: "NO_HANDLER_FOUND"; commandKind: string },
  CommandReturnType<TCommand>
>;

export function buildCommandBus<Handlers extends AnyCommandHandler[], Middlewares extends Middleware[]>(
  handlers: UniqueArrayWithProp<"handledCommandKind", Handlers>,
  middlewares: UniqueArrayWithProp<"name", Middlewares>,
  logger: Logger
): CommandBus {
  const middlewareChain = createMiddlewareChain(handlers, middlewares, logger);

  async function handle<TCommand extends CommandType<TCommand>>(
    command: TCommand
  ): Promise<BusResult<TCommand>> {
    return middlewareChain.apply(command);
  }

  return {
    handle,
  };
}

type IsUniqueWithProp<
  Prop extends string,
  A extends readonly unknown[]
> = A extends readonly [infer X, ...infer Rest]
  ? Rest[number] extends { [key in Prop]: infer RestProp }
    ? X extends { [key in Prop]: infer XProp }
      ? RestProp extends XProp
        ? false
        : IsUniqueWithProp<Prop, Rest>
      : false
    : false
  : true;

type UniqueArrayWithProp<
  Prop extends string,
  A extends readonly unknown[]
> = IsUniqueWithProp<Prop, A> extends true ? A : never;

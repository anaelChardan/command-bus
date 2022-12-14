import { CommandReturnType, CommandType } from "./command";
import { createMiddlewareChain } from "./middleware/chain";
import { Middleware } from "./middleware/types";
import { result as R, nonEmptyArray as NEA } from "./utils";
import { AnyCommandHandler } from "./handler";
import { Logger } from "./logger";
import { UniqueArrayWithProp } from "./utils/isUniqueWithProp";

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

export function buildCommandBus<
  Handlers extends NEA.NonEmptyArray<AnyCommandHandler>,
  Middlewares extends Middleware[]
>(
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
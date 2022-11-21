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

export function buildCommandBus(
  handlers: AnyCommandHandler[],
  middlewares: Middleware[],
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

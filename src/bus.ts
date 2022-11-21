import { CommandReturnType, CommandType } from "./command";
import { createMiddlewareChain } from "./middleware/chain";
import { Middleware } from "./middleware/types";
import { result as R } from "@dev-spendesk/general-type-helpers";
import { AnyCommandHandler } from "./handler";
import { Logger } from "./logger";

export type CommandBus = {
  handle<TCommand extends CommandType<TCommand>>(
    command: TCommand
  ): Promise<CommandReturnType<TCommand>>;
};

export function buildCommandBus(
  handlers: AnyCommandHandler[],
  middlewares: Middleware[],
  logger: Logger
): CommandBus {
  const middlewareChain = createMiddlewareChain(handlers, middlewares, logger);

  async function handle<TCommand extends CommandType<TCommand>>(
    command: TCommand
  ): Promise<CommandReturnType<TCommand>> {
    const result = await middlewareChain.apply(command);

    if (R.isFailure(result)) {
      throw new Error(`Command handling ${command.kind} failed`);
    }

    return result.value;
  }

  return {
    handle,
  };
}

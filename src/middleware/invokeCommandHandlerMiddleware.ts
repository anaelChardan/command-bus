import { CommandType } from "../command";
import { Middleware, MiddlewareResult } from "./types";
import { result as R } from "../utils";
import {
  AnyCommandHandler,
  CommandHandler,
  isTheRightHandler,
} from "../handler";
import { Logger } from "../logger";

export function buildInvokeCommandHandlerMiddleware(
  logger: Logger,
  handlers: AnyCommandHandler[]
): Middleware {
  async function intercept<TCommand extends CommandType<TCommand>>(
    command: TCommand
  ): Promise<MiddlewareResult<TCommand>> {
    logger.info("InvokeCommandHandlerMiddleware: trying to handle", {
      command,
    });

    const handler = findHandler(handlers, command);

    if (!handler) {
      return R.toFailure({
        outcome: "NO_HANDLER_FOUND",
        commandKind: command.kind,
      });
    }

    const result = await handler.handle(command);

    return R.toSuccess(result);
  }

  return {
    intercept,
    name: "invokeCommandHandlerMiddleware",
  };
}

function findHandler<TCommand extends CommandType<TCommand>>(
  handlers: AnyCommandHandler[],
  command: TCommand
): CommandHandler<TCommand> | undefined {
  if (!handlers) {
    return undefined;
  }

  // O(N) complexity by is doing type inference on each handler
  for (const handler of handlers) {
    if (isTheRightHandler(handler, command)) {
      return handler;
    }
  }

  return undefined;
}

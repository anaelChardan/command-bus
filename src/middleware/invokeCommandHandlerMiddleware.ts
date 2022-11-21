import { CommandType } from "../command";
import { Middleware, MiddlewareResult } from "./types";
import { result as R } from "@dev-spendesk/general-type-helpers";
import {
  AnyCommandHandler,
  CommandHandler,
  isTheRightHandler,
} from "../handler";

export function buildInvokeCommandHandlerMiddleware(
  handlers: AnyCommandHandler[]
): Middleware {
  async function intercept<TCommand extends CommandType<TCommand>>(
    command: TCommand,
    _next?: (command: TCommand) => Promise<MiddlewareResult<TCommand>>
  ): Promise<MiddlewareResult<TCommand>> {
    console.log("INVOKING")
    const handler = findHandler(handlers, command);

    if (!handler) {
      throw new Error(`No handler found for command ${command.kind}`);
    }

    const result = await handler.handle(command);

    return R.toSuccess(result);
  }

  return {
    intercept,
  };
}

function findHandler<TCommand extends CommandType<TCommand>>(
  handlers: AnyCommandHandler[],
  command: TCommand
): CommandHandler<TCommand> | undefined {
  if (!handlers) {
    return undefined;
  }

  for (const handler of handlers) {
    if (isTheRightHandler(handler, command)) {
      return handler;
    }
  }

  return undefined;
}

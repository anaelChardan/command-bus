import { CommandType } from "../command";
import { Middleware, MiddlewareResult } from "./types";
import { result as R } from "@dev-spendesk/general-type-helpers";
import { buildInvokeCommandHandlerMiddleware } from "./invokeCommandHandlerMiddleware";
import {
  AnyCommandHandler,
} from "../handler";

export type Chain = {
  apply<TCommand extends CommandType<TCommand>>(
    command: TCommand
  ): Promise<MiddlewareResult<TCommand>>;
  next?: Chain;
};

export function buildChain(current: Middleware, next?: Chain): Chain {
  async function apply<TCommand extends CommandType<TCommand>>(
    command: TCommand
  ): Promise<MiddlewareResult<TCommand>> {
    const result = current.intercept(
      command,
      next !== undefined
        ? async () => next.apply(command)
        : async () => R.toFailure({ outcome: "NO_NEXT_MIDDLEWARE" })
    );
    return result;
  }

  return {
    apply,
  };
}

export function finalChain(
  handlers: AnyCommandHandler[]
): Chain {
  return buildChain(buildInvokeCommandHandlerMiddleware(handlers));
}

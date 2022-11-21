import { CommandType } from "../command";
import { Middleware, MiddlewareResult } from "./types";
import { result as R } from "@dev-spendesk/general-type-helpers";
import { buildInvokeCommandHandlerMiddleware } from "./invokeCommandHandlerMiddleware";
import { AnyCommandHandler } from "../handler";
import { Logger } from "../logger";

export type Chain = {
  apply<TCommand extends CommandType<TCommand>>(
    command: TCommand
  ): Promise<MiddlewareResult<TCommand>>;
  next?: Chain;
};

function buildChain(logger: Logger, current: Middleware, next?: Chain): Chain {
  async function apply<TCommand extends CommandType<TCommand>>(
    command: TCommand
  ): Promise<MiddlewareResult<TCommand>> {
    logger.info("Chain: building chain", {});
    const result = current.intercept(
      command,
      next !== undefined
        ? async () => next.apply(command)
        : async () =>
            R.toFailure({ outcome: "NO_NEXT_MIDDLEWARE", from: current.name })
    );
    return result;
  }

  return {
    apply,
  };
}

function finalChain(logger: Logger, handlers: AnyCommandHandler[]): Chain {
  return buildChain(
    logger,
    buildInvokeCommandHandlerMiddleware(logger, handlers),
    undefined
  );
}

export function createMiddlewareChain(
  handlers: AnyCommandHandler[],
  middlewares: Middleware[],
  logger: Logger
): Chain {
  return middlewares.reduceRight((chain: Chain, middleware: Middleware) => {
    return buildChain(logger, middleware, chain);
  }, finalChain(logger, handlers));
}

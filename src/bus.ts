import { CommandReturnType, CommandType } from "./command";
import { buildChain, Chain, finalChain } from "./middleware/chain";
import { Middleware } from "./middleware/types";
import { result as R } from "@dev-spendesk/general-type-helpers";
import { AnyCommandHandler } from "./handler";


type CommandBus = {
  handle<TCommand extends CommandType<TCommand>>(
    command: TCommand
  ): Promise<CommandReturnType<TCommand>>;
};

export function buildCommandBus(
  handlers: AnyCommandHandler[],
  middlewares: Middleware[]
): CommandBus {
  const middlewareChain: Chain = middlewares.reduceRight(
    (chain: Chain, middleware: Middleware) => {
      return buildChain(middleware, chain.next);
    },
    finalChain(handlers)
  );

  console.log(middlewareChain);

  async function handle<
    TCommand extends CommandType<TCommand>
  >(command: TCommand): Promise<CommandReturnType<TCommand>> {
    const result = await middlewareChain.apply(command);

    if (R.isFailure(result)) {
      console.log(result);
      throw new Error(`Command handling ${command.kind} failed`);
    }

    return result.value;
  }

  return {
    handle,
  };
}


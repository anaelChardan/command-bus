import { result as R } from "@dev-spendesk/general-type-helpers";
import { boolean } from "zod";

type CardAggregate = {};

type Success = {
  outcome: "success";
  payload: CardAggregate; // FOR NOW
};

type Failure = {
  outcome: "failure";
};

type CardLimit = {};

type Transaction = {
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
};

type TransactionHelper = {
  startTransaction(): Transaction;
};

type CommandContext = {
  company?: {
    id?: string;
    system?: "prepaid" | "debit";
    bankingProvider?: "marqeta" | "bankable" | "sfs";
  };
  card: {
    id?: string;
    type?: "physical" | "single_purchase" | "subscription";
  };
};

type CommandExtra = {
  transaction?: Transaction;
};

type Command<R> = {
  kind: string;
  context: CommandContext;

  // NOT_USED_AT_ALL_IS_TO_NO_REMOVE_R
  __returnType?: R;
};

type CommandWithExtra<R> = Command<R> & CommandExtra;

type CommandBus = {
  handle<TCommand extends Command<ExtractCommandReturnType<TCommand>>>(
    command: TCommand
  ): Promise<ExtractCommandReturnType<TCommand>>;
};

type Middleware = {
  intercept<TCommand extends Command<ExtractCommandReturnType<TCommand>>>(
    command: TCommand,
    next?: () => Promise<MiddlewareResult<TCommand>>
  ): Promise<MiddlewareResult<TCommand>>;
};

type Chain = {
  apply<TCommand extends Command<ExtractCommandReturnType<TCommand>>>(
    command: TCommand
  ): Promise<MiddlewareResult<TCommand>>;
  next?: Chain;
};

function buildChain(current: Middleware, next?: Chain): Chain {
  async function apply<TCommand extends Command<ExtractCommandReturnType<TCommand>>>(
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

async function nextMiddleware<
  TCommand extends CommandWithExtra<ExtractCommandReturnType<TCommand>>
>(
  command: TCommand,
  next?: (command: TCommand) => Promise<MiddlewareResult<TCommand>>
): Promise<
  R.Result<{ outcome: "NO_NEXT_MIDDLEWARE" }, ExtractCommandReturnType<TCommand>>
> {
  if (!next) {
    return R.toFailure({ outcome: "NO_NEXT_MIDDLEWARE" });
  }

  const result = await next(command);

  return result;
}

type Logger = {
  info(message: string, meta?: any): void;
};

type MiddlewareResult<
  TCommand extends Command<ExtractCommandReturnType<TCommand>>
> = R.Result<{ outcome: "NO_NEXT_MIDDLEWARE" }, ExtractCommandReturnType<TCommand>>;

function buildLogCardInfoMiddleware(logger: Logger): Middleware {
  async function intercept<
    TCommand extends CommandWithExtra<ExtractCommandReturnType<TCommand>>
  >(
    command: TCommand,
    next?: (command: TCommand) => Promise<MiddlewareResult<TCommand>>
  ): Promise<MiddlewareResult<TCommand>> {
    logger.info(`Command ${command.kind} received`, command);

    const result = await nextMiddleware(command, next);

    logger.info(`Command ${command.kind} finished`, result);

    return result;
  }

  return {
    intercept,
  };
}

type CommandRegistry = {
  editCardLimits: EditCardLimitsCommandHandler;
  cancelCard: CancelCardCommandHandler;
};

function buildInvokeCommandHandlerMiddleware(
  handlers: CommandRegistry
): Middleware {
  async function intercept<
    TCommand extends Command<ExtractCommandReturnType<TCommand>>
  >(
    command: TCommand,
    next?: (command: TCommand) => Promise<MiddlewareResult<TCommand>>
  ): Promise<MiddlewareResult<TCommand>> {
    const handler = handlers[command.kind as keyof CommandRegistry];

    if (!handler) {
      throw new Error(`No handler found for command ${command.kind}`);
    }

    const result = await handler.handle(command as any);

    return R.toSuccess(result as ExtractCommandReturnType<TCommand>);
  }

  return {
    intercept,
  };
}

function finalChain(handlers: CommandRegistry): Chain {
  return buildChain(buildInvokeCommandHandlerMiddleware(handlers));
}

function buildCardCommandBus(
  handlers: CommandRegistry,
  middlewares: Middleware[]
): CommandBus {
  const middlewareChain: Chain = middlewares.reduceRight(
    (chain: Chain, middleware: Middleware) => {
      return buildChain(middleware, chain.next);
    },
    finalChain(handlers)
  );

  async function handle<
    TCommand extends Command<ExtractCommandReturnType<TCommand>>
  >(command: TCommand): Promise<ExtractCommandReturnType<TCommand>> {
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

interface EditCardLimitsCommand extends Command<{ hasEdited: boolean }> {
  kind: "editCardLimits";
  context: CommandContext;
  payload: {
    cardId: string;
    limits: CardLimit[];
  };
}

type ExtractCommandReturnType<Type> = Type extends Command<infer X> ? X : never;

interface CommandHandlerI<
  TCommand extends Command<ExtractCommandReturnType<TCommand>>
> {
  handle(command: TCommand): Promise<ExtractCommandReturnType<TCommand>>;
}

type EditCardLimitsCommandHandler = CommandHandlerI<EditCardLimitsCommand>;

function buildEditCardLimitsHandler(): EditCardLimitsCommandHandler {
  async function handle(
    command: EditCardLimitsCommand
  ): Promise<{ hasEdited: boolean }> {
    // DO WHATEVER WE WANT like start and persist state machine

    return {
      hasEdited: true,
    };
  }

  return {
    handle,
  };
}

type CancelCardCommand = Command<{ hasCancelled: boolean}> & {
  kind: "cancelCard";
  context: CommandContext;
  payload: {
    cardId: string
  }
};
type CancelCardCommandHandler = CommandHandlerI<CancelCardCommand>;
function buildCancelCardHandler(): CancelCardCommandHandler {
  async function handle(
    command: CancelCardCommand
  ): Promise<{ hasCancelled: boolean }> {
    // DO WHATEVER WE WANT like start and persist state machine

    return {
      hasCancelled: true,
    };
  }

  return {
    handle,
  };
}

const editCardLimitsHandler = buildEditCardLimitsHandler();
const cancelCardHandler = buildCancelCardHandler();
export const cardCommandBus = buildCardCommandBus(
  {
    editCardLimits: editCardLimitsHandler,
    cancelCard: cancelCardHandler
  },
  [buildLogCardInfoMiddleware(console)]
);

const editCardLimits: EditCardLimitsCommand = {
  kind: "editCardLimits" as const,
  context: {
    card: {
      id: "cardId",
    },
  },
  payload: {
    cardId: "1234",
    limits: [],
  },
};

const cancelCard: CancelCardCommand = {
  kind: "cancelCard" as const,
  context: {
    card: {
      id: "cardId",
    },
  },
  payload: {
    cardId: "1234",
  },
}

async function test() {
  const result = await cardCommandBus.handle(editCardLimits);
  const cancelCardResult = await cardCommandBus.handle(cancelCard);
}


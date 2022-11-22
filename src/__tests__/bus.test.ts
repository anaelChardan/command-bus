import { CommandHandler } from "..";
import {
  buildCommandBus,
  Command,
  CommandType,
  Middleware,
  MiddlewareResult,
  nextMiddleware,
} from "../";
import { Logger } from "../logger";
import { result as R } from "../utils";

type EditCardLimitsCommand = Command<
  { hasEdited: boolean },
  "editCardLimits",
  { cardId: string; limits: number[] }
>;
type EditCardLimitsCommandHandler = CommandHandler<EditCardLimitsCommand>;
type CancelCardCommand = Command<
  { hasCancelled: boolean },
  "cancelCard",
  { cardId: string }
>;
type CancelCardCommandHandler = CommandHandler<CancelCardCommand>;

function buildEditCardLimitsHandler(): EditCardLimitsCommandHandler {
  async function handle(
    _command: EditCardLimitsCommand
  ): Promise<{ hasEdited: boolean }> {
    // DO WHATEVER WE WANT like start and persist state machine

    return {
      hasEdited: true,
    };
  }

  return {
    handle,
    handledCommandKind: "editCardLimits",
  };
}

const logger: Logger = {
  debug(message: string, data?: object) {
    console.debug(message, data);
  },
  info(message: string, data?: object) {
    console.info(message, data);
  },
  warn(message: string, data?: object) {
    console.warn(message, data);
  },
  error(message: string, data?: object) {
    console.error(message, data);
  },
};

function buildCancelCardHandler(): CancelCardCommandHandler {
  async function handle(
    _command: CancelCardCommand
  ): Promise<{ hasCancelled: boolean }> {
    // DO WHATEVER WE WANT like start and persist state machine

    return {
      hasCancelled: true,
    };
  }

  return {
    handle,
    handledCommandKind: "cancelCard",
  };
}

const editCardLimitsHandler = buildEditCardLimitsHandler();
const cancelCardCommandHandler = buildCancelCardHandler();

const editCardLimitsCommand: EditCardLimitsCommand = {
  kind: "editCardLimits",
  payload: {
    cardId: "123",
    limits: [1, 2, 3],
  },
};

describe("Commandbus", () => {
  it("should call the command handler", async () => {
    const bus = buildCommandBus([editCardLimitsHandler, cancelCardCommandHandler], [], logger);

    const result = await bus.handle(editCardLimitsCommand);

    expect(result).toEqual(R.toSuccess({ hasEdited: true }));
  });

  it("should call the middlewares", async () => {
    const messages: string[] = [];

    const middlewareOne: Middleware = {
      name: "middlewareOne",
      async intercept<TCommand extends CommandType<TCommand>>(
        command: TCommand,
        next: () => Promise<MiddlewareResult<TCommand>>
      ): Promise<MiddlewareResult<TCommand>> {
        messages.push("middleware one before");
        console.log("middleware one before");

        const result = await nextMiddleware(command, "middlewareOne", next);

        messages.push("middleware one after");
        console.log("middleware one after");

        return result;
      },
    };

    const middlewareTwo: Middleware = {
      name: "middleware two",
      async intercept<TCommand extends CommandType<TCommand>>(
        command: TCommand,
        next: () => Promise<MiddlewareResult<TCommand>>
      ): Promise<MiddlewareResult<TCommand>> {
        messages.push("middleware two before");
        console.log("middleware two before");

        const result = await nextMiddleware(command, "middlewareTwo", next);

        messages.push("middleware two after");
        console.log("middleware two after");

        return result;
      },
    };

    const bus = buildCommandBus(
      [editCardLimitsHandler, cancelCardCommandHandler],
      [middlewareOne, middlewareTwo],
      logger
    );

    await bus.handle(editCardLimitsCommand);

    expect(messages).toEqual([
      "middleware one before",
      "middleware two before",
      "middleware two after",
      "middleware one after",
    ]);
  });
});

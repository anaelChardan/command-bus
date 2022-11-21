import { buildCommandBus } from "../bus";
import { Command, CommandType } from "../command";
import { AnyCommandHandler, CommandHandler } from "../handler";
import { Middleware, MiddlewareResult } from "../middleware/types";
import { nextMiddleware } from "../middleware/nextMiddleware";

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

const handlers: AnyCommandHandler[] = [
  editCardLimitsHandler,
  cancelCardCommandHandler,
];

const editCardLimitsCommand: EditCardLimitsCommand = {
  kind: "editCardLimits",
  payload: {
    cardId: "123",
    limits: [1, 2, 3],
  },
};

describe("Commandbus", () => {
  it("should call the command handler", async () => {
    const bus = buildCommandBus(handlers, []);

    const result = await bus.handle(editCardLimitsCommand);

    expect(result).toEqual({ hasEdited: true });
  });

  it.only("should call the middlewares", async () => {
    const messages: string[] = [];

    const middlewareOne: Middleware = {
      async intercept<TCommand extends CommandType<TCommand>>(
        command: TCommand,
        next?: () => Promise<MiddlewareResult<TCommand>>
      ): Promise<MiddlewareResult<TCommand>> {
        messages.push("middleware one before");
        console.log("middleware one before");

        const result = await nextMiddleware(command, next);

        messages.push("middleware one after");
        console.log("middleware one after");

        return result;
      },
    };

    const middlewareTwo: Middleware = {
      async intercept<TCommand extends CommandType<TCommand>>(
        command: TCommand,
        next?: () => Promise<MiddlewareResult<TCommand>>
      ): Promise<MiddlewareResult<TCommand>> {
        messages.push("middleware two before");
        console.log("middleware two before");

        const result = await nextMiddleware(command, next);

        messages.push("middleware two after");
        console.log("middleware two after");

        return result;
      },
    };

    const bus = buildCommandBus(handlers, [middlewareOne, middlewareTwo]);

    await bus.handle(editCardLimitsCommand);

    expect(messages).toEqual([
      "middleware one before",
      "middleware two before",
      "middleware two after",
      "middleware one after",
    ]);
  });
});

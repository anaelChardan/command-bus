# Command bus

Definition:

Here is a strongly typed `command-bus`

## Example

Let's consider an example

```ts
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
    // DO WHATEVER YOU LIKE

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
    // DO WHATEVER YOU LIKE

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

const bus = buildCommandBus(handlers, []);


// THIS IS STRONGLY TYPED!
const result = await bus.handle(editCardLimitsCommand);
```

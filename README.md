# Command bus

## Definition:

Here is a strongly typed `command-bus`

I will quote the good article from [Matthias Noback](https://matthiasnoback.nl/2015/01/a-wave-of-command-buses/);

### What is a command?

Commands are often used in applications that separate the technical aspects of user input from their meaning inside the application. Commands in object-oriented programming are objects, like everything else. A command is literally some kind of an imperative, indicating what behavior a user, or client, expects from the application.


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

const handlers = [
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

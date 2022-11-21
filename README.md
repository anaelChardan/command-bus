# TCommand Bus

Here is a strongly typed `command-bus`

TCommand Bus stands for Typed Command Bus

## Definitions:

I will use the definitions coming from [Matthias Noback](https://matthiasnoback.nl/2015/01/a-wave-of-command-buses/) series of articles;

### What is a command?

Commands are often used in applications that separate the technical aspects of user input from their meaning inside the application. Commands in object-oriented programming are objects, like everything else. A command is literally some kind of an imperative, indicating what behavior a user, or client, expects from the application.

### Who executes the actual command then?

When you use commands to let the user communicate the application's intended behavior, you make the core of your application completely unaware of the world outside. And on top of that, you separate the intended behavior from the actual implementation of that behavior.

The execution will be done thanks to Command Handlers

### Command bus

The command bus eventually calls the command handler which corresponds to the given command object.

The command bus doesn't merely hand over commands to their handlers. Usually it does all kinds of things. For instance a command bus may validate command data, wrap the command handler in a database transaction, provide queueing options for a command, etc.

Usually those things are done thanks to Middleware system. If you're familiar with [express](https://github.com/expressjs/express), a middleware will be applied before and/or after the handling of your command.

## Working with TCommand Bus


You will have to declare, your `Commands`, `Commmand Handlers` and `Middlewares`


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

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

Usually those things are done thanks to **Middleware** system. If you're familiar with [express](https://github.com/expressjs/express), a middleware will be applied before and/or after the handling of your command.

## Working with TCommand Bus

You will have to declare, your `Commands`, `Commmand Handlers` and `Middlewares`

### Command

Here is a command

```ts
type EditCardLimitsCommand = Command<
  { hasEdited: boolean }, // The return type of your command handling
  "editCardLimits", // The name of your command
  { cardId: string; limits: number[] } // The Payload of your command
>;
```

### Command Handler

Here is a command handler

```ts
type EditCardLimitsCommandHandler = CommandHandler<EditCardLimitsCommand>;

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
    handledCommandKind: "editCardLimits", // is enforced by the type of your command handler
  };
}
```

### Middleware

Here is the middleware

```ts
const loggingMiddleware: Middleware = {
  name: "loggingMiddleware",
  async intercept<TCommand extends CommandType<TCommand>>(
    command: TCommand,
    next: () => Promise<MiddlewareResult<TCommand>>
  ): Promise<MiddlewareResult<TCommand>> {
    console.log(`Handling ${command.kind} command`);

    const result = await nextMiddleware(command, "middlewareOne", next);

    console.log(`${command.kind} handled`, { result });

    return result;
  },
};
```

Be careful, in TCommand bus, the middlwares will be executed one after the other in the order you put while instanciating the bus

### And finally the bus!

Let's now instantiate the bus!

```ts
const editCardLimitsHandler = buildEditCardLimitsHandler();
const handlers = [editCardLimitsHandler];
const middlewares = [loggingMiddleware];
// You will need to pass a logger (can be a dummy one) to the command bus
const logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

const bus = buildCommandBus(handlers, middlewares, logger);
```

## Example of usage

As now we have our bus :)

```ts
// The type here is important in order to have the return type
const editCardLimitsCommand: EditCardLimitsCommand = {
  kind: "editCardLimits",
  payload: {
    cardId: "123",
    limits: [1, 2, 3],
  },
};

// THIS IS STRONGLY TYPED!
const result = await bus.handle(editCardLimitsCommand);
```

import {
  Command,
  CommandKind,
  CommandReturnType,
  CommandType,
} from "./command";

export interface CommandHandler<TCommand extends CommandType<TCommand>> {
  handledCommandKind: CommandKind<TCommand>;
  handle(command: TCommand): Promise<CommandReturnType<TCommand>>;
}

export type AnyCommandHandler = CommandHandler<Command<any, any, any>>;

export function isTheRightHandler<
  TCommand extends CommandType<TCommand>,
>(
  handler: AnyCommandHandler,
  command: TCommand
): handler is CommandHandler<TCommand> {
  return command.kind = handler.handledCommandKind;
}

import { CommandReturnType, CommandType } from "../command";
import { result as R } from "../utils";

export type Middleware = {
  name: string;
  intercept<TCommand extends CommandType<TCommand>>(
    command: TCommand,
    next?: () => Promise<MiddlewareResult<TCommand>>
  ): Promise<MiddlewareResult<TCommand>>;
};

export type MiddlewareResult<TCommand extends CommandType<TCommand>> = R.Result<
  | { outcome: "NO_NEXT_MIDDLEWARE"; from: string }
  | { outcome: "NO_HANDLER_FOUND", commandKind: string },
  CommandReturnType<TCommand>
>;

import { CommandReturnType, CommandType } from "../command";
import { result as R } from "@dev-spendesk/general-type-helpers";

export type Middleware = {
  intercept<TCommand extends CommandType<TCommand>>(
    command: TCommand,
    next?: () => Promise<MiddlewareResult<TCommand>>
  ): Promise<MiddlewareResult<TCommand>>;
};

export type MiddlewareResult<
  TCommand extends CommandType<TCommand>
> = R.Result<{ outcome: "NO_NEXT_MIDDLEWARE" }, CommandReturnType<TCommand>>;



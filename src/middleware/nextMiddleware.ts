import { CommandType } from "../command";
import { MiddlewareResult } from "./types";
import { result as R } from "@dev-spendesk/general-type-helpers";

export async function nextMiddleware<
  TCommand extends CommandType<TCommand>
>(
  command: TCommand,
  next?: (command: TCommand) => Promise<MiddlewareResult<TCommand>>
): Promise<
  MiddlewareResult<TCommand>
> {
  if (!next) {
    return R.toFailure({ outcome: "NO_NEXT_MIDDLEWARE" });
  }

  const result = await next(command);

  return result;
}
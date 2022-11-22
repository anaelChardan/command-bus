type Failure<E> = {
  _tag: "failure";
  error: E;
};

type Success<A> = {
  _tag: "success";
  value: A;
};

/**
 * Provides a standard way to represent the result of an operation that can
 * fail, such as a database update, a file read, or even a validation check
 *
 * A type representing either a Success or a Failure, which can both contain
 * values of the type E for the Failure's error, or A for the Success' value,
 * respectively
 */
export type Result<E, A> = Failure<E> | Success<A>;

export const isSuccess = <E, A>(result: Result<E, A>): result is Success<A> =>
  result._tag === "success";

export const isFailure = <E, A>(result: Result<E, A>): result is Failure<E> =>
  result._tag === "failure";

// ************* Constructors ************

/**
 * Lift a value A into a Success<A>
 */
export const toSuccess = <E = never, A = never>(value: A): Result<E, A> => ({
  _tag: "success",
  value,
});

/**
 * Lift an error value E into an Failure<E>
 */
export const toFailure = <E = never, A = never>(error: E): Result<E, A> => ({
  _tag: "failure",
  error,
});
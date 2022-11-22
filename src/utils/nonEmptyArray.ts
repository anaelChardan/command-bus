export interface NonEmptyArray<A> extends Array<A> {
  0: A;
}

/**
 * Generates a non-empty array from a simple array, returning undefined if
 * the input array is empty
 */
 export const toMaybeNonEmptyArray = <X>(xs: X[]): NonEmptyArray<X> | undefined =>
 xs.length > 0 ? (xs as NonEmptyArray<X>) : undefined;

 export const toNonEmptyArray = <X>(xs: X[]): NonEmptyArray<X> =>
 (xs as NonEmptyArray<X>);
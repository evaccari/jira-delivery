import type { Parser } from '../types/typeguards'

export const createTypeGuard = <T>(parse: Parser<T>) => (value: unknown): value is T => parse(value) !== undefined

export function isValueOf<T extends readonly unknown[] | Record<string, unknown>>(e: T) {
  return (token: unknown): token is T[keyof T] =>
    Object.values(e).includes(token as T[keyof T])
}

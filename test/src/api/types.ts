export type CommandReturn<T> = T extends Promise<infer U> ? Cypress.Chainable<U> : T extends Cypress.Chainable<any> ? T : Cypress.Chainable<T>;
export type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0 ? undefined : (((...b: T) => any) extends (a: any, ...b: infer I) => any ? I : []);
export type CommandFunctionWithPreviousSubject<T extends (...args: any) => any> = (...args: RemoveFirstFromTuple<Parameters<T>>) => CommandReturn<ReturnType<T>>;
export type CommandFunction<T extends (...args: any) => any> = (...args: Parameters<T>) => CommandReturn<ReturnType<T>>;

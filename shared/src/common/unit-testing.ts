export type Mock<T> = {
  service: T;
  functions: {
    // @ts-ignore
    [P in keyof T]?: jest.Mock<ReturnType<T[P]>, Parameters<T[P]>>;
  };
};

export type MockBusinessService<T extends (...args: any) => any> = jest.Mock<ReturnType<T>, Parameters<T>>;

export const createMockService = <T>(...functionsToMock: (keyof T)[]): Mock<T> => {
  const functions = functionsToMock.reduce((accumulator, currentValue) => ({
    ...accumulator,
    [currentValue]: jest.fn(),
  }), {});

  return {
    functions,
    service: jest.fn<Partial<T>, undefined[]>(() => functions)() as T,
  };
};

type PartialParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? Partial<P> : never;

export const validateFunctionCall = <T extends (...args: any) => any>(func: T, ...args: PartialParameters<T>): void => {
  if (args.length > 0) {
    expect(func).toHaveBeenCalledWith(...args);
  } else {
    expect(func).not.toHaveBeenCalled();
  }
};

export const validateNthFunctionCall = <T extends (...args: any) => any>(func: T, nth: number, ...args: Parameters<T>): void => {
  expect(func).toHaveBeenNthCalledWith(nth, ...args);
};

export const validateError = (message: string, statusCode?: number) => (error: any) => {
  expect(error.message).toEqual(message);
  if (statusCode) {
    expect(error.statusCode).toEqual(statusCode);
  }
};

export const awsResolvedValue = (data?: any) => ({
  promise: () => Promise.resolve(data),
}) as any;

export const awsRejectedValue = (data?: any) => ({
  promise: () => Promise.reject(data),
}) as any;

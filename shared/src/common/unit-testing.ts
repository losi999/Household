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

export const validateError = (message: string, statusCode?: number) => (error: any) => {
  expect(error.message).toEqual(message);
  if (statusCode) {
    expect(error.statusCode).toEqual(statusCode);
  }
};

export const validateSchemaType = (validation: string, propertyName: string, type: string) => {
  expect(validation).toEqual(`data.${propertyName} should be ${type}`);
};

export const validateSchemaRequired = (validation: string, propertyName: string) => {
  expect(validation).toEqual(`data should have required property '${propertyName}'`);
};

export const validateSchemaPattern = (validation: string, propertyName: string) => {
  expect(validation).toEqual(`${propertyName} should match pattern`);
};

export const validateSchemaFormat = (validation: string, propertyName: string, format: string) => {
  expect(validation).toEqual(`data.${propertyName} should match format "${format}"`);
};

export const validateSchemaAdditionalProperties = (validation: string, propertyName: string) => {
  expect(validation).toEqual(`${propertyName} should NOT have additional properties`);
};

export const validateSchemaMinLength = (validation: string, propertyName: string, minLength: number) => {
  expect(validation).toEqual(`data.${propertyName} should NOT be shorter than ${minLength} characters`);
};

export const validateSchemaMaxLength = (validation: string, propertyName: string, maxLength: number) => {
  expect(validation).toEqual(`data.${propertyName} should NOT be longer than ${maxLength} characters`);
};

export const validateSchemaEnumValue = (validation: string, propertyName: string) => {
  expect(validation).toEqual(`${propertyName} should be equal to one of the allowed values`);
};

export const validateSchemaMinimum = (validation: string, propertyName: string, minimum: number) => {
  expect(validation).toEqual(`data.${propertyName} should be >= ${minimum}`);
};

export const awsResolvedValue = (data?: any) => ({
  promise: () => Promise.resolve(data), 
}) as any;

export const awsRejectedValue = (data?: any) => ({
  promise: () => Promise.reject(data), 
}) as any;

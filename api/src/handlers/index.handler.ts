export default <E, R>(params: {
  before: ((event: E) => E)[];
  after: ((result: R) => R)[];
  handler: AWSLambda.Handler<E, R>;
}): AWSLambda.Handler<E, R> => {
  return async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let modifiedEvent: E;

    try {
      modifiedEvent = params.before.reduce((accumulator, currentValue) => {
        return currentValue(accumulator);
      }, event);
    } catch (error) {
      return error;
    }

    const result = await params.handler(modifiedEvent, context, callback);

    if (result) {
      const modifiedResult = params.after.reduce((accumulator, currentValue) => {
        return currentValue(accumulator);
      }, result);

      return modifiedResult;
    }
  };
};

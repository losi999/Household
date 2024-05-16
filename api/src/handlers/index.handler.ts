export default <E, R>(params: {
  before: ((event: E) => E)[];
  after: ((result: R) => R)[];
  handler: AWSLambda.Handler<E, R>;
}): AWSLambda.Handler<E, R> => {
  return async (event, context, callback) => {
    console.log('handler start');
    context.callbackWaitsForEmptyEventLoop = false;
    let modifiedEvent: E;
    let result: R;
    try {
      modifiedEvent = params.before.reduce((accumulator, currentValue) => {
        return currentValue(accumulator);
      }, event);
    } catch (error) {
      result = error as R;
    }

    if (!result) {
      result = (await params.handler(modifiedEvent, context, callback)) as R;
    }

    if (result) {
      const modifiedResult = params.after.reduce((accumulator, currentValue) => {
        return currentValue(accumulator);
      }, result);

      return modifiedResult;
    }
  };
};

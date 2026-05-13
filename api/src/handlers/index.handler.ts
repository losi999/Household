export default <E, R>(params: {
  before: ((event: E) => E)[];
  after: ((result: R) => R | Promise<R>)[];
  handler: AWSLambda.Handler<E, R>;
}): AWSLambda.Handler<E, R> => {
  return async (event, context) => {
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
      result = (await params.handler(modifiedEvent, context, undefined)) as R;
    }

    if (result) {
      let modifiedResult = result;
      for (const after of params.after) {
        modifiedResult = await after(modifiedResult);
      }

      return modifiedResult;
    }
  };
};

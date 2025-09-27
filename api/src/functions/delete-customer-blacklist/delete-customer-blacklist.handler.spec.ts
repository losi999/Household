// import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
// import { default as handler } from '@household/api/functions/create-customer/create-customer.handler';
// import { ICreateCustomerService } from '@household/api/functions/create-customer/create-customer.service';
// import { createCustomerId, createCustomerRequest } from '@household/shared/common/test-data-factory';
// import { headerExpiresIn } from '@household/shared/constants';

// describe('Create customer handler', () => {
//   let mockCreateCustomerService: MockBusinessService<ICreateCustomerService>;
//   let handlerFunction: ReturnType<typeof handler>;

//   beforeEach(() => {
//     mockCreateCustomerService = jest.fn();
//     handlerFunction = handler(mockCreateCustomerService);
//   });

//   const body = createCustomerRequest();
//   const expiresIn = 3600;
//   const handlerEvent = {
//     body: JSON.stringify(body),
//     headers: {
//       [headerExpiresIn]: `${expiresIn}`,
//     } as AWSLambda.APIGatewayProxyEventHeaders,
//   } as AWSLambda.APIGatewayProxyEvent;

//   it('should handle business service error', async () => {

//     const statusCode = 418;
//     const message = 'This is an error';
//     mockCreateCustomerService.mockRejectedValue({
//       statusCode,
//       message,
//     });

//     const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
//     validateFunctionCall(mockCreateCustomerService, {
//       body,
//       expiresIn,
//     });
//     expect(response.statusCode).toEqual(statusCode);
//     expect(JSON.parse(response.body).message).toEqual(message);
//     expect.assertions(3);
//   });

//   it('should respond with success', async () => {
//     const customerId = createCustomerId();

//     mockCreateCustomerService.mockResolvedValue(customerId);

//     const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
//     validateFunctionCall(mockCreateCustomerService, {
//       body,
//       expiresIn,
//     });
//     expect(response.statusCode).toEqual(201);
//     expect(JSON.parse(response.body).customerId).toEqual(customerId);
//     expect.assertions(3);
//   });
// });

/* eslint-disable @typescript-eslint/no-unused-vars */
import { test as baseTest, APIResponse, APIRequestContext } from '@playwright/test';

type ApiCallLog = {
  method: string; 
  url: string; 
  request: unknown; 
  authToken: string;
  response: { 
    status: number; 
    body: unknown;
    traceId: string;
  } 
};

type DbCallLog = {
  operationName: string;
  inputParameters: object;
  result: unknown;
};

type LoggingFixture = {
  steps: {
    [testId: string]: (ApiCallLog | DbCallLog)[];
  }
  logApiCall<M extends 'get' | 'post' | 'put' | 'patch' | 'delete'>(method: M, url: string, response: APIResponse, options: Parameters<APIRequestContext[M]>[1]): Promise<void>;
  logDbCall(operationName: string, inputParameters: object, result: unknown): Promise<void>;
  printSteps: void;
};

export const test = baseTest.extend<LoggingFixture>({
  steps: {},
  logApiCall: async ({ steps, printSteps }, use, testInfo) => {
    const logApiCall: LoggingFixture['logApiCall'] = async (method, url, response, options) => {
      if (!steps[testInfo.testId]) {  
        steps[testInfo.testId] = [];
      }

      steps[testInfo.testId].push({
        method,
        url,
        request: options?.data,
        authToken: options?.headers?.Authorization,
        response: {
          status: response.status(),
          body: await response.json().catch(() => response.text()),
          traceId: response.headers()['x-amzn-trace-id'],
        },
      });
    };

    await use(logApiCall);
  },
  logDbCall: async ({ steps, printSteps }, use, testInfo) => {
    const logDbCall: LoggingFixture['logDbCall'] = async (operationName, inputParameters, result) => {
      if (!steps[testInfo.testId]) {  
        steps[testInfo.testId] = [];
      }

      steps[testInfo.testId].push({
        operationName,
        inputParameters,
        result,
      });
    };

    await use(logDbCall);
  },
  printSteps: async ({ steps }, use, testInfo) => {
    await use();
    
    if (testInfo.status !== testInfo.expectedStatus) {
      if (steps[testInfo.testId].length > 0) {
        await testInfo.attach('test steps', {
          body: JSON.stringify(steps[testInfo.testId], null, 2),
          contentType: 'application/json',
        });
      }
    }
  },
});

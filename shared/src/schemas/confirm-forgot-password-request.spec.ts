import { confirmForgotPasswordRequest as schema } from '@household/shared/schemas/auth';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Confirm forgot password request schema', () => {
  const tester = schemaTesterFactory<Requests.ConfirmForgotPassword>(schema);

  tester.validateSuccess(testDataFactory.auth.request.confirmForgotPassword());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.auth.request.confirmForgotPassword(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.confirmationCode', () => {
      tester.required(testDataFactory.auth.request.confirmForgotPassword({
        confirmationCode: undefined,
      }), 'confirmationCode');

      tester.type(testDataFactory.auth.request.confirmForgotPassword({
        confirmationCode: 1 as any,
      }), 'confirmationCode', 'string');

      tester.minLength(testDataFactory.auth.request.confirmForgotPassword({
        confirmationCode: 'asdfg',
      }), 'confirmationCode', 6);

      tester.maxLength(testDataFactory.auth.request.confirmForgotPassword({
        confirmationCode: 'asdfghj',
      }), 'confirmationCode', 6);
    });

    describe('if data.password', () => {
      tester.required(testDataFactory.auth.request.confirmForgotPassword({
        password: undefined,
      }), 'password');

      tester.type(testDataFactory.auth.request.confirmForgotPassword({
        password: 1 as any,
      }), 'password', 'string');

      tester.minLength(testDataFactory.auth.request.confirmForgotPassword({
        password: 'asdfg',
      }), 'password', 6);
    });
  });
});

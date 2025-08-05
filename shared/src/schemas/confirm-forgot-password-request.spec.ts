import { default as schema } from '@household/shared/schemas/confirm-forgot-password-request';
import { Auth } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createConfirmForgotPasswordRequest } from '@household/shared/common/test-data-factory';

describe('Confirm forgot password request schema', () => {
  const tester = jsonSchemaTesterFactory<Auth.ConfirmForgotPassword.Request>(schema);

  tester.validateSuccess(createConfirmForgotPasswordRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createConfirmForgotPasswordRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.confirmationCode', () => {
      tester.required(createConfirmForgotPasswordRequest({
        confirmationCode: undefined,
      }), 'confirmationCode');

      tester.type(createConfirmForgotPasswordRequest({
        confirmationCode: 1 as any,
      }), 'confirmationCode', 'string');

      tester.minLength(createConfirmForgotPasswordRequest({
        confirmationCode: 'asdfg',
      }), 'confirmationCode', 6);

      tester.maxLength(createConfirmForgotPasswordRequest({
        confirmationCode: 'asdfghj',
      }), 'confirmationCode', 6);
    });

    describe('if data.password', () => {
      tester.required(createConfirmForgotPasswordRequest({
        password: undefined,
      }), 'password');

      tester.type(createConfirmForgotPasswordRequest({
        password: 1 as any,
      }), 'password', 'string');

      tester.minLength(createConfirmForgotPasswordRequest({
        password: 'asdfg',
      }), 'password', 6);
    });
  });
});

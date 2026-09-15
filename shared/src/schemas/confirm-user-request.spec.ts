import { default as schema } from '@household/shared/schemas/confirm-user-request';
import { Requests } from '@household/shared/types/requests';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createConfirmUserRequest } from '@household/shared/common/test-data-factory';

describe('Confirm user request schema', () => {
  const tester = jsonSchemaTesterFactory<Requests.ConfirmUser>(schema);

  tester.validateSuccess(createConfirmUserRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createConfirmUserRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.temporaryPassword', () => {
      tester.required(createConfirmUserRequest({
        temporaryPassword: undefined,
      }), 'temporaryPassword');

      tester.type(createConfirmUserRequest({
        temporaryPassword: 1 as any,
      }), 'temporaryPassword', 'string');

      tester.minLength(createConfirmUserRequest({
        temporaryPassword: 'asdfg',
      }), 'temporaryPassword', 6);
    });

    describe('if data.password', () => {
      tester.required(createConfirmUserRequest({
        password: undefined,
      }), 'password');

      tester.type(createConfirmUserRequest({
        password: 1 as any,
      }), 'password', 'string');

      tester.minLength(createConfirmUserRequest({
        password: 'asdfg',
      }), 'password', 6);
    });
  });
});

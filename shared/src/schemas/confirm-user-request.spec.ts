import { confirmUserRequest as schema } from '@household/shared/schemas/auth';
import { Requests } from '@household/shared/types/requests';
import { createConfirmUserRequest } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Confirm user request schema', () => {
  const tester = schemaTesterFactory<Requests.ConfirmUser>(schema);

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

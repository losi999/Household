import { confirmUserRequest as schema } from '@household/shared/schemas/auth';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Confirm user request schema', () => {
  const tester = schemaTesterFactory<Requests.ConfirmUser>(schema);

  tester.validateSuccess(testDataFactory.user.request.confirmUser());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.user.request.confirmUser(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.temporaryPassword', () => {
      tester.required(testDataFactory.user.request.confirmUser({
        temporaryPassword: undefined,
      }), 'temporaryPassword');

      tester.type(testDataFactory.user.request.confirmUser({
        temporaryPassword: 1 as any,
      }), 'temporaryPassword', 'string');

      tester.minLength(testDataFactory.user.request.confirmUser({
        temporaryPassword: 'asdfg',
      }), 'temporaryPassword', 6);
    });

    describe('if data.password', () => {
      tester.required(testDataFactory.user.request.confirmUser({
        password: undefined,
      }), 'password');

      tester.type(testDataFactory.user.request.confirmUser({
        password: 1 as any,
      }), 'password', 'string');

      tester.minLength(testDataFactory.user.request.confirmUser({
        password: 'asdfg',
      }), 'password', 6);
    });
  });
});

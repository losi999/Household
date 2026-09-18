import { refreshTokenRequest as schema } from '@household/shared/schemas/auth';
import { Requests } from '@household/shared/types/requests';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Refresh token schema', () => {
  const tester = schemaTesterFactory<Requests.RefreshToken>(schema);

  tester.validateSuccess({
    refreshToken: 'some.refresh.token',
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        refreshToken: 'some.refresh.token',
        extra: 1,
      } as any, 'data');
    });

    describe('if data.refreshToken', () => {
      tester.required({
        refreshToken: undefined,
      }, 'refreshToken');

      tester.type({
        refreshToken: 1 as any,
      }, 'refreshToken', 'string');

      tester.minLength({
        refreshToken: '',
      }, 'refreshToken', 1);
    });
  });
});


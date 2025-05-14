import { Setting } from '@household/shared/types/types';
import { settingDataFactory } from './data-factory';
import { UserType } from '@household/shared/enums';

const allowedUserTypes = [UserType.Editor];

describe('POST /setting/v1/settings/{settingKey}', () => {
  let request: Setting.Request;
  let settingKey: Setting.Id;

  beforeEach(() => {
    request = settingDataFactory.request();
    settingKey = settingDataFactory.key();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestUpdateSetting(settingKey, request)
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestUpdateSetting(settingKey, request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should update setting', () => {
          it('with complete body', () => {
            cy.authenticate(userType)
              .requestUpdateSetting(settingKey, request)
              .expectNoContentResponse()
              .validateSettingDocument(settingKey, request);
          });
        });

        describe('should return error', () => {
          describe('if value', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateSetting(settingKey, settingDataFactory.request({
                  value: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('value', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateSetting(settingKey, settingDataFactory.request({
                  value: {} as any,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('value', 'string', 'body');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestUpdateSetting(settingKey, settingDataFactory.request({
                  value: {} as any,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('value', 'number', 'body');
            });

            it('is not boolean', () => {
              cy.authenticate(userType)
                .requestUpdateSetting(settingKey, settingDataFactory.request({
                  value: {} as any,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('value', 'boolean', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateSetting(settingKey, settingDataFactory.request({
                  value: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('value', 1, 'body');
            });
          });
        });
      }
    });
  });
});

import { default as schema } from '@household/test/api/schemas/setting-response-list';
import { Setting } from '@household/shared/types/types';
import { settingDataFactory } from './data-factory';
import { UserType } from '@household/shared/enums';

describe('GET /setting/v1/settings', () => {
  let settingKey1: Setting.Id;
  let settingKey2: Setting.Id;
  let settingRequest2: Setting.Request;
  let settingRequest1: Setting.Request;

  beforeEach(() => {
    settingKey1 = settingDataFactory.key();
    settingKey2 = settingDataFactory.key();
    settingRequest1 = settingDataFactory.request();
    settingRequest2 = settingDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetSettingList()
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an editor', () => {
    it('should get a list of settings', () => {
      cy.updateSettingDocument(settingKey1, settingDataFactory.update(settingRequest1))
        .updateSettingDocument(settingKey2, settingDataFactory.update(settingRequest2))
        .authenticate(UserType.Editor)
        .requestGetSettingList()
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateSettingListResponse([
          settingDataFactory.document(settingKey1, settingRequest1),
          settingDataFactory.document(settingKey2, settingRequest2),
        ]);
    });
  });
});

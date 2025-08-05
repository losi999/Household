import { Setting } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestUpdateSetting = (idToken: string, settingKey: Setting.Id, setting: Setting.Request) => {
  return cy.request({
    body: setting,
    method: 'POST',
    url: `/setting/v1/settings/${settingKey}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetSettingList = (idToken: string) => {
  return cy.request({
    method: 'GET',
    url: '/setting/v1/settings',
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setSettingRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestUpdateSetting,
    requestGetSettingList,
  });

};

declare global {
  namespace Cypress {
    interface ChainableRequest extends Chainable {
      requestUpdateSetting: CommandFunctionWithPreviousSubject<typeof requestUpdateSetting>;
      requestGetSettingList: CommandFunctionWithPreviousSubject<typeof requestGetSettingList>;
    }
  }
}

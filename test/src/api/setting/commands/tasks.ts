import { Setting } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { ISettingService } from '@household/shared/services/setting-service';

const updateSettingDocument = (...params: Parameters<ISettingService['updateSetting']>) => {
  return cy.task<Setting.Document>('updateSetting', params);
};

const getSettingDocumentByKey = (...params: Parameters<ISettingService['getSettingByKey']>) => {
  return cy.task<Setting.Document>('getSettingByKey', params);
};

export const setSettingTaskCommands = () => {
  Cypress.Commands.addAll({
    updateSettingDocument,
    getSettingDocumentByKey,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      updateSettingDocument: CommandFunction<typeof updateSettingDocument>;
      getSettingDocumentByKey: CommandFunction<typeof getSettingDocumentByKey>
    }
  }
}

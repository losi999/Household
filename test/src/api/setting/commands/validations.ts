import { Setting } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validateSettingDocument = (settingKey: Setting.Id, request: Setting.Request) => {
  cy.log('Get setting document', settingKey)
    .getSettingDocumentByKey(settingKey)
    .should((document) => {
      const { settingKey: key, value, ...internal } = document;

      expect(key, 'settingKey').to.equal(settingKey);
      expect(value, 'value').to.equal(request.value);
      expectRemainingProperties(internal);
    });
};

const validateSettingResponse = (nestedPath: string = '') => (response: Setting.Response, document: Setting.Document) => {
  const { settingKey, value, ...internal } = response;

  expect(settingKey, `${nestedPath}settingKey`).to.equal(document.settingKey);
  expect(value, `${nestedPath}value`).to.equal(document.value);
  expectEmptyObject(internal, nestedPath);
};

const validateNestedSettingResponse = (nestedPath: string, ...rest: Parameters<ReturnType<typeof validateSettingResponse>>) => validateSettingResponse(nestedPath)(...rest);

const validateSettingListResponse = (responses: Setting.Response[], documents: Setting.Document[]) => {
  documents.forEach((document, index) => {
    const response = responses.find(r => r.settingKey === document.settingKey);
    cy.validateNestedSettingResponse(`[${index}].`, response, document);
  });
};

export const setSettingValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateSettingResponse: validateSettingResponse(),
    validateSettingListResponse,
  });

  Cypress.Commands.addAll({
    validateSettingDocument,
    validateNestedSettingResponse,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateNestedSettingResponse: CommandFunction<typeof validateNestedSettingResponse>;
    }

    interface ChainableResponseBody extends Chainable {
      validateSettingDocument: CommandFunction<typeof validateSettingDocument>;
      validateSettingResponse: CommandFunctionWithPreviousSubject<ReturnType<typeof validateSettingResponse>>;
      validateSettingListResponse: CommandFunctionWithPreviousSubject<typeof validateSettingListResponse>;
    }
  }
}

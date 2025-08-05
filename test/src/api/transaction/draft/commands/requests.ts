import { File } from '@household/shared/types/types';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestGetTransactionListByFile = (idToken: string, fileId: File.Id) => {
  return cy.request({
    method: 'GET',
    url: `/transaction/v1/files/${fileId}/transactions`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setDraftTransactionRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestGetTransactionListByFile,
  });
};

declare global {
  namespace Cypress {

    interface ChainableRequest extends Chainable {
      requestGetTransactionListByFile: CommandFunctionWithPreviousSubject<typeof requestGetTransactionListByFile>;
    }
  }
}

import { getAccountId } from '@household/shared/common/utils';
import { Account } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const validateAccountDocument = (response: Account.AccountId, request: Account.Request) => {
  const id = response?.accountId;

  cy.log('Get account document', id)
    .getAccountDocumentById(id)
    .should((document) => {
      expect(getAccountId(document), '_id').to.equal(id);
      expect(document.name, 'name').to.equal(request.name);
      expect(document.accountType, 'accountType').to.equal(request.accountType);
      expect(document.currency, 'currency').to.equal(request.currency);
      expect(document.owner, 'owner').to.equal(request.owner);
      expect(document.balance, 'balance').to.equal(0);
      expect(document.isOpen, 'isOpen').to.equal(true);
    });
};

const validateAccountResponse = (response: Account.Response, document: Account.Document, balance: number) => {
  expect(response.accountId, 'accountId').to.equal(getAccountId(document));
  expect(response.name, 'name').to.equal(document.name);
  expect(response.accountType, 'accountType').to.equal(document.accountType);
  expect(response.currency, 'currency').to.equal(document.currency);
  expect(response.owner, 'owner').to.equal(document.owner);
  expect(response.balance, 'balance').to.equal(balance);
  expect(response.isOpen, 'isOpen').to.equal(document.isOpen);
};

const validateAccountListResponse = (responses: Account.Response[], documents: Account.Document[], balances: number[]) => {
  documents.forEach((document, index) => {
    const response = responses.find(r => r.accountId === getAccountId(document));
    const balance = balances[index];
    validateAccountResponse(response, document, balance);
  });
};

const validateAccountDeleted = (accountId: Account.Id) => {
  cy.log('Get account document', accountId)
    .getAccountDocumentById(accountId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

export const setAccountValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateAccountDocument,
    validateAccountResponse,
    validateAccountListResponse,
  });

  Cypress.Commands.addAll({
    validateAccountDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateAccountDeleted: CommandFunction<typeof validateAccountDeleted>;
    }

    interface ChainableResponseBody extends Chainable {
      validateAccountDocument: CommandFunctionWithPreviousSubject<typeof validateAccountDocument>;
      validateAccountResponse: CommandFunctionWithPreviousSubject<typeof validateAccountResponse>;
      validateAccountListResponse: CommandFunctionWithPreviousSubject<typeof validateAccountListResponse>;
    }
  }
}

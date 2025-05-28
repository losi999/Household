import { getAccountId } from '@household/shared/common/utils';
import { Account } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validateAccountDocument = (response: Account.AccountId, request: Account.Request) => {
  const id = response?.accountId;

  cy.log('Get account document', id)
    .findAccountDocumentById(id)
    .should((document) => {
      const { name, accountType, currency, owner, isOpen, ...internal } = document;

      expect(getAccountId(document), '_id').to.equal(id);
      expect(name, 'name').to.equal(request.name);
      expect(accountType, 'accountType').to.equal(request.accountType);
      expect(currency, 'currency').to.equal(request.currency);
      expect(owner, 'owner').to.equal(request.owner);
      expect(isOpen, 'isOpen').to.equal(true);
      expectRemainingProperties(internal);
    });
};

const validateLeanAccountResponse = (response: Account.LeanResponse, document: Account.Document) => {
  const { accountId, name, accountType, currency, owner, isOpen, fullName, ...empty } = response;

  expect(accountId, 'accountId').to.equal(getAccountId(document));
  expect(name, 'name').to.equal(document.name);
  expect(accountType, 'accountType').to.equal(document.accountType);
  expect(currency, 'currency').to.equal(document.currency);
  expect(owner, 'owner').to.equal(document.owner);
  expect(isOpen, 'isOpen').to.equal(document.isOpen);
  expect(fullName, 'fullName').to.equal(`${document.name} (${document.owner})`);
  expectEmptyObject(empty);
};

const validateAccountResponse = (response: Account.Response, document: Account.Document, expectedBalance: number) => {
  const { balance, ...lean } = response;

  validateLeanAccountResponse(lean, document);
  expect(balance, 'balance').to.equal(expectedBalance);
};

const validateInAccountListResponse = (responses: Account.Response[], document: Account.Document, expectedBalance: number) => {
  const response = responses.find(r => r.accountId === getAccountId(document));

  validateAccountResponse(response, document, expectedBalance);

  return cy.wrap(responses, {
    log: false,
  }) as Cypress.ChainableResponseBody;
};

const validateAccountDeleted = (accountId: Account.Id) => {
  cy.log('Get account document', accountId)
    .findAccountDocumentById(accountId)
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
    validateLeanAccountResponse,
    validateInAccountListResponse,
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
      validateLeanAccountResponse: CommandFunctionWithPreviousSubject<typeof validateLeanAccountResponse>;
      validateInAccountListResponse: CommandFunctionWithPreviousSubject<typeof validateInAccountListResponse>;
    }
  }
}

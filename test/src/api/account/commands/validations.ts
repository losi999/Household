import { getAccountId } from '@household/shared/common/utils';
import { Account } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validateAccountDocument = (response: Account.AccountId, request: Account.Request) => {
  const id = response?.accountId;

  cy.log('Get account document', id)
    .getAccountDocumentById(id)
    .should((document) => {
      const { name, accountType, currency, owner, balance, isOpen, loanBalance, ...internal } = document;

      expect(getAccountId(document), '_id').to.equal(id);
      expect(name, 'name').to.equal(request.name);
      expect(accountType, 'accountType').to.equal(request.accountType);
      expect(currency, 'currency').to.equal(request.currency);
      expect(owner, 'owner').to.equal(request.owner);
      expect(balance, 'balance').to.equal(0);
      expect(loanBalance, 'loanBalance').to.equal(0);
      expect(isOpen, 'isOpen').to.equal(true);
      expectRemainingProperties(internal);
    });
};

const validateAccountResponse = (response: Account.Response, document: Account.Document, expectedBalance: number, expectedLoanBalance: number) => {
  const { accountId, name, accountType, currency, owner, balance, isOpen, fullName, loanBalance, ...empty } = response;

  expect(accountId, 'accountId').to.equal(getAccountId(document));
  expect(name, 'name').to.equal(document.name);
  expect(accountType, 'accountType').to.equal(document.accountType);
  expect(currency, 'currency').to.equal(document.currency);
  expect(owner, 'owner').to.equal(document.owner);
  expect(balance, 'balance').to.equal(expectedBalance);
  expect(loanBalance, 'loanBalance').to.equal(expectedLoanBalance);
  expect(isOpen, 'isOpen').to.equal(document.isOpen);
  expect(fullName, 'fullName').to.equal(`${document.name} (${document.owner})`);
  expectEmptyObject(empty);
};

const validateAccountListResponse = (responses: Account.Response[], documents: Account.Document[], balances: number[], loanBalances: number[]) => {
  documents.forEach((document, index) => {
    const response = responses.find(r => r.accountId === getAccountId(document));
    const balance = balances[index];
    const loanBalance = loanBalances[index];
    validateAccountResponse(response, document, balance, loanBalance);
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

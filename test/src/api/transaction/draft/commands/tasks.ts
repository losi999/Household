import { Transaction } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { fixDate } from '@household/test/api/transaction/common/commands/tasks';

const listDraftTransactionsByFileId = (...params: Parameters<ITransactionService['listDraftTransactionsByFileId']>) => {
  return cy.task<Transaction.DraftDocument<string>[]>('listDraftTransactionsByFileId', params).then((docs) => docs.map(d => fixDate(d) as Transaction.DraftDocument));
};

export const setDraftTransactionTaskCommands = () => {
  Cypress.Commands.addAll({
    listDraftTransactionsByFileId,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      listDraftTransactionsByFileId: CommandFunction<typeof listDraftTransactionsByFileId>;
    }
  }
}

import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId, getTransactionId, pushUnique, toDictionary } from '@household/shared/common/utils';
import { ILoanTransferTransactionDocumentConverter } from '@household/shared/converters/loan-transfer-transaction-document-converter';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface ICreateTransferTransactionService {
  (ctx: {
    body: Transaction.TransferRequest;
    expiresIn: number;
  }): Promise<Transaction.Id>;
}

export const createTransferTransactionServiceFactory = (
  accountService: IAccountService,
  transactionService: ITransactionService,
  transferTransactionDocumentConverter: ITransferTransactionDocumentConverter,
  loanTransferDocumentDonverter: ILoanTransferTransactionDocumentConverter,
): ICreateTransferTransactionService => {
  return async ({ body, expiresIn }) => {
    const { accountId, transferAccountId, payments } = body;

    httpErrors.transaction.sameAccountTransfer({
      accountId,
      transferAccountId,
    });

    const accounts = await accountService.listAccountsByIds([
      accountId,
      transferAccountId,
    ]).catch(httpErrors.common.getRelatedData({
      accountId,
      transferAccountId,
    }));

    const account = accounts.find(a => getAccountId(a) === accountId);
    const transferAccount = accounts.find(a => getAccountId(a) === transferAccountId);

    httpErrors.account.notFound(!account, {
      accountId,
    }, 400);

    httpErrors.account.notFound(!transferAccount, {
      accountId: transferAccountId,
    }, 400);

    let document: Transaction.TransferDocument | Transaction.LoanTransferDocument;

    if (account.accountType === 'loan' || transferAccount.accountType === 'loan') {
      if (account.accountType === transferAccount.accountType) {
        body.payments = undefined;
        document = transferTransactionDocumentConverter.create({
          body,
          account,
          transferAccount,
          transactions: undefined,
        }, expiresIn);
      } else {
        document = loanTransferDocumentDonverter.create({
          body,
          account,
          transferAccount,
        }, expiresIn);
      }
    } else {
      if (payments) {
        const deferredTransactionIds: Transaction.Id[] = [];
        let total = 0;
        payments?.forEach(({ transactionId, amount }) => {
          pushUnique(deferredTransactionIds, transactionId);
          total += amount;
        });

        const receivingAmount = body.amount > 0 ? body.amount : (body.transferAmount ?? body.amount * -1);

        httpErrors.transaction.sumOfPayments(total > receivingAmount, body);

        const payingAccount = body.amount < 0 ? transferAccount : account;

        const transactionList = await transactionService.listDeferredTransactions({
          payingAccountIds: [getAccountId(payingAccount)],
          deferredTransactionIds,
        }).catch(httpErrors.common.getRelatedData({
          payingAccountIds: [getAccountId(payingAccount)],
          deferredTransactionIds,
        }));

        httpErrors.transaction.multipleNotFound(deferredTransactionIds.length !== transactionList.length, {
          transactionIds: deferredTransactionIds,
        });
        const transactions = toDictionary(transactionList, '_id');

        document = transferTransactionDocumentConverter.create({
          body,
          account,
          transferAccount,
          transactions,
        }, expiresIn);
      } else {
        document = transferTransactionDocumentConverter.create({
          body,
          account,
          transferAccount,
          transactions: undefined,
        }, expiresIn);
      }
    }

    const saved = await transactionService.saveTransaction(document).catch(httpErrors.transaction.save(document));

    return getTransactionId(saved);
  };
};

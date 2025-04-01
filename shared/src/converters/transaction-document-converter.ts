import { getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { ILoanTransferTransactionDocumentConverter } from '@household/shared/converters/loan-transfer-transaction-document-converter';
import { IPaymentTransactionDocumentConverter } from '@household/shared/converters/payment-transaction-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IReimbursementTransactionDocumentConverter } from '@household/shared/converters/reimbursement-transaction-document-converter';
import { ISplitTransactionDocumentConverter } from '@household/shared/converters/split-transaction-document-converter';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { Account, Transaction } from '@household/shared/types/types';

export interface ITransactionDocumentConverter {
  toResponse(document: Transaction.Document, viewingAccountId?: Account.Id): Transaction.Response;
  toResponseList(documents: Transaction.Document[], viewingAccountId?: Account.Id): Transaction.Response[];
  toReport(document: Transaction.RawReport): Transaction.Report;
  toReportList(documents: (Transaction.RawReport)[]): Transaction.Report[];
}

export const transactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  categoryDocumentConverter: ICategoryDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
  productDocumentConverter: IProductDocumentConverter,
  paymentTransactionDocumentConverter: IPaymentTransactionDocumentConverter,
  splitTransactionDocumentConverter: ISplitTransactionDocumentConverter,
  deferredTransactionDocumentConverter: IDeferredTransactionDocumentConverter,
  reimbursementTransactionDocumentConverter: IReimbursementTransactionDocumentConverter,
  transferTransactionDocumentConverter: ITransferTransactionDocumentConverter,
  loanTransferTransactionDocumentConverter: ILoanTransferTransactionDocumentConverter,
): ITransactionDocumentConverter => {
  const instance: ITransactionDocumentConverter = {
    toResponse: (doc, viewingAccountId) => {
      switch (doc.transactionType) {
        case 'payment': return paymentTransactionDocumentConverter.toResponse(doc);
        case 'split': return splitTransactionDocumentConverter.toResponse(doc);
        case 'transfer': return transferTransactionDocumentConverter.toResponse(doc, viewingAccountId);
        case 'deferred': return deferredTransactionDocumentConverter.toResponse(doc);
        case 'loanTransfer': return loanTransferTransactionDocumentConverter.toResponse(doc, viewingAccountId);
        case 'reimbursement': return reimbursementTransactionDocumentConverter.toResponse(doc);
        default: return undefined;
      }
    },
    toResponseList: (docs, viewingAccountId) => docs.map(d => instance.toResponse(d, viewingAccountId)),
    toReport: (document) => {
      return {
        amount: document.amount,
        transactionId: getTransactionId(document),
        issuedAt: document.issuedAt.toISOString(),
        description: document.description,
        account: accountDocumentConverter.toReport(document.account),
        category: categoryDocumentConverter.toReport(document.category),
        product: productDocumentConverter.toReport({
          quantity: document.quantity,
          document: document.product,
        }),
        invoiceNumber: document.invoiceNumber,
        billingEndDate: document.billingEndDate?.toISOString().split('T')[0],
        billingStartDate: document.billingStartDate?.toISOString().split('T')[0],
        project: projectDocumentConverter.toReport(document.project),
        recipient: recipientDocumentConverter.toReport(document.recipient),
        splitId: document.splitId,
      };

    },
    toReportList: documents => documents.map(d => instance.toReport(d)),
  };

  return instance;
};

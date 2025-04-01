import { transactionDocumentConverterFactory } from '@household/shared/converters/transaction-document-converter';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { deferredTransactionDocumentConverter } from '@household/shared/dependencies/converters/deferred-transaction-document-converter';
import { loanTransferTransactionDocumentConverter } from '@household/shared/dependencies/converters/loan-transfer-transaction-document-converter';
import { paymentTransactionDocumentConverter } from '@household/shared/dependencies/converters/payment-transaction-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { reimbursementTransactionDocumentConverter } from '@household/shared/dependencies/converters/reimbursement-transaction-document-converter';
import { splitTransactionDocumentConverter } from '@household/shared/dependencies/converters/split-transaction-document-converter';
import { transferTransactionDocumentConverter } from '@household/shared/dependencies/converters/transfer-transaction-document-converter';

export const transactionDocumentConverter = transactionDocumentConverterFactory(accountDocumentConverter, projectDocumentConverter, categoryDocumentConverter, recipientDocumentConverter, productDocumentConverter, paymentTransactionDocumentConverter, splitTransactionDocumentConverter, deferredTransactionDocumentConverter, reimbursementTransactionDocumentConverter, transferTransactionDocumentConverter, loanTransferTransactionDocumentConverter);

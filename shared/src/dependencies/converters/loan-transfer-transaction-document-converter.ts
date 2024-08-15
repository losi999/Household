import { loanTransferTransactionDocumentConverterFactory } from '@household/shared/converters/loan-transfer-transaction-document-converter';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';

export const loanTransferTransactionDocumentConverter = loanTransferTransactionDocumentConverterFactory(accountDocumentConverter);

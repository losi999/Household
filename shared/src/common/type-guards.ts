import { Category, Transaction } from '@household/shared/types/types';

export const isSplitTransaction = (transaction: Transaction.Response): transaction is Transaction.SplitResponse => {
  return transaction?.transactionType === 'split';
};

export const isTransferTransaction = (transaction: Transaction.Response): transaction is Transaction.TransferResponse => {
  return transaction?.transactionType === 'transfer';
};

export const isPaymentTransaction = (transaction: Transaction.Response): transaction is Transaction.PaymentResponse => {
  return transaction?.transactionType === 'payment';
};

export const isDeferredTransactionResponse = (transaction: any): transaction is Transaction.DeferredResponse => {
  return (transaction as Transaction.DeferredResponse)?.transactionType === 'deferred';
};

export const isDeferredTransaction = (transaction: Transaction.Document | Transaction.SplitDocumentItem): transaction is Transaction.DeferredDocument => {
  return (transaction as Transaction.DeferredDocument).transactionType === 'deferred';
};

export const isInvoiceCategory = (category: Category.Response): boolean => {
  return category?.categoryType === 'invoice';
};

export const isInventoryCategory = (category: Category.Response): boolean => {
  return category?.categoryType === 'inventory';
};

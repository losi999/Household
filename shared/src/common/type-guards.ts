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

export const isInvoiceCategory = (category: Category.Response): boolean => {
  return category?.categoryType === 'invoice';
};

export const isInventoryCategory = (category: Category.Response): boolean => {
  return category?.categoryType === 'inventory';
};

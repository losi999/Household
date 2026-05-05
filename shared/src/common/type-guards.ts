import { CategoryType } from '@household/shared/enums';
import { Category, Customer, Price, Transaction } from '@household/shared/types/types';

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
  return category?.categoryType === CategoryType.Invoice;
};

export const isInventoryCategory = (category: Category.Response): boolean => {
  return category?.categoryType === CategoryType.Inventory;
};

export const hasPriceId = (price: Customer.Job.ListedPriceRequest | Customer.Job.ListedPriceDocument): price is Customer.Job.ListedPriceRequest => {
  return !!(price as Price.PriceId).priceId;
};

export const isListedPrice = (price: (Customer.Job.Request | Customer.Job.Document)['prices'][number]): price is (Customer.Job.ListedPriceRequest | Customer.Job.ListedPriceDocument) => {
  return isListedPriceRequest(price as Customer.Job.ListedPriceRequest) || isListedPriceDocument(price as Customer.Job.ListedPriceDocument);
};

export const isListedPriceRequest = (price: Customer.Job.Request['prices'][number]): price is Customer.Job.ListedPriceRequest => {
  return !!(price as Price.PriceId).priceId;
};

export const isListedPriceDocument = (price: Customer.Job.Document['prices'][number]): price is Customer.Job.ListedPriceDocument => {
  return !!(price as Customer.Job.ListedPriceDocument).price;
};

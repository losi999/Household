import { CategoryType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';

export const isSplitTransaction = (transaction: Responses.Transaction): transaction is Responses.SplitTransaction => {
  return transaction?.transactionType === 'split';
};

export const isTransferTransaction = (transaction: Responses.Transaction): transaction is Responses.TransferTransaction => {
  return transaction?.transactionType === 'transfer';
};

export const isPaymentTransaction = (transaction: Responses.Transaction): transaction is Responses.PaymentTransaction => {
  return transaction?.transactionType === 'payment';
};

export const isDeferredTransactionResponse = (transaction: any): transaction is Responses.DeferredTransaction => {
  return (transaction as Responses.DeferredTransaction)?.transactionType === 'deferred';
};

export const isDeferredTransaction = (transaction: Documents.Transaction | Documents.SplitItem): transaction is Documents.DeferredTransaction => {
  return (transaction as Documents.DeferredTransaction).transactionType === 'deferred';
};

export const isInvoiceCategory = (category: Responses.Category): boolean => {
  return category?.categoryType === CategoryType.Invoice;
};

export const isInventoryCategory = (category: Responses.Category): boolean => {
  return category?.categoryType === CategoryType.Inventory;
};

export const hasPriceId = (price: {price: Documents.Price;} | Api.Price.PriceId): price is Api.Price.PriceId => {
  return !!(price as Api.Price.PriceId).priceId;
};

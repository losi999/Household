import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

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

export const isCategoryId = (category: Category.CategoryId | Category.Request): category is Category.CategoryId => {
  return !!(category as Category.CategoryId).categoryId;
};

export const isProjectId = (project: Project.ProjectId | Project.Request): project is Project.ProjectId => {
  return !!(project as Project.ProjectId).projectId;
};

export const isRecipientId = (recipient: Recipient.RecipientId | Recipient.Request): recipient is Recipient.RecipientId => {
  return !!(recipient as Recipient.RecipientId).recipientId;
};

export const isProductId = (product: Product.ProductId | Product.Request): product is Product.ProductId => {
  return !!(product as Product.ProductId).productId;
};

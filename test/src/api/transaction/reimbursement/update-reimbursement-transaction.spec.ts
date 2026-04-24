import { entries, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { forbidUsers } from '@household/test/utils';

import { test as transactionApiTest, expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { test as categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { test as projectDbTest } from '@household/test/fixtures/project-db.fixture';
import { test as recipientDbTest } from '@household/test/fixtures/recipient-db.fixture';
import { test as productDbTest } from '@household/test/fixtures/product-db.fixture';

const expect = mergeExpects(transactionApiExpect, apiExpect);

const permissionMap = forbidUsers('viewer') ;

const test = mergeTests(transactionApiTest, accountDbTest, transactionDbTest, categoryDbTest, projectDbTest, recipientDbTest, productDbTest);

test.describe('PUT transaction/v1/transactions/{transactionId}/payment (reimbursement)', () => {
  let request: Transaction.PaymentRequest;
  let originalDocument: Transaction.TransferDocument;

  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let accountDocument: Account.Document;
  let secondaryAccountDocument: Account.Document;
  let regularCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;
  let productDocument: Product.Document;
  let relatedDocumentIds: Pick<Transaction.PaymentRequest, 'accountId' | 'productId' | 'categoryId' | 'projectId' | 'recipientId' | 'loanAccountId'> ;

  test.beforeEach(async () => {
    projectDocument = projectDataFactory.document();
    recipientDocument = recipientDataFactory.document();
    accountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });
    secondaryAccountDocument = accountDataFactory.document();
    regularCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Regular,
      },
    });

    invoiceCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Invoice,
      },
    });

    inventoryCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });

    productDocument = productDataFactory.document({
      category: inventoryCategoryDocument,
    });

    originalDocument = transferTransactionDataFactory.document({
      account: accountDocument,
      transferAccount: accountDocument,
    });

    relatedDocumentIds = {
      accountId: getAccountId(accountDocument),
      categoryId: getCategoryId(regularCategoryDocument),
      projectId: getProjectId(projectDocument),
      productId: getProductId(productDocument),
      recipientId: getRecipientId(recipientDocument),
      loanAccountId: getAccountId(secondaryAccountDocument),
    };

    request = reimbursementTransactionDataFactory.request(relatedDocumentIds);
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateToPaymentTransaction }) => {
      const res = await requestUpdateToPaymentTransaction(reimbursementTransactionDataFactory.id(), request);
      expect(res).toBeUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType: userType, 
      });
      if (!isAllowed) {
        test('should return forbidden', async ({ requestUpdateToPaymentTransaction }) => {
          const res = await requestUpdateToPaymentTransaction(reimbursementTransactionDataFactory.id(), request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update transaction', () => {
          test.describe('with complete body', () => {
            test('using regular category', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test('using invoice category', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });
            test('using inventory category', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient, saveProduct }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });
          });

          test.describe('without optional properties', () => {
            test('description', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                description: undefined,
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });
            test(CategoryType.Inventory, async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                productId: undefined,
                quantity: undefined,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test(CategoryType.Invoice, async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test('invoice.invoiceNumber', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test('categoryId', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveProject, saveRecipient }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: undefined,
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test('recipientId', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: undefined,
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test('projectId', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveRecipient }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                projectId: undefined,
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });
          });

          test.describe('with unsetting', () => {
            let reimbursementDocument: Transaction.ReimbursementDocument;

            test.beforeEach(async () => {
              reimbursementDocument = reimbursementTransactionDataFactory.document({
                account: accountDocument,
                loanAccount: secondaryAccountDocument,
                project: projectDocument,
                recipient: recipientDocument,
                category: inventoryCategoryDocument,
                product: productDocument,
                body: {
                  description: 'old description',
                },
              });
            });

            test('description', async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient, saveProduct }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(inventoryCategoryDocument),
                description: undefined,
              });
              await saveTransaction(reimbursementDocument);
              await saveAccount(accountDocument);
              await saveAccount(secondaryAccountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProduct(productDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(reimbursementDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test(CategoryType.Inventory, async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                productId: undefined,
                quantity: undefined,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              await saveTransaction(reimbursementDocument);
              await saveAccount(accountDocument);
              await saveAccount(secondaryAccountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(reimbursementDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test(CategoryType.Invoice, async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
              });

              await saveTransaction(reimbursementDocument);
              await saveAccount(accountDocument);
              await saveAccount(secondaryAccountDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(reimbursementDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test('invoice.invoiceNumber', async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              reimbursementDocument = reimbursementTransactionDataFactory.document({
                account: accountDocument,
                loanAccount: secondaryAccountDocument,
                recipient: recipientDocument,
                category: invoiceCategoryDocument,
                product: productDocument,
                body: {
                  description: 'old description',
                },
              });

              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
              });

              await saveTransaction(reimbursementDocument);
              await saveAccount(accountDocument);
              await saveAccount(secondaryAccountDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(reimbursementDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test('categoryId', async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveProject, saveRecipient }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: undefined,
              });

              await saveTransaction(reimbursementDocument);
              await saveAccount(accountDocument);
              await saveAccount(secondaryAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(reimbursementDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test('recipientId', async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveCategory, saveProject }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: undefined,
              });

              await saveTransaction(reimbursementDocument);
              await saveAccount(accountDocument);
              await saveAccount(secondaryAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(reimbursementDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });

            test('projectId', async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveCategory, saveRecipient }) => {
              request = reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                projectId: undefined,
              });

              await saveTransaction(reimbursementDocument);
              await saveAccount(accountDocument);
              await saveAccount(secondaryAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(reimbursementDocument), request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsReimbursementTransactionDocument(await getTransactionById(transactionId));
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if transactionId', () => {
            test('is not mongo id', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(reimbursementTransactionDataFactory.id('not-valid'), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'transactionId');
            });

            test('does not belong to any transaction', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(reimbursementTransactionDataFactory.id(), request);
              expect(res).toBeNotFoundResponse();
            });
          });

          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                extra: 123, 
              } as any));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extra');
            });
          });

          test.describe('if amount', () => {
            test('is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                amount: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not number', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                amount: <any>'1', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'amount', 'number');
            });

            test('is bigger than 0', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                amount: 1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooLargeValidationError('body', 'amount', 0);
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                description: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                description: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if quantity', () => {
            test('is present and productId is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                productId: undefined,
                quantity: 1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'quantity', 'productId');
            });

            test('is not number', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                quantity: <any>'a', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'quantity', 'number');
            });

            test('is too small', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                quantity: 0, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'quantity', 0);
            });
          });

          test.describe('if productId', () => {
            test('is present and quantity is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                quantity: undefined,
                productId: productDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'productId', 'quantity');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                productId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'productId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                productId: productDataFactory.id('not-valid'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'productId');
            });

            test('does not belong to any product', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(inventoryCategoryDocument), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No product found');
            });
          });

          test.describe('if invoiceNumber', () => {
            test('is present and billingEndDate, billingStartDate are missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                billingEndDate: undefined,
                billingStartDate: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'invoiceNumber', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                invoiceNumber: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'invoiceNumber', 'string');
            });

            test('is too short', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                invoiceNumber: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'invoiceNumber', 1);
            });
          });

          test.describe('if billingEndDate', () => {
            test('is present and billingStartDate is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                billingStartDate: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                billingEndDate: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingEndDate', 'string');
            });

            test('is not date format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                billingEndDate: 'not-date', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingEndDate', 'date');
            });

            test('is later than billingStartDate', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                billingEndDate: '2022-06-01',
                billingStartDate: '2022-06-03', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooEarlyDateValidationError('body', 'billingEndDate', true);
            });
          });

          test.describe('if billingStartDate', () => {
            test('is present and billingEndDate is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                billingEndDate: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingStartDate', 'billingEndDate');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                billingStartDate: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingStartDate', 'string');
            });

            test('is not date format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                billingStartDate: 'not-date', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingStartDate', 'date');
            });
          });

          test.describe('if issuedAt', () => {
            test('is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                issuedAt: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'issuedAt');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                issuedAt: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'issuedAt', 'string');
            });

            test('is not date-time format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                issuedAt: 'not-date-time', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'issuedAt', 'date-time');
            });
          });

          test.describe('if accountId', () => {
            test('does not belong to any account', async ({ requestUpdateToPaymentTransaction, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                accountId: accountDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No account found');
            });

            test('is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                accountId: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'accountId');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                accountId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'accountId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                accountId: accountDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'accountId');
            });
          });

          test.describe('if loanAccountId', () => {
            test('belongs to a loan type account', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const loanAccountDocument = accountDataFactory.document({
                accountType: AccountType.Loan,
              });
              await saveTransaction(originalDocument);
              await saveAccounts(loanAccountDocument, accountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                loanAccountId: getAccountId(loanAccountDocument),
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Account type cannot be loan');
            });

            test('does not belong to any account', async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccount(accountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                loanAccountId: accountDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No account found');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                loanAccountId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'loanAccountId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                loanAccountId: accountDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'loanAccountId');
            });
          });

          test.describe('if categoryId', () => {
            test('does not belong to any category', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: categoryDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No category found');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                categoryId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'categoryId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                categoryId: categoryDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'categoryId');
            });
          });

          test.describe('if recipientId', () => {
            test('does not belong to any recipient', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, saveCategory, saveProject }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: recipientDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No recipient found');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                recipientId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'recipientId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                recipientId: recipientDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'recipientId');
            });
          });

          test.describe('if projectId', () => {
            test('does not belong to any project', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, saveCategory, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                ...relatedDocumentIds,
                projectId: projectDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No project found');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                projectId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'projectId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
                projectId: projectDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'projectId');
            });
          });
        });
      }
    });
  });
});

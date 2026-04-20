import { entries, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { CategoryType, AccountType } from '@household/shared/enums';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { allowUsers } from '@household/test/utils';
import { accountService, categoryService, productService, projectService, recipientService, transactionService } from '@household/test/dependencies';

import { test, expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';

const expect = mergeExpects(transactionApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

test.describe('POST transaction/v1/transactions/split (split)', () => {
  let request: Transaction.SplitRequest;
  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let accountDocument: Account.Document;
  let secondaryAccountDocument: Account.Document;
  let regularCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;
  let productDocument: Product.Document;
  let relatedDocumentIds: Pick<Transaction.SplitRequest, 'accountId' | 'recipientId'>;
  let relatedDocumentItemIds: Pick<Transaction.SplitRequestItem, 'categoryId' | 'productId' | 'projectId'>;

  test.beforeEach(async () => {
    projectDocument = projectDataFactory.document();
    recipientDocument = recipientDataFactory.document();
    accountDocument = accountDataFactory.document();
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

    relatedDocumentIds = {
      accountId: getAccountId(accountDocument),
      recipientId: getRecipientId(recipientDocument),
    };

    relatedDocumentItemIds = {
      categoryId: getCategoryId(regularCategoryDocument),
      projectId: getProjectId(projectDocument),
      productId: getProductId(productDocument),
    };

    request = splitTransactionDataFactory.request(relatedDocumentIds, [
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(regularCategoryDocument),
      },
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(inventoryCategoryDocument),
      },
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(invoiceCategoryDocument),
      },
    ], [
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(regularCategoryDocument),
        loanAccountId: getAccountId(secondaryAccountDocument),
      },
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(inventoryCategoryDocument),
        loanAccountId: getAccountId(secondaryAccountDocument),
      },
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(invoiceCategoryDocument),
        loanAccountId: getAccountId(secondaryAccountDocument),
      },
    ]
      ,
    );
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateSplitTransaction }) => {
      const res = await requestCreateSplitTransaction(request);
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
        test('should return forbidden', async ({ requestCreateSplitTransaction }) => {
          const res = await requestCreateSplitTransaction(request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should create transaction', () => {
          test('with complete body', async ({ requestCreateSplitTransaction }) => {
            await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
            await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
            await projectService.saveProject(projectDocument);
            await recipientService.saveRecipient(recipientDocument);
            await productService.saveProduct(productDocument);
            const res = await requestCreateSplitTransaction(request);
            expect(res).toBeCreatedResponse();
            const { transactionId } = await res.json() as Transaction.TransactionId;
            expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
          });
          test.describe('without optional properties', () => {
            test('description', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request({
                ...relatedDocumentIds,
                description: undefined,
              }, request.splits, request.loans);
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('recipientId', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: undefined,
              }, request.splits, request.loans);
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('splits', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [], request.loans);
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('loans', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, []);
              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('splits.description', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  description: undefined,
                },
              ], request.loans);
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('splits.inventory', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  categoryId: getCategoryId(inventoryCategoryDocument),
                  productId: undefined,
                  quantity: undefined,
                },
              ], request.loans);
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('splits.invoice', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  categoryId: getCategoryId(invoiceCategoryDocument),
                  invoiceNumber: undefined,
                  billingEndDate: undefined,
                  billingStartDate: undefined,
                },
              ], request.loans);
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('splits.invoice.invoiceNumber', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  categoryId: getCategoryId(invoiceCategoryDocument),
                  invoiceNumber: undefined,
                },
              ], request.loans);
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('splits.categoryId', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  categoryId: undefined,
                },
              ], request.loans);
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('splits.projectId', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  projectId: undefined,
                },
              ], request.loans);

              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('loans.description', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  description: undefined,
                },
              ]);
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('loans.inventory', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  categoryId: getCategoryId(inventoryCategoryDocument),
                  productId: undefined,
                  quantity: undefined,
                },
              ]);
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('loans.invoice', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  categoryId: getCategoryId(invoiceCategoryDocument),
                  invoiceNumber: undefined,
                  billingEndDate: undefined,
                  billingStartDate: undefined,
                },
              ]);

              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('loans.invoice.invoiceNumber', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  categoryId: getCategoryId(invoiceCategoryDocument),
                  invoiceNumber: undefined,
                },
              ]);

              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('loans.categoryId', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  categoryId: undefined,
                },
              ]);
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('loans.projectId', async ({ requestCreateSplitTransaction }) => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  projectId: undefined,
                },
              ]);

              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await transactionService.getTransactionById(transactionId));
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                extra: 123, 
              } as any));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extra');
            });

            test('misses both splits and loans', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], []));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'splits');
              expect(res).toHaveRequiredPropertyValidationError('body', 'loans');
            });
          });

          test.describe('if amount', () => {
            test('is not the same as sum of splits', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                amount: -1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Sum of splits must equal to total amount');
            });

            test('is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                amount: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not number', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                amount: <any>'1', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'amount', 'number');
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                description: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                description: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if issuedAt', () => {
            test('is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                issuedAt: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'issuedAt');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                issuedAt: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'issuedAt', 'string');
            });

            test('is not date-time format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                issuedAt: 'not-date-time', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'issuedAt', 'date-time');
            });
          });

          test.describe('if accountId', () => {
            test('belongs to a loan type account', async ({ requestCreateSplitTransaction }) => {
              const loanAccountDocument = accountDataFactory.document({
                accountType: AccountType.Loan,
              });
              await accountService.saveAccounts(loanAccountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                ...relatedDocumentIds,
                accountId: getAccountId(loanAccountDocument), 
              }, undefined, []));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Account type cannot be loan');
            });

            test('does not belong to any account', async ({ requestCreateSplitTransaction }) => {
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                ...relatedDocumentIds,
                accountId: accountDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the accounts are not found');
            });

            test('is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                accountId: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'accountId');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                accountId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'accountId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                accountId: accountDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'accountId');
            });
          });

          test.describe('if recipientId', () => {
            test('does not belong to any recipient', async ({ requestCreateSplitTransaction }) => {
              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: recipientDataFactory.id(), 
              }, undefined, []));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No recipient found');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                recipientId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'recipientId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request({
                recipientId: recipientDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'recipientId');
            });
          });

          test.describe('if splits', () => {
            test('is not an array', async ({ requestCreateSplitTransaction }) => {
              request.splits = {} as any;
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'splits', 'array');
            });

            test('is empty array', async ({ requestCreateSplitTransaction }) => {
              request.splits = [];
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'splits', 1);
            });
          });

          test.describe('if splits[0]', () => {
            test('is not object', async ({ requestCreateSplitTransaction }) => {
              request.splits = [1 as any];
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'splits/0', 'object');
            });

            test('has additional properties', async ({ requestCreateSplitTransaction }) => {
              request.splits = [
                {
                  extra: 1,
                },
              ] as any;
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'splits/0', 'extra');
            });
          });

          test.describe('if splits.amount', () => {
            test('is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  amount: undefined, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not number', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  amount: <any>'1', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
            });
          });

          test.describe('if splits.description', () => {
            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  description: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  description: '', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if splits.quantity', () => {
            test('is present and productId is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  quantity: 1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'quantity', 'productId');
            });

            test('is not number', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  quantity: <any>'1', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'quantity', 'number');
            });

            test('is too small', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  quantity: 0, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'quantity', 0);
            });
          });

          test.describe('if splits.productId', () => {
            test('is present and quantity is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  productId: productDataFactory.id(),
                  quantity: undefined, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'productId', 'quantity');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  productId: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'productId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  productId: productDataFactory.id('not-mongo-id'), 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'productId');
            });

            test('does not belong to any product', async ({ requestCreateSplitTransaction }) => {
              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  categoryId: getCategoryId(inventoryCategoryDocument),
                  productId: productDataFactory.id(), 
                }, 
              ], []));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No product found');
            });
          });

          test.describe('if splits.invoiceNumber', () => {
            test('is present and billingEndDate, billingStartDate are missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  billingEndDate: undefined,
                  billingStartDate: undefined, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'invoiceNumber', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  invoiceNumber: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'invoiceNumber', 'string');
            });

            test('is too short', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  invoiceNumber: '', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'invoiceNumber', 1);
            });
          });

          test.describe('if splits.billingEndDate', () => {
            test('is present and billingStartDate is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  billingStartDate: undefined, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  billingEndDate: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingEndDate', 'string');
            });

            test('is not date format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  billingEndDate: 'not-date', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingEndDate', 'date');
            });

            test('is later than billingStartDate', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  billingEndDate: '2022-06-01',
                  billingStartDate: '2022-06-03', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooEarlyDateValidationError('body', 'billingEndDate', true);
            });
          });

          test.describe('if splits.billingStartDate', () => {
            test('is present and billingEndDate is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  billingEndDate: undefined, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingStartDate', 'billingEndDate');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  billingStartDate: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingStartDate', 'string');
            });

            test('is not date format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  billingStartDate: 'not-date', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingStartDate', 'date');
            });
          });

          test.describe('if splits.categoryId', () => {
            test('does not belong to any category', async ({ requestCreateSplitTransaction }) => {
              await accountService.saveAccount(accountDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  categoryId: categoryDataFactory.id(), 
                }, 
              ], []));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the categories are not found');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  categoryId: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'categoryId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  categoryId: categoryDataFactory.id('not-mongo-id'), 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'categoryId');
            });
          });

          test.describe('if splits.projectId', () => {
            test('does not belong to any project', async ({ requestCreateSplitTransaction }) => {
              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  projectId: projectDataFactory.id(), 
                }, 
              ], []));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the projects are not found');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  projectId: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'projectId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  projectId: projectDataFactory.id('not-mongo-id'), 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'projectId');
            });
          });

          test.describe('if loans', () => {
            test('is not an array', async ({ requestCreateSplitTransaction }) => {
              request.loans = {} as any;
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'loans', 'array');
            });

            test('is empty array', async ({ requestCreateSplitTransaction }) => {
              request.loans = [];
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'loans', 1);
            });
          });

          test.describe('if loans[0]', () => {
            test('is not object', async ({ requestCreateSplitTransaction }) => {
              request.loans = [1 as any];
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'loans/0', 'object');
            });

            test('has additional properties', async ({ requestCreateSplitTransaction }) => {
              request.loans = [
                {
                  extra: 1,
                },
              ] as any;
              const res = await requestCreateSplitTransaction(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'loans/0', 'extra');
            });
          });

          test.describe('if loans.amount', () => {
            test('is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  amount: undefined, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not number', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  amount: <any>'1', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
            });
          });

          test.describe('if loans.description', () => {
            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  description: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  description: '', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if loans.quantity', () => {
            test('is present and productId is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  quantity: 1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'quantity', 'productId');
            });

            test('is not number', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  quantity: <any>'1', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'quantity', 'number');
            });

            test('is too small', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  quantity: 0, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'quantity', 0);
            });
          });

          test.describe('if loans.productId', () => {
            test('is present and quantity is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  productId: productDataFactory.id(),
                  quantity: undefined, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'productId', 'quantity');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  productId: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'productId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  productId: productDataFactory.id('not-mongo-id'), 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'productId');
            });

            test('does not belong to any product', async ({ requestCreateSplitTransaction }) => {
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategory(inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  categoryId: getCategoryId(inventoryCategoryDocument),
                  productId: productDataFactory.id(), 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No product found');
            });
          });

          test.describe('if loans.invoiceNumber', () => {
            test('is present and billingEndDate, billingStartDate are missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  billingEndDate: undefined,
                  billingStartDate: undefined, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'invoiceNumber', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  invoiceNumber: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'invoiceNumber', 'string');
            });

            test('is too short', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  invoiceNumber: '', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'invoiceNumber', 1);
            });
          });

          test.describe('if loans.billingEndDate', () => {
            test('is present and billingStartDate is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  billingStartDate: undefined, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  billingEndDate: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingEndDate', 'string');
            });

            test('is not date format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  billingEndDate: 'not-date', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingEndDate', 'date');
            });

            test('is later than billingStartDate', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  billingEndDate: '2022-06-01',
                  billingStartDate: '2022-06-03', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooEarlyDateValidationError('body', 'billingEndDate', true);
            });
          });

          test.describe('if loans.billingStartDate', () => {
            test('is present and billingEndDate is missing', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  billingEndDate: undefined, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingStartDate', 'billingEndDate');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  billingStartDate: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingStartDate', 'string');
            });

            test('is not date format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  billingStartDate: 'not-date', 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingStartDate', 'date');
            });
          });

          test.describe('if loans.categoryId', () => {
            test('does not belong to any category', async ({ requestCreateSplitTransaction }) => {
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  ...relatedDocumentItemIds,
                  categoryId: categoryDataFactory.id(),
                  loanAccountId: getAccountId(secondaryAccountDocument), 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the categories are not found');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  categoryId: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'categoryId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  categoryId: categoryDataFactory.id('not-mongo-id'), 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'categoryId');
            });
          });

          test.describe('if loans.projectId', () => {
            test('does not belong to any project', async ({ requestCreateSplitTransaction }) => {
              await accountService.saveAccounts(accountDocument, secondaryAccountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  projectId: projectDataFactory.id(), 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the projects are not found');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  projectId: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'projectId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  projectId: projectDataFactory.id('not-mongo-id'), 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'projectId');
            });
          });

          test.describe('if loans.loanAccountId', () => {
            test('does not belong to any account', async ({ requestCreateSplitTransaction }) => {
              await accountService.saveAccounts(accountDocument);
              await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, []));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the accounts are not found');
            });

            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  loanAccountId: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'loanAccountId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  loanAccountId: accountDataFactory.id('not-mongo-id'), 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'loanAccountId');
            });
          });

          test.describe('if loans.isSettled', () => {
            test('is not boolean', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  isSettled: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'isSettled', 'boolean');
            });
          });

          test.describe('if loans.transactionId', () => {
            test('is not string', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  transactionId: <any>1, 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'transactionId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateSplitTransaction }) => {
              const res = await requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                {
                  transactionId: deferredTransactionDataFactory.id('not-mongo-id'), 
                }, 
              ]));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'transactionId');
            });
          });
        });
      }
    });
  });
});

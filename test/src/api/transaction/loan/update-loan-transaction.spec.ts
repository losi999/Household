import { entries, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { loanTransactionDataFactory } from '@household/test/api/transaction/loan/loan-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { forbidUsers } from '@household/test/utils';

import { transactionApiTest, transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { mergeTests } from '@playwright/test';
import { accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { projectDbTest } from '@household/test/fixtures/project-db.fixture';
import { recipientDbTest } from '@household/test/fixtures/recipient-db.fixture';
import { productDbTest } from '@household/test/fixtures/product-db.fixture';
import { Requests } from '@household/shared/types/requests';

const permissionMap = forbidUsers('viewer') ;

const test = mergeTests(transactionApiTest, accountDbTest, transactionDbTest, categoryDbTest, projectDbTest, recipientDbTest, productDbTest);

test.describe('PUT transaction/v1/transactions/{transactionId}/payment (loan)', () => {
  let request: Requests.PaymentTransaction;
  let originalDocument: Documents.TransferTransaction;

  let projectDocument: Documents.Project;
  let recipientDocument: Documents.Recipient;
  let accountDocument: Documents.Account;
  let loanAccountDocument: Documents.Account;
  let regularCategoryDocument: Documents.Category;
  let invoiceCategoryDocument: Documents.Category;
  let inventoryCategoryDocument: Documents.Category;
  let productDocument: Documents.Product;
  let relatedDocumentIds: Pick<Requests.PaymentTransaction, 'accountId' | 'productId' | 'categoryId' | 'projectId' | 'recipientId' | 'loanAccountId'> ;

  test.beforeEach(async () => {
    projectDocument = projectDataFactory.document();
    recipientDocument = recipientDataFactory.document();
    accountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });
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

    productDocument = productDataFactory.document.generic();

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
      loanAccountId: getAccountId(loanAccountDocument),
    };

    request = loanTransactionDataFactory.request(relatedDocumentIds);
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateToPaymentTransaction }) => {
      const res = await requestUpdateToPaymentTransaction(loanTransactionDataFactory.id(), request);
      transactionApiExpect(res).toBeUnauthorizedResponse();
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
          const res = await requestUpdateToPaymentTransaction(loanTransactionDataFactory.id(), request);
          transactionApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update transaction', () => {
          test.describe('with complete body', () => {
            test('using regular category', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
                            
              const transactionId = getTransactionId(originalDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test('using invoice category', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(originalDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });
            test('using inventory category', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient, saveProduct }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(originalDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });
          });

          test.describe('without optional properties', () => {
            test('description', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                description: undefined,
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(originalDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });
            test(CategoryType.Inventory, async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                productId: undefined,
                quantity: undefined,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(originalDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test(CategoryType.Invoice, async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(originalDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test('invoice.invoiceNumber', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(originalDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test('categoryId', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveProject, saveRecipient }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: undefined,
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(originalDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test('recipientId', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveProject }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: undefined,
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(originalDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test('projectId', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategory, saveRecipient }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                projectId: undefined,
              });

              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(originalDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });
          });

          test.describe('with unsetting', () => {
            let loanDocument: Documents.LoanTransaction;

            test.beforeEach(async () => {
              loanDocument = loanTransactionDataFactory.document({
                account: accountDocument,
                loanAccount: loanAccountDocument,
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
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(inventoryCategoryDocument),
                description: undefined,
              });
              await saveTransaction(loanDocument);
              await saveAccount(accountDocument);
              await saveAccount(loanAccountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProduct(productDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(loanDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(loanDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test(CategoryType.Inventory, async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                productId: undefined,
                quantity: undefined,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              await saveTransaction(loanDocument);
              await saveAccount(accountDocument);
              await saveAccount(loanAccountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(loanDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(loanDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test(CategoryType.Invoice, async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
              });

              await saveTransaction(loanDocument);
              await saveAccount(accountDocument);
              await saveAccount(loanAccountDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(loanDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(loanDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test('invoice.invoiceNumber', async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveCategory, saveProject, saveRecipient }) => {
              loanDocument = loanTransactionDataFactory.document({
                account: accountDocument,
                loanAccount: loanAccountDocument,
                recipient: recipientDocument,
                category: invoiceCategoryDocument,
                product: productDocument,
                body: {
                  description: 'old description',
                },
              });

              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
              });

              await saveTransaction(loanDocument);
              await saveAccount(accountDocument);
              await saveAccount(loanAccountDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(loanDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(loanDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test('categoryId', async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveProject, saveRecipient }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: undefined,
              });

              await saveTransaction(loanDocument);
              await saveAccount(accountDocument);
              await saveAccount(loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(loanDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(loanDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test('recipientId', async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveCategory, saveProject }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: undefined,
              });

              await saveTransaction(loanDocument);
              await saveAccount(accountDocument);
              await saveAccount(loanAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(loanDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(loanDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });

            test('projectId', async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, getTransactionById, saveCategory, saveRecipient }) => {
              request = loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                projectId: undefined,
              });

              await saveTransaction(loanDocument);
              await saveAccount(accountDocument);
              await saveAccount(loanAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(loanDocument), request);
              transactionApiExpect(res).toBeNoContentResponse();
              
              const transactionId = getTransactionId(loanDocument);
              transactionApiExpect(request).toHaveBeenSavedAsLoanTransactionDocument(await getTransactionById(transactionId));
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if transactionId', () => {
            test('is not mongo id', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(loanTransactionDataFactory.id('not-valid'), request);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('pathParameters', 'transactionId');
            });

            test('does not belong to any transaction', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(loanTransactionDataFactory.id(), request);
              transactionApiExpect(res).toBeNotFoundResponse();
            });
          });

          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                extra: 123, 
              } as any));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extra');
            });
          });

          test.describe('if amount', () => {
            test('is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                amount: undefined, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not number', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                amount: <any>'1', 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'amount', 'number');
            });

            test('is bigger than 0', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                amount: 1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveExclusiveTooLargeValidationError('body', 'amount', 0);
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                description: <any>1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                description: '', 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if quantity', () => {
            test('is present and productId is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                productId: undefined,
                quantity: 1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveDependentRequiredPropertyValidationError('body', 'quantity', 'productId');
            });

            test('is not number', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                quantity: <any>'a', 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'quantity', 'number');
            });

            test('is too small', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                quantity: 0, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveExclusiveTooSmallValidationError('body', 'quantity', 0);
            });
          });

          test.describe('if productId', () => {
            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                productId: <any>1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'productId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                productId: productDataFactory.id('not-valid'), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('body', 'productId');
            });

            test('does not belong to any product', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(inventoryCategoryDocument), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveMessage('No product found');
            });
          });

          test.describe('if invoiceNumber', () => {
            test('is present and billingEndDate, billingStartDate are missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                billingEndDate: undefined,
                billingStartDate: undefined, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveDependentRequiredPropertyValidationError('body', 'invoiceNumber', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                invoiceNumber: <any>1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'invoiceNumber', 'string');
            });

            test('is too short', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                invoiceNumber: '', 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveTooShortValidationError('body', 'invoiceNumber', 1);
            });
          });

          test.describe('if billingEndDate', () => {
            test('is present and billingStartDate is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                billingStartDate: undefined, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                billingEndDate: <any>1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'billingEndDate', 'string');
            });

            test('is not date format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                billingEndDate: 'not-date', 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongFormatValidationError('body', 'billingEndDate', 'date');
            });

            test('is later than billingStartDate', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                billingEndDate: '2022-06-01',
                billingStartDate: '2022-06-03', 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveTooEarlyDateValidationError('body', 'billingEndDate', true);
            });
          });

          test.describe('if billingStartDate', () => {
            test('is present and billingEndDate is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                billingEndDate: undefined, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingStartDate', 'billingEndDate');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                billingStartDate: <any>1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'billingStartDate', 'string');
            });

            test('is not date format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                billingStartDate: 'not-date', 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongFormatValidationError('body', 'billingStartDate', 'date');
            });
          });

          test.describe('if issuedAt', () => {
            test('is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                issuedAt: undefined, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveRequiredPropertyValidationError('body', 'issuedAt');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                issuedAt: <any>1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'issuedAt', 'string');
            });

            test('is not date-time format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                issuedAt: 'not-date-time', 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongFormatValidationError('body', 'issuedAt', 'date-time');
            });
          });

          test.describe('if accountId', () => {
            test('does not belong to any account', async ({ requestUpdateToPaymentTransaction, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                accountId: accountDataFactory.id(), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveMessage('No account found');
            });

            test('is missing', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                accountId: undefined, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveRequiredPropertyValidationError('body', 'accountId');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                accountId: <any>1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'accountId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                accountId: accountDataFactory.id('not-mongo-id'), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('body', 'accountId');
            });
          });

          test.describe('if loanAccountId', () => {
            test('does not belong to any account', async ({ requestUpdateToPaymentTransaction, saveAccount, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccount(accountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                loanAccountId: accountDataFactory.id(), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveMessage('No account found');
            });

            test('belongs to a non-loan account', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const nonLoanAccount = accountDataFactory.document();
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, nonLoanAccount);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                loanAccountId: getAccountId(nonLoanAccount), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveMessage('One of the accounts must be loan');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                loanAccountId: <any>1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'loanAccountId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                loanAccountId: accountDataFactory.id('not-mongo-id'), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('body', 'loanAccountId');
            });
          });

          test.describe('if categoryId', () => {
            test('does not belong to any category', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: categoryDataFactory.id(), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveMessage('No category found');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                categoryId: <any>1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'categoryId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                categoryId: categoryDataFactory.id('not-mongo-id'), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('body', 'categoryId');
            });
          });

          test.describe('if recipientId', () => {
            test('does not belong to any recipient', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, saveCategory, saveProject }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveProject(projectDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: recipientDataFactory.id(), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveMessage('No recipient found');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                recipientId: <any>1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'recipientId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                recipientId: recipientDataFactory.id('not-mongo-id'), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('body', 'recipientId');
            });
          });

          test.describe('if projectId', () => {
            test('does not belong to any project', async ({ requestUpdateToPaymentTransaction, saveAccounts, saveTransaction, saveCategory, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveCategory(regularCategoryDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                ...relatedDocumentIds,
                projectId: projectDataFactory.id(), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveMessage('No project found');
            });

            test('is not string', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                projectId: <any>1, 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'projectId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToPaymentTransaction }) => {
              const res = await requestUpdateToPaymentTransaction(getTransactionId(originalDocument), loanTransactionDataFactory.request({
                projectId: projectDataFactory.id('not-mongo-id'), 
              }));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('body', 'projectId');
            });
          });
        });
      }
    });
  });
});

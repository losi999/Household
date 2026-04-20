import { entries, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { forbidUsers } from '@household/test/utils';

import { test, expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { accountService, categoryService, productService, projectService, recipientService, transactionService } from '@household/test/dependencies';

const expect = mergeExpects(transactionApiExpect, apiExpect);

const permissionMap = forbidUsers('viewer') ;

test.describe('POST transaction/v1/transactions/payment (payment)', () => {
  let request: Transaction.PaymentRequest;
  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let accountDocument: Account.Document;
  let regularCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;
  let productDocument: Product.Document;
  let relatedDocumentIds: Pick<Transaction.PaymentRequest, 'accountId' | 'productId' | 'categoryId' | 'projectId' | 'recipientId'> ;

  test.beforeEach(async () => {
    projectDocument = projectDataFactory.document();
    recipientDocument = recipientDataFactory.document();
    accountDocument = accountDataFactory.document();
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
      categoryId: getCategoryId(regularCategoryDocument),
      projectId: getProjectId(projectDocument),
      productId: getProductId(productDocument),
      recipientId: getRecipientId(recipientDocument),
    };

    request = paymentTransactionDataFactory.request(relatedDocumentIds);
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreatePaymentTransaction }) => {
      const res = await requestCreatePaymentTransaction(request);
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
        test('should return forbidden', async ({ requestCreatePaymentTransaction }) => {
          const res = await requestCreatePaymentTransaction(request);
          expect(res).toBeForbiddenResponse();
        });
      } else {

        test.describe('should create transaction', () => {
          test.describe('with complete body', () => {
            test('using regular category', async ({ requestCreatePaymentTransaction }) => {
              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(regularCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(request);
              expect(res).toBeCreatedResponse();

              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsPaymentTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('using invoice category', async ({ requestCreatePaymentTransaction }) => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
              });

              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(invoiceCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(request);
              expect(res).toBeCreatedResponse();
              
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsPaymentTransactionDocument(await transactionService.getTransactionById(transactionId));
            });
            test('using inventory category', async ({ requestCreatePaymentTransaction }) => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              await productService.saveProduct(productDocument);
              const res = await requestCreatePaymentTransaction(request);
              expect(res).toBeCreatedResponse();

              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsPaymentTransactionDocument(await transactionService.getTransactionById(transactionId));
            });
          });

          test.describe('without optional properties', () => {
            test('description', async ({ requestCreatePaymentTransaction }) => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                description: undefined,
              });

              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(regularCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(request);
              expect(res).toBeCreatedResponse();

              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsPaymentTransactionDocument(await transactionService.getTransactionById(transactionId));
            });
            test(CategoryType.Inventory, async ({ requestCreatePaymentTransaction }) => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                productId: undefined,
                quantity: undefined,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(request);
              expect(res).toBeCreatedResponse();

              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsPaymentTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test(CategoryType.Invoice, async ({ requestCreatePaymentTransaction }) => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
              });

              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(invoiceCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(request);
              expect(res).toBeCreatedResponse();

              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsPaymentTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('invoice.invoiceNumber', async ({ requestCreatePaymentTransaction }) => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
              });

              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(invoiceCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(request);
              expect(res).toBeCreatedResponse();

              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsPaymentTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('categoryId', async ({ requestCreatePaymentTransaction }) => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: undefined,
              });

              await accountService.saveAccount(accountDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(request);
              expect(res).toBeCreatedResponse();
              
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsPaymentTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('recipientId', async ({ requestCreatePaymentTransaction }) => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: undefined,
              });

              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(regularCategoryDocument);
              await projectService.saveProject(projectDocument);
              const res = await requestCreatePaymentTransaction(request);
              expect(res).toBeCreatedResponse();

              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsPaymentTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('projectId', async ({ requestCreatePaymentTransaction }) => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                projectId: undefined,
              });

              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(regularCategoryDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(request);
              expect(res).toBeCreatedResponse();

              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsPaymentTransactionDocument(await transactionService.getTransactionById(transactionId));
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                extra: 123, 
              } as any));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extra');
            });
          });

          test.describe('if amount', () => {
            test('is missing', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                amount: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not number', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                amount: <any>'1', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'amount', 'number');
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                description: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                description: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if quantity', () => {
            test('is present and productId is missing', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                productId: undefined,
                quantity: 1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'quantity', 'productId');
            });

            test('is not number', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                quantity: <any>'a', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'quantity', 'number');
            });

            test('is too small', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                quantity: 0, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'quantity', 0);
            });
          });

          test.describe('if productId', () => {
            test('is present and quantity is missing', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                productId: productDataFactory.id(),
                quantity: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'productId', 'quantity');
            });

            test('is not string', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                productId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'productId', 'string');
            });

            test('is not mongo id format', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                productId: productDataFactory.id('not-valid'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'productId');
            });

            test('does not belong to any product', async ({ requestCreatePaymentTransaction }) => {
              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(inventoryCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(inventoryCategoryDocument), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No product found');
            });
          });

          test.describe('if invoiceNumber', () => {
            test('is present and billingEndDate, billingStartDate are missing', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                billingEndDate: undefined,
                billingStartDate: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'invoiceNumber', 'billingEndDate', 'billingStartDate');
            });
            test('is not string', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                invoiceNumber: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'invoiceNumber', 'string');
            });

            test('is too short', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                invoiceNumber: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'invoiceNumber', 1);
            });
          });

          test.describe('if billingEndDate', () => {
            test('is present and billingStartDate is missing', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                billingStartDate: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                billingEndDate: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingEndDate', 'string');
            });

            test('is not date format', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                billingEndDate: 'not-date', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingEndDate', 'date');
            });

            test('is later than billingStartDate', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                billingEndDate: '2022-06-01',
                billingStartDate: '2022-06-03', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooEarlyDateValidationError('body', 'billingEndDate', true);
            });
          });

          test.describe('if billingStartDate', () => {
            test('is present and billingEndDate is missing', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                billingEndDate: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingStartDate', 'billingEndDate');
            });

            test('is not string', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                billingStartDate: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingStartDate', 'string');
            });

            test('is not date format', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                billingStartDate: 'not-date', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingStartDate', 'date');
            });
          });

          test.describe('if issuedAt', () => {
            test('is missing', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                issuedAt: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'issuedAt');
            });

            test('is not string', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                issuedAt: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'issuedAt', 'string');
            });

            test('is not date-time format', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                issuedAt: 'not-date-time', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'issuedAt', 'date-time');
            });
          });

          test.describe('if accountId', () => {
            test('belongs to a loan type account', async ({ requestCreatePaymentTransaction }) => {
              const loanAccountDocument = accountDataFactory.document({
                accountType: AccountType.Loan,
              });
              await accountService.saveAccount(loanAccountDocument);
              await categoryService.saveCategory(regularCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                accountId: getAccountId(loanAccountDocument), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Account type cannot be loan');
            });

            test('does not belong to any account', async ({ requestCreatePaymentTransaction }) => {
              await categoryService.saveCategory(regularCategoryDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                accountId: accountDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No account found');
            });

            test('is missing', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                accountId: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'accountId');
            });

            test('is not string', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                accountId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'accountId', 'string');
            });

            test('is not mongo id format', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                accountId: accountDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'accountId');
            });
          });

          test.describe('if categoryId', () => {
            test('does not belong to any category', async ({ requestCreatePaymentTransaction }) => {
              await accountService.saveAccount(accountDocument);
              await projectService.saveProject(projectDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: categoryDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No category found');
            });

            test('is not string', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                categoryId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'categoryId', 'string');
            });

            test('is not mongo id format', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                categoryId: categoryDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'categoryId');
            });
          });

          test.describe('if recipientId', () => {
            test('does not belong to any recipient', async ({ requestCreatePaymentTransaction }) => {
              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(regularCategoryDocument);
              await projectService.saveProject(projectDocument);
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: recipientDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No recipient found');
            });

            test('is not string', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                recipientId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'recipientId', 'string');
            });

            test('is not mongo id format', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                recipientId: recipientDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'recipientId');
            });
          });

          test.describe('if projectId', () => {
            test('does not belong to any project', async ({ requestCreatePaymentTransaction }) => {
              await accountService.saveAccount(accountDocument);
              await categoryService.saveCategory(regularCategoryDocument);
              await recipientService.saveRecipient(recipientDocument);
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                projectId: projectDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No project found');
            });

            test('is not string', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
                projectId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'projectId', 'string');
            });

            test('is not mongo id format', async ({ requestCreatePaymentTransaction }) => {
              const res = await requestCreatePaymentTransaction(paymentTransactionDataFactory.request({
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

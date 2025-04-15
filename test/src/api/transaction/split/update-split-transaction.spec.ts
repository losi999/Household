import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { CategoryType, AccountType } from '@household/shared/enums';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';

describe('PUT transaction/v1/transactions/{transactionId}/split (split)', () => {
  let request: Transaction.SplitRequest;
  let originalDocument: Transaction.PaymentDocument;

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

  beforeEach(() => {
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

    originalDocument = paymentTransactionDataFactory.document({
      account: accountDocument,
    });

    request = splitTransactionDataFactory.request(relatedDocumentIds, {
      ...relatedDocumentItemIds,
      categoryId: getCategoryId(regularCategoryDocument),
    },
    {
      loanAccountId: getAccountId(secondaryAccountDocument),
    },
    {
      ...relatedDocumentItemIds,
      categoryId: getCategoryId(inventoryCategoryDocument),
    },
    {
      ...relatedDocumentItemIds,
      categoryId: getCategoryId(invoiceCategoryDocument),
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateToSplitTransaction(splitTransactionDataFactory.id(), request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should update transaction', () => {
      it('with complete body', () => {
        cy.saveTransactionDocument(originalDocument)
          .saveAccountDocuments([
            accountDocument,
            secondaryAccountDocument,
          ])
          .saveCategoryDocuments([
            regularCategoryDocument,
            invoiceCategoryDocument,
            inventoryCategoryDocument,
          ])
          .saveProjectDocument(projectDocument)
          .saveRecipientDocument(recipientDocument)
          .saveProductDocument(productDocument)
          .authenticate(1)
          .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
          .expectCreatedResponse()
          .validateTransactionSplitDocument(request);
      });
      describe('without optional properties', () => {
        it('description', () => {
          request = splitTransactionDataFactory.request({
            ...relatedDocumentIds,
            description: undefined,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument(productDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(request);
        });

        it('recipientId', () => {
          request = splitTransactionDataFactory.request({
            ...relatedDocumentIds,
            recipientId: undefined,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveProductDocument(productDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(request);
        });

        it('splits.description', () => {
          request = splitTransactionDataFactory.request(relatedDocumentIds, {
            ...relatedDocumentItemIds,
            description: undefined,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument(productDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(request);
        });

        it('splits.inventory', () => {
          request = splitTransactionDataFactory.request(relatedDocumentIds, {
            ...relatedDocumentItemIds,
            categoryId: getCategoryId(inventoryCategoryDocument),
            productId: undefined,
            quantity: undefined,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument(productDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(request);
        });

        it('splits.invoice', () => {
          request = splitTransactionDataFactory.request(relatedDocumentIds, {
            ...relatedDocumentItemIds,
            categoryId: getCategoryId(invoiceCategoryDocument),
            invoiceNumber: undefined,
            billingEndDate: undefined,
            billingStartDate: undefined,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument(productDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(request);
        });

        it('splits.invoice.invoiceNumber', () => {
          request = splitTransactionDataFactory.request(relatedDocumentIds, {
            ...relatedDocumentItemIds,
            categoryId: getCategoryId(invoiceCategoryDocument),
            invoiceNumber: undefined,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument(productDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(request);
        });

        it('splits.categoryId', () => {
          request = splitTransactionDataFactory.request(relatedDocumentIds, {
            ...relatedDocumentItemIds,
            categoryId: undefined,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(request);
        });

        it('splits.projectId', () => {
          request = splitTransactionDataFactory.request(relatedDocumentIds, {
            ...relatedDocumentItemIds,
            projectId: undefined,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument(productDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(request);
        });
      });
    });

    describe('should return error', () => {
      describe('if transactionId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(splitTransactionDataFactory.id('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transactionId', 'pathParameters');
        });

        it('does not belong to any transaction', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(splitTransactionDataFactory.id(), request)
            .expectNotFoundResponse();
        });
      });

      describe('if body', () => {
        it('has additional properties', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              extra: 123,
            } as any))
            .expectBadRequestResponse()
            .expectAdditionalProperty('data', 'body');
        });
      });

      describe('if amount', () => {
        it('is not the same as sum of splits', () => {
          cy.saveTransactionDocument(originalDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              amount: -2,
            }))
            .expectBadRequestResponse()
            .expectMessage('Sum of splits must equal to total amount');
        });

        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              amount: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('amount', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              amount: '1',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('amount', 'number', 'body');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              description: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              description: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });

      describe('if issuedAt', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              issuedAt: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('issuedAt', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              issuedAt: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('issuedAt', 'string', 'body');
        });

        it('is not date-time format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              issuedAt: 'not-date-time',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('issuedAt', 'date-time', 'body');
        });
      });

      describe('if accountId', () => {
        it('belongs to a loan type account', () => {
          const loanAccountDocument = accountDataFactory.document({
            accountType: AccountType.Loan,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(loanAccountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              ...relatedDocumentIds,
              accountId: getAccountId(loanAccountDocument),
            }))
            .expectBadRequestResponse()
            .expectMessage('Account type cannot be loan');
        });

        it('does not belong to any account', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              ...relatedDocumentIds,
              accountId: accountDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('Some of the accounts are not found');
        });

        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              accountId: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('accountId', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              accountId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              accountId: accountDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'body');
        });
      });

      describe('if recipientId', () => {
        it('does not belong to any recipient', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              ...relatedDocumentIds,
              recipientId: recipientDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('No recipient found');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              recipientId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('recipientId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
              recipientId: recipientDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'body');
        });
      });

      describe('if splits', () => {
        it('is missing', () => {
          request.splits = undefined;
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectBadRequestResponse()
            .expectRequiredProperty('splits', 'body');
        });

        it('is not an array', () => {
          request.splits = {} as any;
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectBadRequestResponse()
            .expectWrongPropertyType('splits', 'array', 'body');
        });

        it('is empty array', () => {
          request.splits = [];
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('splits', 1, 'body');
        });
      });

      describe('if splits[0]', () => {
        it('is not object', () => {
          request.splits = [1] as any;
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectBadRequestResponse()
            .expectWrongPropertyType('splits', 'object', 'body');
        });

        it('has additional properties', () => {
          request.splits = [
            {
              extra: 1,
            },
          ] as any;
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), request)
            .expectBadRequestResponse()
            .expectAdditionalProperty('splits', 'body');
        });
      });

      describe('if splits.amount', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              amount: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('amount', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              amount: undefined,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType ('amount', 'number', 'body');
        });
      });

      describe('if splits.description', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              description: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              description: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });

      describe('if splits.quantity', () => {
        it('is present and productId is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              quantity: 1,
            }))
            .expectBadRequestResponse()
            .expectDependentRequiredProperty('quantity', 'body', 'productId');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              quantity: '1',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('quantity', 'number', 'body');
        });

        it('is too small', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              quantity: 0,
            }))
            .expectBadRequestResponse()
            .expectTooSmallNumberProperty('quantity', 0, true, 'body');
        });
      });

      describe('if splits.productId', () => {
        it('is present and quantity is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              quantity: undefined,
              productId: productDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectDependentRequiredProperty('productId', 'body', 'quantity');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              productId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('productId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              productId: productDataFactory.id('not-valid'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('productId', 'body');
        });

        it('does not belong to any product', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              ...relatedDocumentItemIds,
              categoryId: getCategoryId(inventoryCategoryDocument),
              productId: productDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('No product found');
        });
      });

      describe('if splits.invoiceNumber', () => {
        it('is present and billingEndDate, billingStartDate are missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              billingEndDate: undefined,
              billingStartDate: undefined,
            }))
            .expectBadRequestResponse()
            .expectDependentRequiredProperty('invoiceNumber', 'body', 'billingEndDate', 'billingStartDate');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              invoiceNumber: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('invoiceNumber', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              invoiceNumber: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('invoiceNumber', 1, 'body');
        });
      });

      describe('if splits.billingEndDate', () => {
        it('is present and billingStartDate is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              billingStartDate: undefined,
            }))
            .expectBadRequestResponse()
            .expectDependentRequiredProperty('billingEndDate', 'body', 'billingStartDate');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              billingEndDate: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('billingEndDate', 'string', 'body');
        });

        it('is not date format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              billingEndDate: 'not-date',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('billingEndDate', 'date', 'body');
        });

        it('is later than billingStartDate', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              billingEndDate: '2022-06-01',
              billingStartDate: '2022-06-02',
            }))
            .expectBadRequestResponse()
            .expectTooEarlyDateProperty('billingEndDate', 'body');
        });
      });

      describe('if splits.billingStartDate', () => {
        it('is present and billingEndDate is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              billingEndDate: undefined,
            }))
            .expectBadRequestResponse()
            .expectDependentRequiredProperty('billingStartDate', 'body', 'billingEndDate');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              billingStartDate: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('billingStartDate', 'string', 'body');
        });

        it('is not date format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              billingStartDate: 'not-date',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('billingStartDate', 'date', 'body');
        });
      });

      describe('if splits.categoryId', () => {
        it('does not belong to any category', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              ...relatedDocumentItemIds,
              categoryId: categoryDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('Some of the categories are not found');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              categoryId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('categoryId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              categoryId: categoryDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('categoryId', 'body');
        });
      });

      describe('if splits.projectId', () => {
        it('does not belong to any project', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              ...relatedDocumentItemIds,
              projectId: projectDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('Some of the projects are not found');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              projectId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('projectId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request(relatedDocumentIds, {
              projectId: projectDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'body');
        });
      });
    });
  });
});

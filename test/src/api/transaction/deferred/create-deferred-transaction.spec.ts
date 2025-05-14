import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { AccountType, CategoryType, UserType } from '@household/shared/enums';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';

const allowedUserTypes = [UserType.Editor];

describe('POST transaction/v1/transactions/payment (deferred)', () => {
  let request: Transaction.PaymentRequest;
  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let accountDocument: Account.Document;
  let secondaryAccountDocument: Account.Document;
  let regularCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;
  let productDocument: Product.Document;
  let relatedDocumentIds: Pick<Transaction.PaymentRequest, 'accountId' | 'productId' | 'categoryId' | 'projectId' | 'recipientId' | 'loanAccountId'> ;

  beforeEach(() => {
    projectDocument = projectDataFactory.document();
    recipientDocument = recipientDataFactory.document();
    accountDocument = accountDataFactory.document();
    secondaryAccountDocument = accountDataFactory.document({
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

    productDocument = productDataFactory.document({
      category: inventoryCategoryDocument,
    });

    relatedDocumentIds = {
      accountId: getAccountId(accountDocument),
      categoryId: getCategoryId(regularCategoryDocument),
      projectId: getProjectId(projectDocument),
      productId: getProductId(productDocument),
      recipientId: getRecipientId(recipientDocument),
      loanAccountId: getAccountId(secondaryAccountDocument),
    };

    request = deferredTransactionDataFactory.request(relatedDocumentIds);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreatePaymentTransaction(request)
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestCreatePaymentTransaction(request)
            .expectForbiddenResponse();
        });
      } else {

        describe('should create transaction', () => {
          describe('with complete body', () => {
            it('using regular category', () => {
              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(request)
                .expectCreatedResponse()
                .validateTransactionDeferredDocument(request);
            });

            it('using invoice category', () => {
              request = deferredTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
              });

              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(request)
                .expectCreatedResponse()
                .validateTransactionDeferredDocument(request);
            });
            it('using inventory category', () => {
              request = deferredTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveProductDocument(productDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(request)
                .expectCreatedResponse()
                .validateTransactionDeferredDocument(request);
            });
          });

          describe('without optional properties', () => {
            it('description', () => {
              request = deferredTransactionDataFactory.request({
                ...relatedDocumentIds,
                description: undefined,
              });

              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(request)
                .expectCreatedResponse()
                .validateTransactionDeferredDocument(request);
            });
            it(CategoryType.Inventory, () => {
              request = deferredTransactionDataFactory.request({
                ...relatedDocumentIds,
                productId: undefined,
                quantity: undefined,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(request)
                .expectCreatedResponse()
                .validateTransactionDeferredDocument(request);
            });

            it(CategoryType.Invoice, () => {
              request = deferredTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
              });

              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(request)
                .expectCreatedResponse()
                .validateTransactionDeferredDocument(request);
            });

            it('invoice.invoiceNumber', () => {
              request = deferredTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
              });

              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(request)
                .expectCreatedResponse()
                .validateTransactionDeferredDocument(request);
            });

            it('categoryId', () => {
              request = deferredTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: undefined,
              });

              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(request)
                .expectCreatedResponse()
                .validateTransactionDeferredDocument(request);
            });

            it('recipientId', () => {
              request = deferredTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: undefined,
              });

              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(request)
                .expectCreatedResponse()
                .validateTransactionDeferredDocument(request);
            });

            it('projectId', () => {
              request = deferredTransactionDataFactory.request({
                ...relatedDocumentIds,
                projectId: undefined,
              });

              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(regularCategoryDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(request)
                .expectCreatedResponse()
                .validateTransactionDeferredDocument(request);
            });
          });
        });

        describe('should return error', () => {
          describe('if body', () => {
            it('has additional properties', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  extra: 123,
                } as any))
                .expectBadRequestResponse()
                .expectAdditionalProperty('data', 'body');
            });
          });

          describe('if amount', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  amount: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('amount', 'body');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  amount: <any>'1',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('amount', 'number', 'body');
            });

            it('is bigger than 0', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  amount: 1,
                }))
                .expectBadRequestResponse()
                .expectTooLargeNumberProperty('amount', 0, true, 'body');
            });
          });

          describe('if description', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  description: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('description', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  description: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('description', 1, 'body');
            });
          });

          describe('if quantity', () => {
            it('is present and productId is missing', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  productId: undefined,
                  quantity: 1,
                }))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('quantity', 'body', 'productId');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  quantity: <any>'a',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('quantity', 'number', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  quantity: 0,
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('quantity', 0, true, 'body');
            });
          });

          describe('if productId', () => {
            it('is present and quantity is missing', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  productId: productDataFactory.id(),
                  quantity: undefined,
                }))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('productId', 'body', 'quantity');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  productId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('productId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  productId: productDataFactory.id('not-valid'),
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('productId', 'body');
            });

            it('does not belong to any product', () => {
              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  categoryId: getCategoryId(inventoryCategoryDocument),
                }))
                .expectBadRequestResponse()
                .expectMessage('No product found');
            });
          });

          describe('if invoiceNumber', () => {
            it('is present and billingEndDate, billingStartDate are missing', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  billingEndDate: undefined,
                  billingStartDate: undefined,
                }))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('invoiceNumber', 'body', 'billingEndDate', 'billingStartDate');
            });
            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  invoiceNumber: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('invoiceNumber', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  invoiceNumber: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('invoiceNumber', 1, 'body');
            });
          });

          describe('if billingEndDate', () => {
            it('is present and billingStartDate is missing', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  billingStartDate: undefined,
                }))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('billingEndDate', 'body', 'billingStartDate');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  billingEndDate: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('billingEndDate', 'string', 'body');
            });

            it('is not date format', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  billingEndDate: 'not-date',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('billingEndDate', 'date', 'body');
            });

            it('is later than billingStartDate', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  billingEndDate: '2022-06-01',
                  billingStartDate: '2022-06-03',
                }))
                .expectBadRequestResponse()
                .expectTooEarlyDateProperty('billingEndDate', 'body');
            });
          });

          describe('if billingStartDate', () => {
            it('is present and billingEndDate is missing', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  billingEndDate: undefined,
                }))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('billingStartDate', 'body', 'billingEndDate');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  billingStartDate: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('billingStartDate', 'string', 'body');
            });

            it('is not date format', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  billingStartDate: 'not-date',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('billingStartDate', 'date', 'body');
            });
          });

          describe('if issuedAt', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  issuedAt: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('issuedAt', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  issuedAt: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('issuedAt', 'string', 'body');
            });

            it('is not date-time format', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  issuedAt: 'not-date-time',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('issuedAt', 'date-time', 'body');
            });
          });

          describe('if accountId', () => {
            it('does not belong to any account', () => {
              cy.saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  accountId: accountDataFactory.id(),
                }))
                .expectBadRequestResponse()
                .expectMessage('No account found');
            });

            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  accountId: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('accountId', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  accountId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('accountId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  accountId: accountDataFactory.id('not-mongo-id'),
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('accountId', 'body');
            });
          });

          describe('if loanAccountId', () => {
            it('does not belong to any account', () => {
              cy.saveAccountDocument(accountDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  loanAccountId: accountDataFactory.id(),
                }))
                .expectBadRequestResponse()
                .expectMessage('No account found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  loanAccountId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('loanAccountId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  loanAccountId: accountDataFactory.id('not-mongo-id'),
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('loanAccountId', 'body');
            });
          });

          describe('if categoryId', () => {
            it('does not belong to any category', () => {
              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  categoryId: categoryDataFactory.id(),
                }))
                .expectBadRequestResponse()
                .expectMessage('No category found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  categoryId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('categoryId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  categoryId: categoryDataFactory.id('not-mongo-id'),
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('categoryId', 'body');
            });
          });

          describe('if recipientId', () => {
            it('does not belong to any recipient', () => {
              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  recipientId: recipientDataFactory.id(),
                }))
                .expectBadRequestResponse()
                .expectMessage('No recipient found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  recipientId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('recipientId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  recipientId: recipientDataFactory.id('not-mongo-id'),
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('recipientId', 'body');
            });
          });

          describe('if projectId', () => {
            it('does not belong to any project', () => {
              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocument(regularCategoryDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  projectId: projectDataFactory.id(),
                }))
                .expectBadRequestResponse()
                .expectMessage('No project found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  projectId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('projectId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreatePaymentTransaction(deferredTransactionDataFactory.request({
                  projectId: projectDataFactory.id('not-mongo-id'),
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('projectId', 'body');
            });
          });
        });
      }
    });
  });
});

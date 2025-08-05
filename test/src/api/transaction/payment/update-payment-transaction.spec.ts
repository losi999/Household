
import { entries, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { forbidUsers } from '@household/test/api/utils';

const permissionMap = forbidUsers('viewer') ;

describe('PUT transaction/v1/transactions/{transactionId}/payment (payment)', () => {
  let request: Transaction.PaymentRequest;
  let originalDocument: Transaction.TransferDocument;

  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let accountDocument: Account.Document;
  let regularCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;
  let productDocument: Product.Document;
  let relatedDocumentIds: Pick<Transaction.PaymentRequest, 'accountId' | 'productId' | 'categoryId' | 'projectId' | 'recipientId'> ;

  beforeEach(() => {
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
    };

    request = paymentTransactionDataFactory.request(relatedDocumentIds);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestUpdateToPaymentTransaction(paymentTransactionDataFactory.id(), request)
        .expectUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestUpdateToPaymentTransaction(paymentTransactionDataFactory.id(), request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should update transaction', () => {
          describe('with complete body', () => {
            it('using regular category', () => {
              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it('using invoice category', () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
              });

              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });
            it('using inventory category', () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveProductDocument(productDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });
          });

          describe('without optional properties', () => {
            it('description', () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                description: undefined,
              });
              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });
            it(CategoryType.Inventory, () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                productId: undefined,
                quantity: undefined,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it(CategoryType.Invoice, () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
              });

              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it('invoice.invoiceNumber', () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
              });

              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it('categoryId', () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: undefined,
              });

              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it('recipientId', () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: undefined,
              });

              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it('projectId', () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                projectId: undefined,
              });

              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });
          });

          describe('with unsetting', () => {
            let paymentDocument: Transaction.PaymentDocument;

            beforeEach(() => {
              paymentDocument = paymentTransactionDataFactory.document({
                account: accountDocument,
                project: projectDocument,
                recipient: recipientDocument,
                category: inventoryCategoryDocument,
                product: productDocument,
                body: {
                  description: 'old description',
                },
              });
            });

            it('description', () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(inventoryCategoryDocument),
                description: undefined,
              });
              cy.saveTransactionDocument(paymentDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProductDocument(productDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(paymentDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it(CategoryType.Inventory, () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                productId: undefined,
                quantity: undefined,
                categoryId: getCategoryId(inventoryCategoryDocument),
              });

              cy.saveTransactionDocument(paymentDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(paymentDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it(CategoryType.Invoice, () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
              });

              cy.saveTransactionDocument(paymentDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(paymentDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it('invoice.invoiceNumber', () => {
              paymentDocument = paymentTransactionDataFactory.document({
                account: accountDocument,
                project: projectDocument,
                recipient: recipientDocument,
                category: invoiceCategoryDocument,
                product: productDocument,
                body: {
                  description: 'old description',
                },
              });

              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: undefined,
              });

              cy.saveTransactionDocument(paymentDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(paymentDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it('categoryId', () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                categoryId: undefined,
              });

              cy.saveTransactionDocument(paymentDocument)
                .saveAccountDocument(accountDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(paymentDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it('recipientId', () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: undefined,
              });

              cy.saveTransactionDocument(paymentDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(paymentDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });

            it('projectId', () => {
              request = paymentTransactionDataFactory.request({
                ...relatedDocumentIds,
                projectId: undefined,
              });

              cy.saveTransactionDocument(paymentDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(paymentDocument), request)
                .expectCreatedResponse()
                .validateTransactionPaymentDocument(request);
            });
          });
        });

        describe('should return error', () => {
          describe('if transactionId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(paymentTransactionDataFactory.id('not-valid'), request)
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('transactionId', 'pathParameters');
            });

            it('does not belong to any transaction', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(paymentTransactionDataFactory.id(), request)
                .expectNotFoundResponse();
            });
          });

          describe('if body', () => {
            it('has additional properties', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  extra: 123,
                } as any))
                .expectBadRequestResponse()
                .expectAdditionalProperty('data', 'body');
            });
          });

          describe('if amount', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  amount: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('amount', 'body');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  amount: <any>'1',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('amount', 'number', 'body');
            });
          });

          describe('if description', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  description: <any> 1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('description', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  description: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('description', 1, 'body');
            });
          });

          describe('if quantity', () => {
            it('is present and productId is missing', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  productId: undefined,
                  quantity: 1,
                }))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('quantity', 'body', 'productId');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  quantity: <any>'a',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('quantity', 'number', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  quantity: 0,
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('quantity', 0, true, 'body');
            });
          });

          describe('if productId', () => {
            it('is present and quantity is missing', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  quantity: undefined,
                  productId: productDataFactory.id(),
                }))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('productId', 'body', 'quantity');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  productId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('productId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
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
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
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
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  billingEndDate: undefined,
                  billingStartDate: undefined,
                }))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('invoiceNumber', 'body', 'billingEndDate', 'billingStartDate');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  invoiceNumber: <any> 1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('invoiceNumber', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  invoiceNumber: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('invoiceNumber', 1, 'body');
            });
          });

          describe('if billingEndDate', () => {
            it('is present and billingStartDate is missing', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  billingStartDate: undefined,
                }))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('billingEndDate', 'body', 'billingStartDate');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  billingEndDate: <any> 1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('billingEndDate', 'string', 'body');
            });

            it('is not date format', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  billingEndDate: 'not-date',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('billingEndDate', 'date', 'body');
            });

            it('is later than billingStartDate', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
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
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  billingEndDate: undefined,
                }))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('billingStartDate', 'body', 'billingEndDate');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  billingStartDate: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('billingStartDate', 'string', 'body');
            });

            it('is not date format', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  billingStartDate: 'not-date',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('billingStartDate', 'date', 'body');
            });
          });

          describe('if issuedAt', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  issuedAt: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('issuedAt', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  issuedAt: <any> 1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('issuedAt', 'string', 'body');
            });

            it('is not date-time format', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
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
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  accountId: getAccountId(loanAccountDocument),
                }))
                .expectBadRequestResponse()
                .expectMessage('Account type cannot be loan');
            });
            it('does not belong to any account', () => {
              cy.saveTransactionDocument(originalDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  accountId: accountDataFactory.id(),
                }))
                .expectBadRequestResponse()
                .expectMessage('No account found');
            });

            it('is missing', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  accountId: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('accountId', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  accountId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('accountId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  accountId: accountDataFactory.id('not-mongo-id'),
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('accountId', 'body');
            });
          });

          describe('if categoryId', () => {
            it('does not belong to any category', () => {
              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  categoryId: categoryDataFactory.id(),
                }))
                .expectBadRequestResponse()
                .expectMessage('No category found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  categoryId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('categoryId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  categoryId: categoryDataFactory.id('not-mongo-id'),
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('categoryId', 'body');
            });
          });

          describe('if recipientId', () => {
            it('does not belong to any recipient', () => {
              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveProjectDocument(projectDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  recipientId: recipientDataFactory.id(),
                }))
                .expectBadRequestResponse()
                .expectMessage('No recipient found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  recipientId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('recipientId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  recipientId: recipientDataFactory.id('not-mongo-id'),
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('recipientId', 'body');
            });
          });

          describe('if projectId', () => {
            it('does not belong to any project', () => {
              cy.saveTransactionDocument(originalDocument)
                .saveAccountDocument(accountDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  projectId: projectDataFactory.id(),
                }))
                .expectBadRequestResponse()
                .expectMessage('No project found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
                  projectId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('projectId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), paymentTransactionDataFactory.request({
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

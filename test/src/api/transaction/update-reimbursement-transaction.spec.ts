
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer-data-factory';

describe('PUT transaction/v1/transactions/{transactionId}/payment (reimbursement)', () => {
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

  beforeEach(() => {
    projectDocument = projectDataFactory.document();
    recipientDocument = recipientDataFactory.document();
    accountDocument = accountDataFactory.document({
      accountType: 'loan',
    });
    secondaryAccountDocument = accountDataFactory.document();
    regularCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: 'regular',
      },
    });

    invoiceCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: 'invoice',
      },
    });

    inventoryCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: 'inventory',
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

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateToPaymentTransaction(reimbursementTransactionDataFactory.id(), request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should update transaction', () => {
      describe('with complete body', () => {
        it('using regular category', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(regularCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionReimbursementDocument(request);
        });

        it('using invoice category', () => {
          request = reimbursementTransactionDataFactory.request({
            ...relatedDocumentIds,
            categoryId: getCategoryId(invoiceCategoryDocument),
          });

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionReimbursementDocument(request);
        });
        it('using inventory category', () => {
          request = reimbursementTransactionDataFactory.request({
            ...relatedDocumentIds,
            categoryId: getCategoryId(inventoryCategoryDocument),
          });

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument(productDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionReimbursementDocument(request);
        });
      });

      describe('without optional properties', () => {
        it('description', () => {
          request = reimbursementTransactionDataFactory.request({
            ...relatedDocumentIds,
            description: undefined,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(regularCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionReimbursementDocument(request);
        });
        it('inventory', () => {
          request = reimbursementTransactionDataFactory.request({
            ...relatedDocumentIds,
            productId: undefined,
            quantity: undefined,
            categoryId: getCategoryId(inventoryCategoryDocument),
          });

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionReimbursementDocument(request);
        });

        it('invoice', () => {
          request = reimbursementTransactionDataFactory.request({
            ...relatedDocumentIds,
            categoryId: getCategoryId(invoiceCategoryDocument),
            invoiceNumber: undefined,
            billingEndDate: undefined,
            billingStartDate: undefined,
          });

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionReimbursementDocument(request);
        });

        it('invoice.invoiceNumber', () => {
          request = reimbursementTransactionDataFactory.request({
            ...relatedDocumentIds,
            categoryId: getCategoryId(invoiceCategoryDocument),
            invoiceNumber: undefined,
          });

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionReimbursementDocument(request);
        });

        it('categoryId', () => {
          request = reimbursementTransactionDataFactory.request({
            ...relatedDocumentIds,
            categoryId: undefined,
          });

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionReimbursementDocument(request);
        });

        it('recipientId', () => {
          request = reimbursementTransactionDataFactory.request({
            ...relatedDocumentIds,
            recipientId: undefined,
          });

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(regularCategoryDocument)
            .saveProjectDocument(projectDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionReimbursementDocument(request);
        });

        it('projectId', () => {
          request = reimbursementTransactionDataFactory.request({
            ...relatedDocumentIds,
            projectId: undefined,
          });

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(regularCategoryDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionReimbursementDocument(request);
        });
      });
    });

    describe('should return error', () => {
      describe('if transactionId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(reimbursementTransactionDataFactory.id('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transactionId', 'pathParameters');
        });

        it('does not belong to any transaction', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(reimbursementTransactionDataFactory.id(), request)
            .expectNotFoundResponse();
        });
      });

      describe('if body', () => {
        it('has additional properties', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              extra: 123,
            } as any))
            .expectBadRequestResponse()
            .expectAdditionalProperty('data', 'body');
        });
      });

      describe('if amount', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              amount: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('amount', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              amount: '1',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('amount', 'number', 'body');
        });

        it('is bigger than 0', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              ...relatedDocumentIds,
              amount: 1,
            }))
            .expectBadRequestResponse()
            .expectTooLargeNumberProperty('amount', 0, true, 'body');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              description: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              description: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });

      describe('if quantity', () => {
        it('is present and productId is missing', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              productId: undefined,
              quantity: 1,
            }))
            .expectBadRequestResponse()
            .expectDependentRequiredProperty('quantity', 'body', 'productId');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              quantity: 'a',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('quantity', 'number', 'body');
        });

        it('is too small', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              quantity: 0,
            }))
            .expectBadRequestResponse()
            .expectTooSmallNumberProperty('quantity', 0, true, 'body');
        });
      });

      describe('if productId', () => {
        it('is present and quantity is missing', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              quantity: undefined,
              productId: productDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectDependentRequiredProperty('productId', 'body', 'quantity');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              productId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('productId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              productId: productDataFactory.id('not-valid'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('productId', 'body');
        });

        it('does not belong to any product', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              ...relatedDocumentIds,
              categoryId: getCategoryId(inventoryCategoryDocument),
            }))
            .expectBadRequestResponse()
            .expectMessage('No product found');
        });
      });

      describe('if invoiceNumber', () => {
        it('is present and billingEndDate, billingStartDate are missing', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              billingEndDate: undefined,
              billingStartDate: undefined,
            }))
            .expectBadRequestResponse()
            .expectDependentRequiredProperty('invoiceNumber', 'body', 'billingEndDate', 'billingStartDate');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              invoiceNumber: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('invoiceNumber', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              invoiceNumber: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('invoiceNumber', 1, 'body');
        });
      });

      describe('if billingEndDate', () => {
        it('is present and billingStartDate is missing', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              billingStartDate: undefined,
            }))
            .expectBadRequestResponse()
            .expectDependentRequiredProperty('billingEndDate', 'body', 'billingStartDate');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              billingEndDate: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('billingEndDate', 'string', 'body');
        });

        it('is not date format', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              billingEndDate: 'not-date',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('billingEndDate', 'date', 'body');
        });

        it('is later than billingStartDate', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              billingEndDate: '2022-06-01',
              billingStartDate: '2022-06-03',
            }))
            .expectBadRequestResponse()
            .expectTooEarlyDateProperty('billingEndDate', 'body');
        });
      });

      describe('if billingStartDate', () => {
        it('is present and billingEndDate is missing', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              billingEndDate: undefined,
            }))
            .expectBadRequestResponse()
            .expectDependentRequiredProperty('billingStartDate', 'body', 'billingEndDate');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              billingStartDate: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('billingStartDate', 'string', 'body');
        });

        it('is not date format', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              billingStartDate: 'not-date',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('billingStartDate', 'date', 'body');
        });
      });

      describe('if issuedAt', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              issuedAt: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('issuedAt', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              issuedAt: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('issuedAt', 'string', 'body');
        });

        it('is not date-time format', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              issuedAt: 'not-date-time',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('issuedAt', 'date-time', 'body');
        });
      });

      describe('if accountId', () => {
        it('does not belong to any account', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              ...relatedDocumentIds,
              accountId: accountDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('No account found');
        });

        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              accountId: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('accountId', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              accountId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              accountId: accountDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'body');
        });
      });

      describe('if loanAccountId', () => {
        it('belongs to a loan type account', () => {
          const loanAccountDocument = accountDataFactory.document({
            accountType: 'loan',
          });
          cy
            .saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              loanAccountDocument,
              accountDocument,
            ])
            .saveCategoryDocument(regularCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              ...relatedDocumentIds,
              loanAccountId: getAccountId(loanAccountDocument),
            }))
            .expectBadRequestResponse()
            .expectMessage('Account type cannot be loan');
        });

        it('does not belong to any account', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              ...relatedDocumentIds,
              loanAccountId: accountDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('No account found');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              loanAccountId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('loanAccountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              loanAccountId: accountDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('loanAccountId', 'body');
        });
      });

      describe('if categoryId', () => {
        it('does not belong to any category', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              ...relatedDocumentIds,
              categoryId: categoryDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('No category found');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              categoryId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('categoryId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              categoryId: categoryDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('categoryId', 'body');
        });
      });

      describe('if recipientId', () => {
        it('does not belong to any recipient', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(regularCategoryDocument)
            .saveProjectDocument(projectDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              ...relatedDocumentIds,
              recipientId: recipientDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('No recipient found');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              recipientId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('recipientId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              recipientId: recipientDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'body');
        });
      });

      describe('if projectId', () => {
        it('does not belong to any project', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocuments([
              accountDocument,
              secondaryAccountDocument,
            ])
            .saveCategoryDocument(regularCategoryDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              ...relatedDocumentIds,
              projectId: projectDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('No project found');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              projectId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('projectId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToPaymentTransaction(getTransactionId(originalDocument), reimbursementTransactionDataFactory.request({
              projectId: projectDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'body');
        });
      });
    });
  });
});

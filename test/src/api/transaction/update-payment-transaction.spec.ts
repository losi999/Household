import { createAccountId, createCategoryId, createProjectId, createRecipientId, createTransactionId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('PUT transaction/v1/transactions/{transactionId}/payment', () => {
  let request: Transaction.PaymentRequest;
  let originalDocument: Transaction.TransferDocument;

  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let accountDocument: Account.Document;
  let regularCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;

  beforeEach(() => {
    projectDocument = projectDocumentConverter.create({
      name: 'proj',
      description: 'desc',
    }, Cypress.env('EXPIRES_IN'));
    projectDocument._id = new Types.ObjectId();

    recipientDocument = recipientDocumentConverter.create({
      name: 'recipient',
    }, Cypress.env('EXPIRES_IN'));
    recipientDocument._id = new Types.ObjectId();

    accountDocument = accountDocumentConverter.create({
      name: 'bank',
      accountType: 'bankAccount',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'));
    accountDocument._id = new Types.ObjectId();

    regularCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: 'regular',
        categoryType: 'regular',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'));
    regularCategoryDocument._id = new Types.ObjectId();

    invoiceCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: 'invoice',
        categoryType: 'invoice',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'));
    invoiceCategoryDocument._id = new Types.ObjectId();

    inventoryCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: 'inventory',
        categoryType: 'inventory',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'));
    inventoryCategoryDocument._id = new Types.ObjectId();

    originalDocument = transactionDocumentConverter.createTransferDocument({
      body: {
        accountId: createAccountId(accountDocument._id),
        amount: 100,
        description: undefined,
        issuedAt: new Date().toISOString(),
        transferAccountId: createAccountId(accountDocument._id),
      },
      account: accountDocument,
      transferAccount: accountDocument,
    }, Cypress.env('EXPIRES_IN'));
    originalDocument._id = new Types.ObjectId();

    request = {
      amount: 100,
      accountId: createAccountId(accountDocument._id),
      categoryId: createCategoryId(regularCategoryDocument._id),
      projectId: createProjectId(projectDocument._id),
      recipientId: createRecipientId(recipientDocument._id),
      description: 'new description',
      issuedAt: new Date(2022, 6, 9, 22, 30, 12).toISOString(),
      invoice: {
        billingStartDate: new Date(2022, 6, 1, 0, 0, 0).toISOString()
          .split('T')[0],
        billingEndDate: new Date(2022, 6, 25, 0, 0, 0).toISOString()
          .split('T')[0],
        invoiceNumber: 'invoice123',
      },
      inventory: {
        brand: 'brand',
        measurement: 200,
        quantity: 1,
        unitOfMeasurement: 'kg',
      },
    };
  });

  describe('called as an admin', () => {
    describe('should update transaction', () => {
      describe('with complete body', () => {
        it('using regular category', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), request)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(request, regularCategoryDocument);
        });

        it('using invoice category', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            categoryId: createCategoryId(invoiceCategoryDocument._id),
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest, invoiceCategoryDocument);
        });
        it('using inventory category', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            categoryId: createCategoryId(inventoryCategoryDocument._id),
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest, inventoryCategoryDocument);
        });
      });

      describe('without optional properties', () => {
        it('description', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            description: undefined,
          };
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest, regularCategoryDocument);
        });
        it('inventory', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            inventory: undefined,
            categoryId: createCategoryId(inventoryCategoryDocument._id),
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest, inventoryCategoryDocument);
        });

        it('inventory.brand', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            categoryId: createCategoryId(inventoryCategoryDocument._id),
            inventory: {
              ...request.inventory,
              brand: undefined,
            },
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest, inventoryCategoryDocument);
        });

        it('inventory.measurement', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            categoryId: createCategoryId(inventoryCategoryDocument._id),
            inventory: {
              ...request.inventory,
              measurement: undefined,
            },
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest, inventoryCategoryDocument);
        });

        it('inventory.unitOfMeasurement', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            categoryId: createCategoryId(inventoryCategoryDocument._id),
            inventory: {
              ...request.inventory,
              unitOfMeasurement: undefined,
            },
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest, inventoryCategoryDocument);
        });

        it('invoice', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            categoryId: createCategoryId(invoiceCategoryDocument._id),
            invoice: undefined,
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest, invoiceCategoryDocument);
        });

        it('invoice.invoiceNumber', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            categoryId: createCategoryId(invoiceCategoryDocument._id),
            invoice: {
              ...request.invoice,
              invoiceNumber: undefined,
            },
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest, invoiceCategoryDocument);
        });

        it('categoryId', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            categoryId: undefined,
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest);
        });

        it('recipientId', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            recipientId: undefined,
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveProjectDocument(projectDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest, regularCategoryDocument);
        });

        it('projectId', () => {
          const modifiedRequest: Transaction.PaymentRequest = {
            ...request,
            projectId: undefined,
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionPaymentDocument(modifiedRequest, regularCategoryDocument);
        });
      });
    });

    describe('should return error', () => {
      describe('if transactionId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transactionId', 'pathParameters');
        });

        it('does not belong to any transaction', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(), request)
            .expectNotFoundResponse();
        });
      });

      describe('if body', () => {
        it('has additional properties', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              extra: 123,
            } as any)
            .expectBadRequestResponse()
            .expectAdditionalProperty('data', 'body');
        });
      });

      describe('if amount', () => {
        it('is missing', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              amount: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('amount', 'body');
        });

        it('is not number', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              amount: '1' as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('amount', 'number', 'body');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              description: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              description: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });

      describe('if inventory', () => {
        it('is not object', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              inventory: '1' as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('inventory', 'object', 'body');
        });

        it('has additional properties', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              inventory: {
                ...request.inventory,
                extra: 1,
              } as any,
            })
            .expectBadRequestResponse()
            .expectAdditionalProperty('inventory', 'body');
        });
      });

      describe('if inventory.quantity', () => {
        it('is missing', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              inventory: {
                ...request.inventory,
                quantity: undefined,
              },
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('quantity', 'body');
        });

        it('is not number', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              inventory: {
                ...request.inventory,
                quantity: 'a' as any,
              },
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('quantity', 'number', 'body');
        });

        it('is too small', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              inventory: {
                ...request.inventory,
                quantity: 0,
              },
            })
            .expectBadRequestResponse()
            .expectTooSmallNumberProperty('quantity', 0, true, 'body');
        });
      });

      describe('if inventory.brand', () => {
        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              inventory: {
                ...request.inventory,
                brand: 1 as any,
              },
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('brand', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              inventory: {
                ...request.inventory,
                brand: '',
              },
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('brand', 1, 'body');
        });
      });

      describe('if inventory.measurement', () => {
        it('is not number', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              inventory: {
                ...request.inventory,
                measurement: 'a' as any,
              },
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('measurement', 'number', 'body');
        });

        it('is too small', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              inventory: {
                ...request.inventory,
                measurement: 0,
              },
            })
            .expectBadRequestResponse()
            .expectTooSmallNumberProperty('measurement', 0, true, 'body');
        });
      });

      describe('if inventory.unitOfMeasurement', () => {
        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              inventory: {
                ...request.inventory,
                unitOfMeasurement: 1 as any,
              },
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('unitOfMeasurement', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              inventory: {
                ...request.inventory,
                unitOfMeasurement: 'lb' as any,
              },
            })
            .expectBadRequestResponse()
            .expectWrongEnumValue('unitOfMeasurement', 'body');
        });
      });

      describe('if invoice', () => {
        it('is not object', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              invoice: '1' as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('invoice', 'object', 'body');
        });

        it('has additional properties', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              invoice: {
                ...request.invoice,
                extra: 1,
              } as any,
            })
            .expectBadRequestResponse()
            .expectAdditionalProperty('invoice', 'body');
        });
      });

      describe('if invoice.invoiceNumber', () => {
        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              invoice: {
                ...request.invoice,
                invoiceNumber: 1 as any,
              },
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('invoiceNumber', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              invoice: {
                ...request.invoice,
                invoiceNumber: '',
              },
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('invoiceNumber', 1, 'body');
        });
      });

      describe('if invoice.billingEndDate', () => {
        it('is missing', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              invoice: {
                ...request.invoice,
                billingEndDate: undefined,
              },
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('billingEndDate', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              invoice: {
                ...request.invoice,
                billingEndDate: 1 as any,
              },
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('billingEndDate', 'string', 'body');
        });

        it('is not date format', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              invoice: {
                ...request.invoice,
                billingEndDate: 'not-date',
              },
            })
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('billingEndDate', 'date', 'body');
        });

        it('is earlier than billingStartDate', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              invoice: {
                ...request.invoice,
                billingEndDate: '2022-06-01',
                billingStartDate: '2022-06-03',
              },
            })
            .expectBadRequestResponse()
            .expectTooEarlyDateProperty('billingEndDate', 'body');
        });
      });

      describe('if invoice.billingStartDate', () => {
        it('is missing', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              invoice: {
                ...request.invoice,
                billingStartDate: undefined,
              },
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('billingStartDate', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              invoice: {
                ...request.invoice,
                billingStartDate: 1 as any,
              },
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('billingStartDate', 'string', 'body');
        });

        it('is not date format', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              invoice: {
                ...request.invoice,
                billingStartDate: 'not-date',
              },
            })
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('billingStartDate', 'date', 'body');
        });
      });

      describe('if issuedAt', () => {
        it('is missing', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              issuedAt: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('issuedAt', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              issuedAt: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('issuedAt', 'string', 'body');
        });

        it('is not date-time format', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              issuedAt: 'not-date-time',
            })
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
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              accountId: createAccountId(),
            })
            .expectBadRequestResponse()
            .expectMessage('No account found');
        });

        it('is missing', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              accountId: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('accountId', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              accountId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              accountId: createAccountId('not-mongo-id'),
            })
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
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              categoryId: createCategoryId(),
            })
            .expectBadRequestResponse()
            .expectMessage('No category found');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              categoryId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('categoryId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              categoryId: createCategoryId('not-mongo-id'),
            })
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
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              recipientId: createRecipientId(),
            })
            .expectBadRequestResponse()
            .expectMessage('No recipient found');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              recipientId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('recipientId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              recipientId: createRecipientId('not-mongo-id'),
            })
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
            .authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              projectId: createProjectId(),
            })
            .expectBadRequestResponse()
            .expectMessage('No project found');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              projectId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('projectId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate('admin1')
            .requestUpdateToPaymentTransaction(createTransactionId(originalDocument._id), {
              ...request,
              projectId: createProjectId('not-mongo-id'),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'body');
        });
      });
    });
  });
});

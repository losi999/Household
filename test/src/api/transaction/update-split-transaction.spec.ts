import { createAccountId, createCategoryId, createProjectId, createRecipientId, createTransactionId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('POST transaction/v1/accounts/{accountId}/transactions/split', () => {
  let request: Transaction.SplitRequest;
  let originalDocument: Transaction.PaymentDocument;

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

    const inventory: Transaction.Inventory['inventory'] = {
      brand: 'brand',
      measurement: 200,
      quantity: 1,
      unitOfMeasurement: 'kg',
    };

    const invoice: Transaction.Invoice<string>['invoice'] = {
      billingStartDate: new Date(2022, 6, 1, 0, 0, 0).toISOString()
        .split('T')[0],
      billingEndDate: new Date(2022, 6, 25, 0, 0, 0).toISOString()
        .split('T')[0],
      invoiceNumber: 'invoice123',
    };

    originalDocument = transactionDocumentConverter.createPaymentDocument({
      body: {
        accountId: createAccountId(accountDocument._id),
        amount: 100,
        description: undefined,
        issuedAt: new Date().toISOString(),
        categoryId: undefined,
        inventory: undefined,
        invoice: undefined,
        projectId: undefined,
        recipientId: undefined,
      },
      account: accountDocument,
      category: undefined,
      project: undefined,
      recipient: undefined,
    }, Cypress.env('EXPIRES_IN'));
    originalDocument._id = new Types.ObjectId();

    request = {
      accountId: createAccountId(accountDocument._id),
      recipientId: createRecipientId(recipientDocument._id),
      amount: 3,
      description: 'description',
      issuedAt: new Date(2022, 6, 9, 22, 30, 12).toISOString(),
      splits: [
        {
          amount: 1,
          description: 'split1',
          categoryId: createCategoryId(regularCategoryDocument._id),
          projectId: createProjectId(projectDocument._id),
          invoice,
          inventory,
        },
        {
          amount: 1,
          description: 'split2',
          categoryId: createCategoryId(inventoryCategoryDocument._id),
          projectId: createProjectId(projectDocument._id),
          invoice,
          inventory,
        },
        {
          amount: 1,
          description: 'split3',
          categoryId: createCategoryId(invoiceCategoryDocument._id),
          projectId: createProjectId(projectDocument._id),
          invoice,
          inventory,
        },

      ],
    };
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateToSplitTransaction(createTransactionId(), request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should create transaction', () => {
      it('with complete body', () => {
        cy.saveTransactionDocument(originalDocument)
          .saveAccountDocument(accountDocument)
          .saveCategoryDocument(regularCategoryDocument)
          .saveCategoryDocument(invoiceCategoryDocument)
          .saveCategoryDocument(inventoryCategoryDocument)
          .saveProjectDocument(projectDocument)
          .saveRecipientDocument(recipientDocument)
          .authenticate(1)
          .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), request)
          .expectCreatedResponse()
          .validateTransactionSplitDocument(request, regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
      });
      describe('without optional properties', () => {
        it('description', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            description: undefined,
          };
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest, regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
        });

        it('recipientId', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            recipientId: undefined,
          };
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest, regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
        });

        it('splits.description', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              description: undefined,
            })),
          };
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest, regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
        });

        it('splits.inventory', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              inventory: undefined,
            })),
          };
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest, regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
        });

        it('splits.inventory.brand', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              inventory: {
                ...s.inventory,
                brand: undefined,
              },
            })),
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest, regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
        });

        it('splits.inventory.measurement', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              inventory: {
                ...s.inventory,
                measurement: undefined,
              },
            })),
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest, regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
        });

        it('splits.inventory.unitOfMeasurement', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              inventory: {
                ...s.inventory,
                unitOfMeasurement: undefined,
              },
            })),
          };

          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest, regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
        });

        it('splits.invoice', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              invoice: undefined,
            })),
          };
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest, regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
        });

        it('splits.invoice.invoiceNumber', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              invoice: {
                ...s.invoice,
                invoiceNumber: undefined,
              },
            })),
          };
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest, regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
        });

        it('splits.categoryId', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              categoryId: undefined,
            })),
          };
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest);
        });

        it('splits.projectId', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              projectId: undefined,
            })),
          };
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest, regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
        });
      });
    });

    describe('should return error', () => {
      describe('if transactionId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transactionId', 'pathParameters');
        });

        it('does not belong to any transaction', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(), request)
            .expectNotFoundResponse();
        });
      });

      describe('if body', () => {
        it('has additional properties', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              extra: 123,
            } as any)
            .expectBadRequestResponse()
            .expectAdditionalProperty('data', 'body');
        });
      });

      describe('if amount', () => {
        it('is not the same as sum of splits', () => {
          cy.saveTransactionDocument(originalDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              amount: 2,
            })
            .expectBadRequestResponse()
            .expectMessage('Sum of splits must equal to total amount');
        });

        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              amount: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('amount', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              amount: '1' as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('amount', 'number', 'body');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              description: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              description: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });

      describe('if issuedAt', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              issuedAt: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('issuedAt', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              issuedAt: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('issuedAt', 'string', 'body');
        });

        it('is not date-time format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
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
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              accountId: createAccountId(),
            })
            .expectBadRequestResponse()
            .expectMessage('No account found');
        });

        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              accountId: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('accountId', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              accountId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              accountId: createAccountId('not-mongo-id'),
            })
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
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              recipientId: createRecipientId(),
            })
            .expectBadRequestResponse()
            .expectMessage('No recipient found');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              recipientId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('recipientId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              recipientId: createRecipientId('not-mongo-id'),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'body');
        });
      });

      describe('if splits', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('splits', 'body');
        });

        it('is not an array', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('splits', 'array', 'body');
        });

        it('is empty array', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: [],
            })
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('splits', 1, 'body');
        });
      });

      describe('if splits[0]', () => {
        it('is not object', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: [1] as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('splits', 'object', 'body');
        });

        it('has additional properties', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                extra: 1,
              }) as any),
            })
            .expectBadRequestResponse()
            .expectAdditionalProperty('splits', 'body');
        });
      });

      describe('if splits.amount', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                amount: undefined,
              })),
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('amount', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                amount: '1' as any,
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType ('amount', 'number', 'body');
        });
      });

      describe('if splits.description', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                description: 1 as any,
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                description: '',
              })),
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });

      describe('if splits.inventory', () => {
        it('is not object', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: '' as any,
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('inventory', 'object', 'body');
        });

        it('has additional properties', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  extra: 1,
                } as any,
              })),
            })
            .expectBadRequestResponse()
            .expectAdditionalProperty('inventory', 'body');
        });
      });

      describe('if splits.inventory.quantity', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  quantity: undefined,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('quantity', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  quantity: '1' as any,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('quantity', 'number', 'body');
        });

        it('is too small', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  quantity: 0,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectTooSmallNumberProperty('quantity', 0, true, 'body');
        });
      });

      describe('if splits.inventory.brand', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  brand: 1 as any,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('brand', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  brand: '',
                },
              })),
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('brand', 1, 'body');
        });
      });

      describe('if splits.inventory.measurement', () => {
        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  measurement: '1' as any,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('measurement', 'number', 'body');
        });

        it('is too small', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  measurement: 0,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectTooSmallNumberProperty('measurement', 0, true, 'body');
        });
      });

      describe('if splits.inventory.unitOfMeasurement', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  unitOfMeasurement: 1 as any,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('unitOfMeasurement', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  unitOfMeasurement: 'lb' as any,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectWrongEnumValue('unitOfMeasurement', 'body');
        });
      });

      describe('if splits.invoice', () => {
        it('is not object', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                invoice: '1' as any,
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('invoice', 'object', 'body');
        });

        it('has additional properties', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                invoice: {
                  ...s.invoice,
                  extra: 1,
                } as any,
              })),
            })
            .expectBadRequestResponse()
            .expectAdditionalProperty('invoice', 'body');
        });
      });

      describe('if splits.invoice.invoiceNumber', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                invoice: {
                  ...s.invoice,
                  invoiceNumber: 1 as any,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('invoiceNumber', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                invoice: {
                  ...s.invoice,
                  invoiceNumber: '',
                },
              })),
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('invoiceNumber', 1, 'body');
        });
      });

      describe('if splits.invoice.billingEndDate', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                invoice: {
                  ...s.invoice,
                  billingEndDate: undefined,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('billingEndDate', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                invoice: {
                  ...s.invoice,
                  billingEndDate: 1 as any,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('billingEndDate', 'string', 'body');
        });

        it('is not date format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                invoice: {
                  ...s.invoice,
                  billingEndDate: 'not-date',
                },
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('billingEndDate', 'date', 'body');
        });

        it('is earlier than billingStartDate', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                invoice: {
                  ...s.invoice,
                  billingEndDate: '2022-06-01',
                  billingStartDate: '2022-06-02',
                },
              })),
            })
            .expectBadRequestResponse()
            .expectTooEarlyDateProperty('billingEndDate', 'body');
        });
      });

      describe('if splits.invoice.billingStartDate', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                invoice: {
                  ...s.invoice,
                  billingStartDate: undefined,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('billingStartDate', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                invoice: {
                  ...s.invoice,
                  billingStartDate: 1 as any,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('billingStartDate', 'string', 'body');
        });

        it('is not date format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                invoice: {
                  ...s.invoice,
                  billingStartDate: 'not-date',
                },
              })),
            })
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
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                categoryId: createCategoryId(),
              })),
            })
            .expectBadRequestResponse()
            .expectMessage('Some of the categories are not found');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                categoryId: 1 as any,
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('categoryId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                categoryId: createCategoryId('not-mongo-id'),
              })),
            })
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
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                projectId: createProjectId(),
              })),
            })
            .expectBadRequestResponse()
            .expectMessage('Some of the projects are not found');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                projectId: 1 as any,
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('projectId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToSplitTransaction(createTransactionId(originalDocument._id), {
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                projectId: createProjectId('not-mongo-id'),
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'body');
        });
      });
    });
  });
});

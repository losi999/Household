import { createAccountId, createCategoryId, createProductId, createProjectId, createRecipientId } from '@household/shared/common/test-data-factory';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('POST transaction/v1/transactions/split', () => {
  let request: Transaction.SplitRequest;
  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let accountDocument: Account.Document;
  let regularCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;
  let productDocument: Product.Document;

  beforeEach(() => {
    projectDocument = projectDocumentConverter.create({
      name: `proj-${uuid()}`,
      description: 'desc',
    }, Cypress.env('EXPIRES_IN'), true);

    recipientDocument = recipientDocumentConverter.create({
      name: `recipient-${uuid()}`,
    }, Cypress.env('EXPIRES_IN'), true);

    accountDocument = accountDocumentConverter.create({
      name: `bank-${uuid()}`,
      accountType: 'bankAccount',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'), true);

    regularCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: `regular-${uuid()}`,
        categoryType: 'regular',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    invoiceCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: `invoice-${uuid()}`,
        categoryType: 'invoice',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    inventoryCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: `inventory-${uuid()}`,
        categoryType: 'inventory',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    productDocument = productDocumentConverter.create({
      brand: `brand-${uuid()}`,
      measurement: 200,
      unitOfMeasurement: 'kg',
    }, Cypress.env('EXPIRES_IN'), true);

    const inventory: Transaction.InventoryItem<Product.ProductId> = {
      quantity: 1,
      productId: getProductId(productDocument),
    };

    const invoice: Transaction.Invoice<string>['invoice'] = {
      billingStartDate: new Date(2022, 6, 1, 0, 0, 0).toISOString()
        .split('T')[0],
      billingEndDate: new Date(2022, 6, 25, 0, 0, 0).toISOString()
        .split('T')[0],
      invoiceNumber: 'invoice123',
    };

    request = {
      accountId: getAccountId(accountDocument),
      recipientId: getRecipientId(recipientDocument),
      amount: 3,
      description: 'description',
      issuedAt: new Date(2022, 6, 9, 22, 30, 12).toISOString(),
      splits: [
        {
          amount: 1,
          description: 'split1',
          categoryId: getCategoryId(regularCategoryDocument),
          projectId: getProjectId(projectDocument),
          invoice,
          inventory,
        },
        {
          amount: 1,
          description: 'split2',
          categoryId: getCategoryId(inventoryCategoryDocument),
          projectId: getProjectId(projectDocument),
          invoice,
          inventory,
        },
        {
          amount: 1,
          description: 'split3',
          categoryId: getCategoryId(invoiceCategoryDocument),
          projectId: getProjectId(projectDocument),
          invoice,
          inventory,
        },

      ],
    };
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestCreateSplitTransaction(request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should create transaction', () => {
      it('with complete body', () => {
        cy.saveAccountDocument(accountDocument)
          .saveCategoryDocument(regularCategoryDocument)
          .saveCategoryDocument(invoiceCategoryDocument)
          .saveCategoryDocument(inventoryCategoryDocument)
          .saveProjectDocument(projectDocument)
          .saveRecipientDocument(recipientDocument)
          .saveProductDocument({
            document: productDocument,
            categoryId: getCategoryId(inventoryCategoryDocument),
          })
          .authenticate(1)
          .requestCreateSplitTransaction(request)
          .expectCreatedResponse()
          .validateTransactionSplitDocument(request);
      });
      describe('without optional properties', () => {
        it('description', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            description: undefined,
          };
          cy.saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument({
              document: productDocument,
              categoryId: getCategoryId(inventoryCategoryDocument),
            })
            .authenticate(1)
            .requestCreateSplitTransaction(modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest);
        });

        it('recipientId', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            recipientId: undefined,
          };
          cy.saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveProductDocument({
              document: productDocument,
              categoryId: getCategoryId(inventoryCategoryDocument),
            })
            .authenticate(1)
            .requestCreateSplitTransaction(modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest);
        });

        it('splits.description', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              description: undefined,
            })),
          };
          cy.saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument({
              document: productDocument,
              categoryId: getCategoryId(inventoryCategoryDocument),
            })
            .authenticate(1)
            .requestCreateSplitTransaction(modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest);
        });

        it('splits.inventory', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              inventory: undefined,
            })),
          };
          cy.saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument({
              document: productDocument,
              categoryId: getCategoryId(inventoryCategoryDocument),
            })
            .authenticate(1)
            .requestCreateSplitTransaction(modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest);
        });

        it('splits.invoice', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              invoice: undefined,
            })),
          };
          cy.saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument({
              document: productDocument,
              categoryId: getCategoryId(inventoryCategoryDocument),
            })
            .authenticate(1)
            .requestCreateSplitTransaction(modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest);
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
          cy.saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument({
              document: productDocument,
              categoryId: getCategoryId(inventoryCategoryDocument),
            })
            .authenticate(1)
            .requestCreateSplitTransaction(modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest);
        });

        it('splits.categoryId', () => {
          const modifiedRequest: Transaction.SplitRequest = {
            ...request,
            splits: request.splits.map(s => ({
              ...s,
              categoryId: undefined,
            })),
          };
          cy.saveAccountDocument(accountDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestCreateSplitTransaction(modifiedRequest)
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
          cy.saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveRecipientDocument(recipientDocument)
            .saveProductDocument({
              document: productDocument,
              categoryId: getCategoryId(inventoryCategoryDocument),
            })
            .authenticate(1)
            .requestCreateSplitTransaction(modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionSplitDocument(modifiedRequest);
        });
      });
    });

    describe('should return error', () => {
      describe('if body', () => {
        it('has additional properties', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              extra: 123,
            } as any)
            .expectBadRequestResponse()
            .expectAdditionalProperty('data', 'body');
        });
      });

      describe('if amount', () => {
        it('is not the same as sum of splits', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              amount: 2,
            })
            .expectBadRequestResponse()
            .expectMessage('Sum of splits must equal to total amount');
        });

        it('is missing', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              amount: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('amount', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
              ...request,
              description: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
              ...request,
              issuedAt: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('issuedAt', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              issuedAt: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('issuedAt', 'string', 'body');
        });

        it('is not date-time format', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              issuedAt: 'not-date-time',
            })
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('issuedAt', 'date-time', 'body');
        });
      });

      describe('if accountId', () => {
        it('does not belong to any account', () => {
          cy.saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              accountId: createAccountId(),
            })
            .expectBadRequestResponse()
            .expectMessage('No account found');
        });

        it('is missing', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              accountId: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('accountId', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              accountId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              accountId: createAccountId('not-mongo-id'),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'body');
        });
      });

      describe('if recipientId', () => {
        it('does not belong to any recipient', () => {
          cy.saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              recipientId: createRecipientId(),
            })
            .expectBadRequestResponse()
            .expectMessage('No recipient found');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              recipientId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('recipientId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
              ...request,
              splits: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('splits', 'body');
        });

        it('is not an array', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              splits: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('splits', 'array', 'body');
        });

        it('is empty array', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
              ...request,
              splits: [1] as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('splits', 'object', 'body');
        });

        it('has additional properties', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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

      describe('if splits.inventory.productId', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  productId: undefined,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('productId', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  productId: 1 as any,
                },
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('productId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
              ...request,
              splits: request.splits.map(s => ({
                ...s,
                inventory: {
                  ...s.inventory,
                  productId: createProductId('not-valid'),
                },
              })),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('productId', 'body');
        });

        it('does not belong to any product', () => {
          cy.saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestCreateSplitTransaction(request)
            .expectBadRequestResponse()
            .expectMessage('No product found');
        });
      });

      describe('if splits.invoice', () => {
        it('is not object', () => {
          cy.authenticate(1)
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
          cy.saveAccountDocument(accountDocument)
            .saveProjectDocument(projectDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
          cy.saveAccountDocument(accountDocument)
            .saveCategoryDocument(regularCategoryDocument)
            .saveCategoryDocument(invoiceCategoryDocument)
            .saveCategoryDocument(inventoryCategoryDocument)
            .saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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
            .requestCreateSplitTransaction({
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

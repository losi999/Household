import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { v4 as uuid } from 'uuid';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, toDictionary } from '@household/shared/common/utils';
import { default as schema } from '@household/test/api/schemas/transaction-report-list';
import { createAccountId } from '@household/shared/common/test-data-factory';

const createPaymentDocument = (data: {
  account: Account.Document;
  category?: Category.Document;
  project?: Project.Document;
  recipient?: Recipient.Document;
  product?: Product.Document;
} & Partial<Omit<Transaction.PaymentRequest, 'productId' | 'categoryId' | 'accountId' | 'recipientId' | 'projectId'>>,
): Transaction.PaymentDocument => {
  const { account, project, product, recipient, category, ...request } = data;

  return transactionDocumentConverter.createPaymentDocument({
    body: {
      accountId: getAccountId(account),
      amount: 100,
      categoryId: getCategoryId(category),
      recipientId: getRecipientId(recipient),
      projectId: getProjectId(project),
      quantity: undefined,
      productId: getProductId(product),
      issuedAt: new Date(2024, 5, 25, 14, 0, 0).toISOString(),
      invoiceNumber: undefined,
      billingEndDate: undefined,
      billingStartDate: undefined,
      description: uuid(),
      ...request,
    },
    account: account,
    category: category,
    product: product,
    project: project,
    recipient: recipient,
  }, Cypress.env('EXPIRES_IN'), true);
};

describe('POST /transaction/v1/transactions', () => {
  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetTransactionList([])
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should get a list of transaction reports', () => {
      let accountDocument: Account.Document;
      let secondaryAccountDocument: Account.Document;
      let projectDocument: Project.Document;
      let secondaryProjectDocument: Project.Document;
      let recipientDocument: Recipient.Document;
      let secondaryRecipientDocument: Recipient.Document;
      let regularCategoryDocument: Category.Document;
      let inventoryCategoryDocument: Category.Document;
      let invoiceCategoryDocument: Category.Document;
      let secondaryCategoryDocumen: Category.Document;
      let productDocument: Product.Document;
      let secondaryProductDocument: Product.Document;
      let fullPaymentTransactionDocument: Transaction.PaymentDocument;
      let accountTransactionDocument: Transaction.PaymentDocument;
      let secondaryAccountTransactionDocument: Transaction.PaymentDocument;
      let projectTransactionDocument: Transaction.PaymentDocument;
      let secondaryProjectTransactionDocument: Transaction.PaymentDocument;
      let recipientTransactionDocument: Transaction.PaymentDocument;
      let secondaryRecipientTransactionDocument: Transaction.PaymentDocument;
      let regularCategoryTransactionDocument: Transaction.PaymentDocument;
      let inventoryCategoryTransactionDocument: Transaction.PaymentDocument;
      let invoiceCategoryTransactionDocument: Transaction.PaymentDocument;
      let secondaryCategoryTransactionDocument: Transaction.PaymentDocument;
      let productTransactionDocument: Transaction.PaymentDocument;
      let secondaryProductTransactionDocument: Transaction.PaymentDocument;
      let earlyTransactionDocument: Transaction.PaymentDocument;
      let lateTransactionDocument: Transaction.PaymentDocument;
      let fullSplitTransactionDocument: Transaction.SplitDocument;
      let secondaryAccountSplitTransactionDocument: Transaction.SplitDocument;
      let secondaryRecipientSplitTransactionDocument: Transaction.SplitDocument;
      let transferTransactionDocument: Transaction.TransferDocument;

      before(() => {
        accountDocument = accountDocumentConverter.create({
          name: `account-${uuid()}`,
          accountType: 'bankAccount',
          currency: 'Ft',
          owner: 'owner1',
        }, Cypress.env('EXPIRES_IN'), true);

        secondaryAccountDocument = accountDocumentConverter.create({
          name: `excluded-account-${uuid()}`,
          accountType: 'bankAccount',
          currency: 'Ft',
          owner: 'owner1',
        }, Cypress.env('EXPIRES_IN'), true);

        projectDocument = projectDocumentConverter.create({
          name: `project-${uuid()}`,
          description: 'decription',
        }, Cypress.env('EXPIRES_IN'), true);

        secondaryProjectDocument = projectDocumentConverter.create({
          name: `excluded-project-${uuid()}`,
          description: 'decription',
        }, Cypress.env('EXPIRES_IN'), true);

        recipientDocument = recipientDocumentConverter.create({
          name: `recipient-${uuid()}`,
        }, Cypress.env('EXPIRES_IN'), true);

        secondaryRecipientDocument = recipientDocumentConverter.create({
          name: `excluded-recipient-${uuid()}`,
        }, Cypress.env('EXPIRES_IN'), true);

        regularCategoryDocument = categoryDocumentConverter.create({
          body: {
            name: `regular-category-${uuid()}`,
            categoryType: 'regular',
            parentCategoryId: undefined,
          },
          parentCategory: undefined,
        }, Cypress.env('EXPIRES_IN'), true);

        inventoryCategoryDocument = categoryDocumentConverter.create({
          body: {
            name: `inventory-category-${uuid()}`,
            categoryType: 'inventory',
            parentCategoryId: undefined,
          },
          parentCategory: undefined,
        }, Cypress.env('EXPIRES_IN'), true);

        invoiceCategoryDocument = categoryDocumentConverter.create({
          body: {
            name: `invoice-category-${uuid()}`,
            categoryType: 'invoice',
            parentCategoryId: undefined,
          },
          parentCategory: undefined,
        }, Cypress.env('EXPIRES_IN'), true);

        secondaryCategoryDocumen = categoryDocumentConverter.create({
          body: {
            name: `excluded-category-${uuid()}`,
            categoryType: 'regular',
            parentCategoryId: undefined,
          },
          parentCategory: undefined,
        }, Cypress.env('EXPIRES_IN'), true);

        productDocument = productDocumentConverter.create({
          body: {
            brand: `brand-${uuid()}`,
            measurement: 500,
            unitOfMeasurement: 'g',
          },
          category: inventoryCategoryDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        secondaryProductDocument = productDocumentConverter.create({
          body: {
            brand: `excluded-brand-${uuid()}`,
            measurement: 500,
            unitOfMeasurement: 'g',
          },
          category: inventoryCategoryDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        fullPaymentTransactionDocument = createPaymentDocument({
          account: accountDocument,
          category: inventoryCategoryDocument,
          recipient: recipientDocument,
          project: projectDocument,
          quantity: 1,
          product: productDocument,
        });

        accountTransactionDocument = createPaymentDocument({
          account: accountDocument,
        });

        secondaryAccountTransactionDocument = createPaymentDocument({
          account: secondaryAccountDocument,
        });

        projectTransactionDocument = createPaymentDocument({
          account: accountDocument,
          project: projectDocument,
        });

        secondaryProjectTransactionDocument = createPaymentDocument({
          account: accountDocument,
          project: secondaryProjectDocument,
        });

        recipientTransactionDocument = createPaymentDocument({
          account: accountDocument,
          recipient: recipientDocument,
        });

        secondaryRecipientTransactionDocument = createPaymentDocument({
          account: accountDocument,
          recipient: secondaryRecipientDocument,
        });

        regularCategoryTransactionDocument = createPaymentDocument({
          account: accountDocument,
          category: regularCategoryDocument,
        });

        inventoryCategoryTransactionDocument = createPaymentDocument({
          account: accountDocument,
          category: inventoryCategoryDocument,
        });

        invoiceCategoryTransactionDocument = createPaymentDocument({
          account: accountDocument,
          category: invoiceCategoryDocument,
        });

        secondaryCategoryTransactionDocument = createPaymentDocument({
          account: accountDocument,
          category: secondaryCategoryDocumen,
        });

        productTransactionDocument = createPaymentDocument({
          account: accountDocument,
          category: inventoryCategoryDocument,
          product: productDocument,
          quantity: 1,
        });

        secondaryProductTransactionDocument = createPaymentDocument({
          account: accountDocument,
          category: inventoryCategoryDocument,
          product: secondaryProductDocument,
          quantity: 1,
        });

        earlyTransactionDocument = createPaymentDocument({
          account: accountDocument,
          issuedAt: new Date(2024, 5, 25, 13, 50, 0).toISOString(),
        });

        lateTransactionDocument = createPaymentDocument({
          account: accountDocument,
          issuedAt: new Date(2024, 5, 25, 14, 10, 0).toISOString(),
        });

        fullSplitTransactionDocument = transactionDocumentConverter.createSplitDocument({
          body: {
            accountId: getAccountId(accountDocument),
            amount: 28,
            recipientId: getRecipientId(recipientDocument),
            description: undefined,
            issuedAt: new Date(2024, 5, 25, 14, 0, 0).toISOString(),
            splits: [
              {
                amount: 1,
                categoryId: getCategoryId(inventoryCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
                quantity: 2,
                productId: getProductId(productDocument),
                projectId: getProjectId(projectDocument),
                description: uuid(),
              },
              {
                amount: 2,
                categoryId: getCategoryId(regularCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
                quantity: undefined,
                productId: undefined,
                projectId: undefined,
                description: uuid(),
              },
              {
                amount: 3,
                categoryId: getCategoryId(inventoryCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
                quantity: undefined,
                productId: undefined,
                projectId: undefined,
                description: uuid(),
              },
              {
                amount: 4,
                categoryId: getCategoryId(invoiceCategoryDocument),
                invoiceNumber: '1234',
                billingEndDate: '2022-02-20',
                billingStartDate: '2022-02-01',
                quantity: undefined,
                productId: undefined,
                projectId: undefined,
                description: uuid(),
              },
              {
                amount: 5,
                categoryId: getCategoryId(secondaryCategoryDocumen),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
                quantity: undefined,
                productId: undefined,
                projectId: undefined,
                description: uuid(),
              },
              {
                amount: 6,
                categoryId: getCategoryId(inventoryCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
                quantity: 2,
                productId: getProductId(productDocument),
                projectId: undefined,
                description: uuid(),
              },
              {
                amount: 7,
                categoryId: getCategoryId(inventoryCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
                quantity: 2,
                productId: getProductId(secondaryProductDocument),
                projectId: undefined,
                description: uuid(),
              },
            ],
          },
          account: accountDocument,
          categories: toDictionary([
            regularCategoryDocument,
            inventoryCategoryDocument,
            invoiceCategoryDocument,
            secondaryCategoryDocumen,
          ], '_id'),
          projects: toDictionary([
            projectDocument,
            secondaryProjectDocument,
          ], '_id'),
          products: toDictionary([
            productDocument,
            secondaryProductDocument,
          ], '_id'),
          recipient: recipientDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        secondaryAccountSplitTransactionDocument = transactionDocumentConverter.createSplitDocument({
          body: {
            accountId: getAccountId(secondaryAccountDocument),
            amount: 100,
            recipientId: getRecipientId(recipientDocument),
            description: undefined,
            issuedAt: new Date(2024, 5, 25, 14, 0, 0).toISOString(),
            splits: [
              {
                amount: 100,
                categoryId: getCategoryId(inventoryCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
                quantity: 2,
                productId: getProductId(productDocument),
                projectId: getProjectId(projectDocument),
                description: uuid(),
              },
            ],
          },
          account: secondaryAccountDocument,
          categories: toDictionary([inventoryCategoryDocument], '_id'),
          projects: toDictionary([projectDocument], '_id'),
          products: toDictionary([productDocument], '_id'),
          recipient: recipientDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        secondaryRecipientSplitTransactionDocument = transactionDocumentConverter.createSplitDocument({
          body: {
            accountId: getAccountId(accountDocument),
            amount: 100,
            recipientId: getRecipientId(secondaryRecipientDocument),
            description: undefined,
            issuedAt: new Date(2024, 5, 25, 14, 0, 0).toISOString(),
            splits: [
              {
                amount: 100,
                categoryId: getCategoryId(inventoryCategoryDocument),
                invoiceNumber: undefined,
                billingEndDate: undefined,
                billingStartDate: undefined,
                quantity: 2,
                productId: getProductId(productDocument),
                projectId: getProjectId(projectDocument),
                description: uuid(),
              },
            ],
          },
          account: accountDocument,
          categories: toDictionary([inventoryCategoryDocument], '_id'),
          projects: toDictionary([projectDocument], '_id'),
          products: toDictionary([productDocument], '_id'),
          recipient: secondaryRecipientDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        transferTransactionDocument = transactionDocumentConverter.createTransferDocument({
          body: {
            accountId: getAccountId(accountDocument),
            transferAccountId: getAccountId(secondaryAccountDocument),
            amount: 100,
            transferAmount: -100,
            description: 'transfer',
            issuedAt: new Date(2024, 5, 25, 14, 0, 0).toISOString(),
          },
          account: accountDocument,
          transferAccount: secondaryAccountDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        cy.saveRecipientDocument(recipientDocument)
          .saveRecipientDocument(secondaryRecipientDocument)
          .saveAccountDocument(accountDocument)
          .saveAccountDocument(secondaryAccountDocument)
          .saveCategoryDocument(regularCategoryDocument)
          .saveCategoryDocument(invoiceCategoryDocument)
          .saveCategoryDocument(inventoryCategoryDocument)
          .saveCategoryDocument(secondaryCategoryDocumen)
          .saveProjectDocument(projectDocument)
          .saveProjectDocument(secondaryProjectDocument)
          .saveProductDocument(productDocument)
          .saveProductDocument(secondaryProductDocument)
          .saveTransactionDocument(fullPaymentTransactionDocument)
          .saveTransactionDocument(accountTransactionDocument)
          .saveTransactionDocument(secondaryAccountTransactionDocument)
          .saveTransactionDocument(projectTransactionDocument)
          .saveTransactionDocument(secondaryProjectTransactionDocument)
          .saveTransactionDocument(recipientTransactionDocument)
          .saveTransactionDocument(secondaryRecipientTransactionDocument)
          .saveTransactionDocument(regularCategoryTransactionDocument)
          .saveTransactionDocument(inventoryCategoryTransactionDocument)
          .saveTransactionDocument(invoiceCategoryTransactionDocument)
          .saveTransactionDocument(secondaryCategoryTransactionDocument)
          .saveTransactionDocument(productTransactionDocument)
          .saveTransactionDocument(secondaryProductTransactionDocument)
          .saveTransactionDocument(earlyTransactionDocument)
          .saveTransactionDocument(lateTransactionDocument)
          .saveTransactionDocument(fullSplitTransactionDocument)
          .saveTransactionDocument(secondaryAccountSplitTransactionDocument)
          .saveTransactionDocument(secondaryRecipientSplitTransactionDocument)
          .saveTransactionDocument(transferTransactionDocument);
      });
      it('queried by every property', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(accountDocument)],
              exclude: false,
            },
            {
              filterType: 'recipient',
              items: [getRecipientId(recipientDocument)],
              exclude: false,
            },
            {
              filterType: 'project',
              items: [getProjectId(projectDocument)],
              exclude: false,
            },
            {
              filterType: 'category',
              items: [
                getCategoryId(regularCategoryDocument),
                getCategoryId(invoiceCategoryDocument),
                getCategoryId(inventoryCategoryDocument),
              ],
              exclude: false,
            },
            {
              filterType: 'product',
              items: [getProductId(productDocument)],
              exclude: false,
            },
            {
              filterType: 'issuedAt',
              exclude: false,
              from: new Date(2024, 5, 25, 13, 59, 0).toISOString(),
              to: new Date(2024, 5, 25, 14, 1, 0).toISOString(),
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([fullPaymentTransactionDocument], [
            [
              fullSplitTransactionDocument,
              [0],
            ],
          ]);
      });
      it('by including an account', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(secondaryAccountDocument)],
              exclude: false,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([secondaryAccountTransactionDocument], [
            [
              secondaryAccountSplitTransactionDocument,
              [0],
            ],
          ]);
      });
      it('by excluding an account', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'recipient',
              items: [getRecipientId(recipientDocument)],
              exclude: false,
            },
            {
              filterType: 'account',
              items: [getAccountId(secondaryAccountDocument)],
              exclude: true,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([
            fullPaymentTransactionDocument,
            recipientTransactionDocument,
          ], [
            [
              fullSplitTransactionDocument,
              [
                0,
                1,
                2,
                3,
                4,
                5,
                6,
              ],
            ],
          ]);
      });
      it('by including a category', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(accountDocument)],
              exclude: false,
            },
            {
              filterType: 'category',
              items: [getCategoryId(regularCategoryDocument)],
              exclude: false,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([regularCategoryTransactionDocument], [
            [
              fullSplitTransactionDocument,
              [1],
            ],
          ]);
      });
      it('by excluding a category', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(accountDocument)],
              exclude: false,
            },
            {
              filterType: 'category',
              items: [getCategoryId(inventoryCategoryDocument)],
              exclude: true,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([
            accountTransactionDocument,
            projectTransactionDocument,
            secondaryProjectTransactionDocument,
            recipientTransactionDocument,
            secondaryRecipientTransactionDocument,
            regularCategoryTransactionDocument,
            invoiceCategoryTransactionDocument,
            secondaryCategoryTransactionDocument,
            earlyTransactionDocument,
            lateTransactionDocument,
          ], [
            [
              fullSplitTransactionDocument,
              [
                1,
                3,
                4,
              ],
            ],
          ]);
      });
      it('by including a project', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(accountDocument)],
              exclude: false,
            },
            {
              filterType: 'project',
              items: [getProjectId(projectDocument)],
              exclude: false,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([
            fullPaymentTransactionDocument,
            projectTransactionDocument,
          ], [
            [
              fullSplitTransactionDocument,
              [0],
            ],
            [
              secondaryRecipientSplitTransactionDocument,
              [0],
            ],
          ]);
      });
      it('by excluding a project', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(accountDocument)],
              exclude: false,
            },
            {
              filterType: 'project',
              items: [getProjectId(projectDocument)],
              exclude: true,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([
            accountTransactionDocument,
            secondaryProjectTransactionDocument,
            recipientTransactionDocument,
            secondaryRecipientTransactionDocument,
            regularCategoryTransactionDocument,
            inventoryCategoryTransactionDocument,
            invoiceCategoryTransactionDocument,
            secondaryCategoryTransactionDocument,
            productTransactionDocument,
            secondaryProductTransactionDocument,
            earlyTransactionDocument,
            lateTransactionDocument,
          ], [
            [
              fullSplitTransactionDocument,
              [
                1,
                2,
                3,
                4,
                5,
                6,
              ],
            ],
          ]);
      });
      it('by including a recipient', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(accountDocument)],
              exclude: false,
            },
            {
              filterType: 'recipient',
              items: [getRecipientId(recipientDocument)],
              exclude: false,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([
            fullPaymentTransactionDocument,
            recipientTransactionDocument,
          ], [
            [
              fullSplitTransactionDocument,
              [
                0,
                1,
                2,
                3,
                4,
                5,
                6,
              ],
            ],
          ]);
      });
      it('by excluding a recipient', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(accountDocument)],
              exclude: false,
            },
            {
              filterType: 'recipient',
              items: [getRecipientId(recipientDocument)],
              exclude: true,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([
            accountTransactionDocument,
            projectTransactionDocument,
            secondaryProjectTransactionDocument,
            secondaryRecipientTransactionDocument,
            regularCategoryTransactionDocument,
            inventoryCategoryTransactionDocument,
            invoiceCategoryTransactionDocument,
            secondaryCategoryTransactionDocument,
            productTransactionDocument,
            secondaryProductTransactionDocument,
            earlyTransactionDocument,
            lateTransactionDocument,
          ], [
            [
              secondaryRecipientSplitTransactionDocument,
              [0],
            ],
          ]);
      });
      it('by including a product', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(accountDocument)],
              exclude: false,
            },
            {
              filterType: 'product',
              items: [getProductId(productDocument)],
              exclude: false,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([
            fullPaymentTransactionDocument,
            productTransactionDocument,
          ], [
            [
              fullSplitTransactionDocument,
              [
                0,
                5,
              ],
            ],
            [
              secondaryRecipientSplitTransactionDocument,
              [0],
            ],
          ]);
      });
      it('by excluding a product', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(accountDocument)],
              exclude: false,
            },
            {
              filterType: 'product',
              items: [getProductId(productDocument)],
              exclude: true,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([
            accountTransactionDocument,
            projectTransactionDocument,
            secondaryProjectTransactionDocument,
            recipientTransactionDocument,
            secondaryRecipientTransactionDocument,
            regularCategoryTransactionDocument,
            inventoryCategoryTransactionDocument,
            invoiceCategoryTransactionDocument,
            secondaryCategoryTransactionDocument,
            secondaryProductTransactionDocument,
            earlyTransactionDocument,
            lateTransactionDocument,
          ], [
            [
              fullSplitTransactionDocument,
              [
                1,
                2,
                3,
                4,
                6,
              ],
            ],
          ]);
      });
      it('filtered starting from given date', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(accountDocument)],
              exclude: false,
            },
            {
              filterType: 'issuedAt',
              from: new Date(2024, 5, 25, 14, 5, 0).toISOString(),
              to: undefined,
              exclude: false,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([lateTransactionDocument], []);
      });
      it('filtered ending with given date', () => {
        cy.authenticate(1)
          .requestGetTransactionList([
            {
              filterType: 'account',
              items: [getAccountId(accountDocument)],
              exclude: false,
            },
            {
              filterType: 'issuedAt',
              to: new Date(2024, 5, 25, 13, 55, 0).toISOString(),
              from: undefined,
              exclude: false,
            },
          ])
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListReport([earlyTransactionDocument], []);
      });

    });

    describe('should return error', () => {
      describe('if body', () => {
        it('is not an array', () => {
          cy.authenticate(1)
            .requestGetTransactionList({} as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'array', 'body');
        });

        it('does not have at least one item', () => {
          cy.authenticate(1)
            .requestGetTransactionList([])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('data', 1, 'body');
        });
      });

      describe('if body[0]', () => {
        it('has additional properties', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'account',
                items: [createAccountId()],
                exclude: false,
                extra: 1,
              } as any,
            ])
            .expectBadRequestResponse()
            .expectAdditionalProperty('data', 'body');
        });

        it('is missing both "from" and "to" properties', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'issuedAt',
                from: undefined,
                to: undefined,
                exclude: false,
              },
            ])
            .expectBadRequestResponse()
            .expectRequiredProperty('from', 'body')
            .expectRequiredProperty('to', 'body');
        });
      });

      describe('if body[0].exclude', () => {
        it('is not boolean', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'account',
                items: [createAccountId()],
                exclude: 1 as any,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType ('exclude', 'boolean', 'body');
        });
      });

      describe('if body[0].filterType', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: undefined,
                items: [createAccountId()],
                exclude: true,
              },
            ])
            .expectBadRequestResponse()
            .expectRequiredProperty ('filterType', 'body');
        });
        it('is not string', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 1 as any,
                items: [createAccountId()],
                exclude: true,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType ('filterType', 'string', 'body');
        });
        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'not filter type' as any,
                items: [createAccountId()],
                exclude: true,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongEnumValue ('filterType', 'body');
        });
      });

      describe('if body[0].items', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'account',
                items: undefined,
                exclude: true,
              },
            ])
            .expectBadRequestResponse()
            .expectRequiredProperty ('items', 'body');
        });
        it('is not an array', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'account',
                items: 1 as any,
                exclude: true,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType ('items', 'array', 'body');
        });
        it('has less than 1 item', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'account',
                items: [],
                exclude: true,
              },
            ])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty ('items', 1, 'body');
        });
      });

      describe('if body[0].items[0]', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'account',
                items: [1 as any],
                exclude: true,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType('items/0', 'string', 'body');
        });
        it('does not match pattern', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'account',
                items: ['not mongo id' as any],
                exclude: true,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('items/0', 'body');
        });
      });

      describe('if body[0].from', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'issuedAt',
                exclude: true,
                from: 1 as any,
                to: undefined,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType('from', 'string', 'body');
        });
        it('is not a date', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'issuedAt',
                exclude: true,
                from: 'not date',
                to: undefined,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('from', 'date-time', 'body');
        });
      });

      describe('if body[0].to', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'issuedAt',
                exclude: true,
                to: 1 as any,
                from: undefined,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType('to', 'string', 'body');
        });
        it('is not a date', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'issuedAt',
                exclude: true,
                to: 'not date',
                from: undefined,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('to', 'date-time', 'body');
        });

        it('is earlier than "from"', () => {
          cy.authenticate(1)
            .requestGetTransactionList([
              {
                filterType: 'issuedAt',
                exclude: true,
                to: new Date(2024, 3, 4, 12, 0, 0).toISOString(),
                from: new Date(2024, 4, 4, 12, 0, 0).toISOString(),
              },
            ])
            .expectBadRequestResponse()
            .expectTooEarlyDateProperty('to', 'body');
        });
      });

    });
  });
});

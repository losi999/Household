import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { CategoryType, AccountType, UserType } from '@household/shared/enums';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';

const allowedUserTypes = [UserType.Editor];

describe('POST transaction/v1/transactions/split (split)', () => {
  let request: Transaction.SplitRequest;
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

    request = splitTransactionDataFactory.request(relatedDocumentIds, [
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(regularCategoryDocument),
      },
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(inventoryCategoryDocument),
      },
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(invoiceCategoryDocument),
      },
    ], [
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(regularCategoryDocument),
        loanAccountId: getAccountId(secondaryAccountDocument),
      },
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(inventoryCategoryDocument),
        loanAccountId: getAccountId(secondaryAccountDocument),
      },
      {
        ...relatedDocumentItemIds,
        categoryId: getCategoryId(invoiceCategoryDocument),
        loanAccountId: getAccountId(secondaryAccountDocument),
      },
    ]
      ,
    );
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreateSplitTransaction(request)
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestCreateSplitTransaction(request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should create transaction', () => {
          it('with complete body', () => {
            cy.saveAccountDocuments([
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
              .authenticate(userType)
              .requestCreateSplitTransaction(request)
              .expectCreatedResponse()
              .validateTransactionSplitDocument(request);
          });
          describe('without optional properties', () => {
            it('description', () => {
              request = splitTransactionDataFactory.request({
                ...relatedDocumentIds,
                description: undefined,
              }, request.splits, request.loans);
              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('recipientId', () => {
              request = splitTransactionDataFactory.request({
                ...relatedDocumentIds,
                recipientId: undefined,
              }, request.splits, request.loans);
              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocuments([
                  regularCategoryDocument,
                  invoiceCategoryDocument,
                  inventoryCategoryDocument,
                ])
                .saveProjectDocument(projectDocument)
                .saveProductDocument(productDocument)
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('splits', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [], request.loans);
              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('loans', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, []);
              cy.saveAccountDocument(accountDocument)
                .saveCategoryDocuments([
                  regularCategoryDocument,
                  invoiceCategoryDocument,
                  inventoryCategoryDocument,
                ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveProductDocument(productDocument)
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('splits.description', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  description: undefined,
                },
              ], request.loans);
              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('splits.inventory', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  categoryId: getCategoryId(inventoryCategoryDocument),
                  productId: undefined,
                  quantity: undefined,
                },
              ], request.loans);
              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('splits.invoice', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  categoryId: getCategoryId(invoiceCategoryDocument),
                  invoiceNumber: undefined,
                  billingEndDate: undefined,
                  billingStartDate: undefined,
                },
              ], request.loans);
              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('splits.invoice.invoiceNumber', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  categoryId: getCategoryId(invoiceCategoryDocument),
                  invoiceNumber: undefined,
                },
              ], request.loans);
              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('splits.categoryId', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  categoryId: undefined,
                },
              ], request.loans);
              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('splits.projectId', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, [
                {
                  ...relatedDocumentItemIds,
                  projectId: undefined,
                },
              ], request.loans);

              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('loans.description', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  description: undefined,
                },
              ]);
              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('loans.inventory', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  categoryId: getCategoryId(inventoryCategoryDocument),
                  productId: undefined,
                  quantity: undefined,
                },
              ]);
              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('loans.invoice', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  categoryId: getCategoryId(invoiceCategoryDocument),
                  invoiceNumber: undefined,
                  billingEndDate: undefined,
                  billingStartDate: undefined,
                },
              ]);

              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('loans.invoice.invoiceNumber', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  categoryId: getCategoryId(invoiceCategoryDocument),
                  invoiceNumber: undefined,
                },
              ]);

              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('loans.categoryId', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  categoryId: undefined,
                },
              ]);
              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });

            it('loans.projectId', () => {
              request = splitTransactionDataFactory.request(relatedDocumentIds, request.splits, [
                {
                  ...relatedDocumentItemIds,
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  projectId: undefined,
                },
              ]);

              cy.saveAccountDocuments([
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
                .authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectCreatedResponse()
                .validateTransactionSplitDocument(request);
            });
          });
        });

        describe('should return error', () => {
          describe('if body', () => {
            it('has additional properties', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  extra: 123,
                } as any))
                .expectBadRequestResponse()
                .expectAdditionalProperty('data', 'body');
            });

            it('misses both splits and loans', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], []))
                .expectBadRequestResponse()
                .expectRequiredProperty('splits', 'body')
                .expectRequiredProperty('loans', 'body');
            });
          });

          describe('if amount', () => {
            it('is not the same as sum of splits', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  amount: -1,
                }))
                .expectBadRequestResponse()
                .expectMessage('Sum of splits must equal to total amount');
            });

            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  amount: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('amount', 'body');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  amount: <any>'1',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('amount', 'number', 'body');
            });
          });

          describe('if description', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  description: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('description', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  description: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('description', 1, 'body');
            });
          });

          describe('if issuedAt', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  issuedAt: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('issuedAt', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  issuedAt: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('issuedAt', 'string', 'body');
            });

            it('is not date-time format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
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
              cy.saveAccountDocuments([
                loanAccountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocuments([
                  regularCategoryDocument,
                  invoiceCategoryDocument,
                  inventoryCategoryDocument,
                ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  accountId: getAccountId(loanAccountDocument),
                }, undefined, []))
                .expectBadRequestResponse()
                .expectMessage('Account type cannot be loan');
            });

            it('does not belong to any account', () => {
              cy.saveCategoryDocuments([
                regularCategoryDocument,
                invoiceCategoryDocument,
                inventoryCategoryDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  accountId: accountDataFactory.id(),
                }))
                .expectBadRequestResponse()
                .expectMessage('Some of the accounts are not found');
            });

            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  accountId: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('accountId', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  accountId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('accountId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  accountId: accountDataFactory.id('not-mongo-id'),
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('accountId', 'body');
            });
          });

          describe('if recipientId', () => {
            it('does not belong to any recipient', () => {
              cy.saveAccountDocument(accountDocument)
                .saveCategoryDocuments([
                  regularCategoryDocument,
                  invoiceCategoryDocument,
                  inventoryCategoryDocument,
                ])
                .saveProjectDocument(projectDocument)
                .authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  ...relatedDocumentIds,
                  recipientId: recipientDataFactory.id(),
                }, undefined, []))
                .expectBadRequestResponse()
                .expectMessage('No recipient found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  recipientId: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('recipientId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request({
                  recipientId: recipientDataFactory.id('not-mongo-id'),
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('recipientId', 'body');
            });
          });

          describe('if splits', () => {
            it('is not an array', () => {
              request.splits = {} as any;
              cy.authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectBadRequestResponse()
                .expectWrongPropertyType('splits', 'array', 'body');
            });

            it('is empty array', () => {
              request.splits = [];
              cy.authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectBadRequestResponse()
                .expectTooFewItemsProperty('splits', 1, 'body');
            });
          });

          describe('if splits[0]', () => {
            it('is not object', () => {
              request.splits = [1 as any];
              cy.authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectBadRequestResponse()
                .expectWrongPropertyType('splits', 'object', 'body');
            });

            it('has additional properties', () => {
              request.splits = [
                {
                  extra: 1,
                },
              ] as any;
              cy.authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectBadRequestResponse()
                .expectAdditionalProperty('splits', 'body');
            });
          });

          describe('if splits.amount', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    amount: undefined,
                  },
                ]))
                .expectBadRequestResponse()
                .expectRequiredProperty('amount', 'body');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    amount: <any>'1',
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType ('amount', 'number', 'body');
            });
          });

          describe('if splits.description', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    description: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('description', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    description: '',
                  },
                ]))
                .expectBadRequestResponse()
                .expectTooShortProperty('description', 1, 'body');
            });
          });

          describe('if splits.quantity', () => {
            it('is present and productId is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    quantity: 1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('quantity', 'body', 'productId');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    quantity: <any>'1',
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('quantity', 'number', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    quantity: 0,
                  },
                ]))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('quantity', 0, true, 'body');
            });
          });

          describe('if splits.productId', () => {
            it('is present and quantity is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    productId: productDataFactory.id(),
                    quantity: undefined,
                  },
                ]))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('productId', 'body', 'quantity');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    productId: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('productId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    productId: productDataFactory.id('not-mongo-id'),
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('productId', 'body');
            });

            it('does not belong to any product', () => {
              cy.saveAccountDocument(accountDocument)
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    ...relatedDocumentItemIds,
                    categoryId: getCategoryId(inventoryCategoryDocument),
                    productId: productDataFactory.id(),
                  },
                ], []))
                .expectBadRequestResponse()
                .expectMessage('No product found');
            });
          });

          describe('if splits.invoiceNumber', () => {
            it('is present and billingEndDate, billingStartDate are missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    billingEndDate: undefined,
                    billingStartDate: undefined,
                  },
                ]))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('invoiceNumber', 'body', 'billingEndDate', 'billingStartDate');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    invoiceNumber: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('invoiceNumber', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    invoiceNumber: '',
                  },
                ]))
                .expectBadRequestResponse()
                .expectTooShortProperty('invoiceNumber', 1, 'body');
            });
          });

          describe('if splits.billingEndDate', () => {
            it('is present and billingStartDate is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    billingStartDate: undefined,
                  },
                ]))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('billingEndDate', 'body', 'billingStartDate');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    billingEndDate: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('billingEndDate', 'string', 'body');
            });

            it('is not date format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    billingEndDate: 'not-date',
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('billingEndDate', 'date', 'body');
            });

            it('is later than billingStartDate', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    billingEndDate: '2022-06-01',
                    billingStartDate: '2022-06-03',
                  },
                ]))
                .expectBadRequestResponse()
                .expectTooEarlyDateProperty('billingEndDate', 'body');
            });
          });

          describe('if splits.billingStartDate', () => {
            it('is present and billingEndDate is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    billingEndDate: undefined,
                  },
                ]))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('billingStartDate', 'body', 'billingEndDate');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    billingStartDate: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('billingStartDate', 'string', 'body');
            });

            it('is not date format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    billingStartDate: 'not-date',
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('billingStartDate', 'date', 'body');
            });
          });

          describe('if splits.categoryId', () => {
            it('does not belong to any category', () => {
              cy.saveAccountDocument(accountDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    ...relatedDocumentItemIds,
                    categoryId: categoryDataFactory.id(),
                  },
                ], []))
                .expectBadRequestResponse()
                .expectMessage('Some of the categories are not found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    categoryId: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('categoryId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    categoryId: categoryDataFactory.id('not-mongo-id'),
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('categoryId', 'body');
            });
          });

          describe('if splits.projectId', () => {
            it('does not belong to any project', () => {
              cy.saveAccountDocument(accountDocument)
                .saveCategoryDocuments([
                  regularCategoryDocument,
                  invoiceCategoryDocument,
                  inventoryCategoryDocument,
                ])
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    ...relatedDocumentItemIds,
                    projectId: projectDataFactory.id(),
                  },
                ], []))
                .expectBadRequestResponse()
                .expectMessage('Some of the projects are not found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    projectId: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('projectId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [
                  {
                    projectId: projectDataFactory.id('not-mongo-id'),
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('projectId', 'body');
            });
          });

          describe('if loans', () => {
            it('is not an array', () => {
              request.loans = {} as any;
              cy.authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectBadRequestResponse()
                .expectWrongPropertyType('loans', 'array', 'body');
            });

            it('is empty array', () => {
              request.loans = [];
              cy.authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectBadRequestResponse()
                .expectTooFewItemsProperty('loans', 1, 'body');
            });
          });

          describe('if loans[0]', () => {
            it('is not object', () => {
              request.loans = [1 as any];
              cy.authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectBadRequestResponse()
                .expectWrongPropertyType('loans', 'object', 'body');
            });

            it('has additional properties', () => {
              request.loans = [
                {
                  extra: 1,
                },
              ] as any;
              cy.authenticate(userType)
                .requestCreateSplitTransaction(request)
                .expectBadRequestResponse()
                .expectAdditionalProperty('loans', 'body');
            });
          });

          describe('if loans.amount', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    amount: undefined,
                  },
                ]))
                .expectBadRequestResponse()
                .expectRequiredProperty('amount', 'body');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    amount: <any>'1',
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType ('amount', 'number', 'body');
            });
          });

          describe('if loans.description', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    description: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('description', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    description: '',
                  },
                ]))
                .expectBadRequestResponse()
                .expectTooShortProperty('description', 1, 'body');
            });
          });

          describe('if loans.quantity', () => {
            it('is present and productId is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    quantity: 1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('quantity', 'body', 'productId');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    quantity: <any>'1',
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('quantity', 'number', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    quantity: 0,
                  },
                ]))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('quantity', 0, true, 'body');
            });
          });

          describe('if loans.productId', () => {
            it('is present and quantity is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    productId: productDataFactory.id(),
                    quantity: undefined,
                  },
                ]))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('productId', 'body', 'quantity');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    productId: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('productId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    productId: productDataFactory.id('not-mongo-id'),
                  },
                ]))
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
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    ...relatedDocumentItemIds,
                    loanAccountId: getAccountId(secondaryAccountDocument),
                    categoryId: getCategoryId(inventoryCategoryDocument),
                    productId: productDataFactory.id(),
                  },
                ]))
                .expectBadRequestResponse()
                .expectMessage('No product found');
            });
          });

          describe('if loans.invoiceNumber', () => {
            it('is present and billingEndDate, billingStartDate are missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    billingEndDate: undefined,
                    billingStartDate: undefined,
                  },
                ]))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('invoiceNumber', 'body', 'billingEndDate', 'billingStartDate');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    invoiceNumber: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('invoiceNumber', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    invoiceNumber: '',
                  },
                ]))
                .expectBadRequestResponse()
                .expectTooShortProperty('invoiceNumber', 1, 'body');
            });
          });

          describe('if loans.billingEndDate', () => {
            it('is present and billingStartDate is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    billingStartDate: undefined,
                  },
                ]))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('billingEndDate', 'body', 'billingStartDate');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    billingEndDate: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('billingEndDate', 'string', 'body');
            });

            it('is not date format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    billingEndDate: 'not-date',
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('billingEndDate', 'date', 'body');
            });

            it('is later than billingStartDate', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    billingEndDate: '2022-06-01',
                    billingStartDate: '2022-06-03',
                  },
                ]))
                .expectBadRequestResponse()
                .expectTooEarlyDateProperty('billingEndDate', 'body');
            });
          });

          describe('if loans.billingStartDate', () => {
            it('is present and billingEndDate is missing', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    billingEndDate: undefined,
                  },
                ]))
                .expectBadRequestResponse()
                .expectDependentRequiredProperty('billingStartDate', 'body', 'billingEndDate');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    billingStartDate: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('billingStartDate', 'string', 'body');
            });

            it('is not date format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    billingStartDate: 'not-date',
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('billingStartDate', 'date', 'body');
            });
          });

          describe('if loans.categoryId', () => {
            it('does not belong to any category', () => {
              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    ...relatedDocumentItemIds,
                    categoryId: categoryDataFactory.id(),
                    loanAccountId: getAccountId(secondaryAccountDocument),
                  },
                ]))
                .expectBadRequestResponse()
                .expectMessage('Some of the categories are not found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    categoryId: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('categoryId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    categoryId: categoryDataFactory.id('not-mongo-id'),
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('categoryId', 'body');
            });
          });

          describe('if loans.projectId', () => {
            it('does not belong to any project', () => {
              cy.saveAccountDocuments([
                accountDocument,
                secondaryAccountDocument,
              ])
                .saveCategoryDocuments([
                  regularCategoryDocument,
                  invoiceCategoryDocument,
                  inventoryCategoryDocument,
                ])
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    ...relatedDocumentItemIds,
                    loanAccountId: getAccountId(secondaryAccountDocument),
                    projectId: projectDataFactory.id(),
                  },
                ]))
                .expectBadRequestResponse()
                .expectMessage('Some of the projects are not found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    projectId: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('projectId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    projectId: projectDataFactory.id('not-mongo-id'),
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('projectId', 'body');
            });
          });

          describe('if loans.loanAccountId', () => {
            it('does not belong to any account', () => {
              cy.saveAccountDocuments([accountDocument])
                .saveCategoryDocuments([
                  regularCategoryDocument,
                  invoiceCategoryDocument,
                  inventoryCategoryDocument,
                ])
                .saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, []))
                .expectBadRequestResponse()
                .expectMessage('Some of the accounts are not found');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    loanAccountId: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('loanAccountId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    loanAccountId: accountDataFactory.id('not-mongo-id'),
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('loanAccountId', 'body');
            });
          });

          describe('if loans.isSettled', () => {
            it('is not boolean', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    isSettled: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('isSettled', 'boolean', 'body');
            });
          });

          describe('if loans.transactionId', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    transactionId: <any>1,
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyType('transactionId', 'string', 'body');
            });

            it('is not mongo id format', () => {
              cy.authenticate(userType)
                .requestCreateSplitTransaction(splitTransactionDataFactory.request(relatedDocumentIds, [], [
                  {
                    transactionId: deferredTransactionDataFactory.id('not-mongo-id'),
                  },
                ]))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('transactionId', 'body');
            });
          });
        });
      }
    });
  });
});

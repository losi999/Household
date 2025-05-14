import { Account, Category, Product, Project, Recipient } from '@household/shared/types/types';
import { default as paymentTransactionSchema } from '@household/test/api/schemas/transaction-payment-response';
import { default as deferredTransactionSchema } from '@household/test/api/schemas/transaction-deferred-response';
import { default as reimbursementTransactionSchema } from '@household/test/api/schemas/transaction-reimbursement-response';
import { default as transferTransactionSchema } from '@household/test/api/schemas/transaction-transfer-response';
import { default as splitTransactionSchema } from '@household/test/api/schemas/transaction-split-response';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { AccountType, CategoryType, UserType } from '@household/shared/enums';

const allowedUserTypes = [
  UserType.Editor,
  UserType.Viewer,
];

describe('GET /transaction/v1/accounts/{accountId}/transactions/{transactionId}', () => {
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let regularCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let productDocument: Product.Document;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });
    transferAccountDocument = accountDataFactory.document();

    recipientDocument = recipientDataFactory.document();

    projectDocument = projectDataFactory.document();

    regularCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Regular,
      },
    });

    inventoryCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });

    invoiceCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Invoice,
      },
    });

    productDocument = productDataFactory.document({
      category: inventoryCategoryDocument,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetTransaction(getAccountId(accountDocument), paymentTransactionDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestGetTransaction(getAccountId(accountDocument), paymentTransactionDataFactory.id())
            .expectForbiddenResponse();
        });
      } else {
        describe('should get', () => {
          describe('of a non-loan account', () => {
            it('regular payment transaction', () => {
              const document = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
              });

              cy.saveAccountDocument(accountDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(paymentTransactionSchema)
                .validateTransactionPaymentResponse(document);
            });

            it('inventory payment transaction', () => {
              const document = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: productDocument,
              });

              cy.saveAccountDocument(accountDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProductDocument(productDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(paymentTransactionSchema)
                .validateTransactionPaymentResponse(document);
            });

            it('invoice payment transaction', () => {
              const document = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: invoiceCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
              });

              cy.saveAccountDocument(accountDocument)
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(paymentTransactionSchema)
                .validateTransactionPaymentResponse(document);
            });

            it('regular deferred transaction', () => {
              const document = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: loanAccountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(deferredTransactionSchema)
                .validateTransactionDeferredResponse(document);
            });

            it('inventory deferred transaction', () => {
              const document = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: productDocument,
                loanAccount: loanAccountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProductDocument(productDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(deferredTransactionSchema)
                .validateTransactionDeferredResponse(document);
            });

            it('invoice deferred transaction', () => {
              const document = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: invoiceCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: loanAccountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(deferredTransactionSchema)
                .validateTransactionDeferredResponse(document);
            });

            it('owning deferred transaction', () => {
              const document = deferredTransactionDataFactory.document({
                account: transferAccountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                transferAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(deferredTransactionSchema)
                .validateTransactionDeferredResponse(document);
            });

            it('paying deferred transaction which has been repaid', () => {
              const document = deferredTransactionDataFactory.document({
                body: {
                  amount: -5000,
                },
                account: accountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: transferAccountDocument,
              });

              const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
                account: transferAccountDocument,
                transferAccount: accountDocument,
                body: {
                  amount: -1500,
                },
                transactions: [document],
              });

              cy.saveAccountDocuments([
                accountDocument,
                transferAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocuments([
                  document,
                  repayingTransferTransactionDocument,
                ])
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(deferredTransactionSchema)
                .validateTransactionDeferredResponse(document, {
                  paymentAmount: repayingTransferTransactionDocument.payments[0].amount,
                });
            });

            it('owning deferred transaction which has been repaid', () => {
              const document = deferredTransactionDataFactory.document({
                body: {
                  amount: -5000,
                },
                account: transferAccountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
                account: accountDocument,
                transferAccount: transferAccountDocument,
                body: {
                  amount: -1500,
                },
                transactions: [document],
              });

              cy.saveAccountDocuments([
                accountDocument,
                transferAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocuments([
                  document,
                  repayingTransferTransactionDocument,
                ])
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(deferredTransactionSchema)
                .validateTransactionDeferredResponse(document, {
                  paymentAmount: repayingTransferTransactionDocument.payments[0].amount,
                });
            });

            it('paying deferred transaction which has been settled', () => {
              const document = deferredTransactionDataFactory.document({
                body: {
                  isSettled: true,
                },
                account: accountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: transferAccountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                transferAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(deferredTransactionSchema)
                .validateTransactionDeferredResponse(document);
            });

            it('owning deferred transaction which has been settled', () => {
              const document = deferredTransactionDataFactory.document({
                body: {
                  isSettled: true,
                },
                account: transferAccountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                transferAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(deferredTransactionSchema)
                .validateTransactionDeferredResponse(document);
            });

            it('regular owning reimbursement transaction', () => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(reimbursementTransactionSchema)
                .validateTransactionReimbursementResponse(document);
            });

            it('regular paying reimbursement transaction', () => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(reimbursementTransactionSchema)
                .validateTransactionReimbursementResponse(document);
            });

            it('inventory reimbursement transaction', () => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: productDocument,
                loanAccount: accountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProductDocument(productDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(reimbursementTransactionSchema)
                .validateTransactionReimbursementResponse(document);
            });

            it('invoice reimbursement transaction', () => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: invoiceCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(reimbursementTransactionSchema)
                .validateTransactionReimbursementResponse(document);
            });

            it('paying split transaction', () => {
              const document = splitTransactionDataFactory.document({
                account: accountDocument,
                recipient: recipientDocument,
                splits: [
                  {
                    project: projectDocument,
                  },
                  {
                    category: regularCategoryDocument,
                  },
                  {
                    category: inventoryCategoryDocument,
                    product: productDocument,
                  },
                  {
                    category: invoiceCategoryDocument,
                  },
                ],
                loans: [
                  {
                    project: projectDocument,
                    loanAccount: loanAccountDocument,
                  },
                  {
                    category: regularCategoryDocument,
                    loanAccount: loanAccountDocument,
                  },
                  {
                    category: inventoryCategoryDocument,
                    product: productDocument,
                    loanAccount: loanAccountDocument,
                  },
                  {
                    category: invoiceCategoryDocument,
                    loanAccount: loanAccountDocument,
                  },
                  {
                    loanAccount: transferAccountDocument,
                    amount: -500,
                  },
                  {
                    loanAccount: transferAccountDocument,
                    isSettled: true,
                  },
                ],
              });

              const lastDeferredSplit = document.deferredSplits[document.deferredSplits.length - 2];

              const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
                account: transferAccountDocument,
                transferAccount: accountDocument,
                body: {
                  amount: -1500,
                },
                transactions: [lastDeferredSplit],
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
                transferAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocuments([
                  regularCategoryDocument,
                  invoiceCategoryDocument,
                  inventoryCategoryDocument,
                ])
                .saveProductDocument(productDocument)
                .saveTransactionDocuments([
                  document,
                  repayingTransferTransactionDocument,
                ])
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(splitTransactionSchema)
                .validateTransactionSplitResponse(document, {
                  [getTransactionId(lastDeferredSplit)]: repayingTransferTransactionDocument.payments[0].amount,
                });
            });

            it('owning split transaction', () => {
              const document = splitTransactionDataFactory.document({
                account: transferAccountDocument,
                recipient: recipientDocument,
                splits: [
                  {
                    project: projectDocument,
                  },
                ],
                loans: [
                  {
                    loanAccount: accountDocument,
                  },
                  {
                    loanAccount: accountDocument,
                    isSettled: true,
                  },
                  {
                    loanAccount: accountDocument,
                    amount: -500,
                  },
                ],
              });

              const lastDeferredSplit = document.deferredSplits[document.deferredSplits.length - 1];

              const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
                account: accountDocument,
                transferAccount: transferAccountDocument,
                body: {
                  amount: -1500,
                },
                transactions: [lastDeferredSplit],
              });

              cy.saveAccountDocuments([
                accountDocument,
                transferAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveTransactionDocuments([
                  document,
                  repayingTransferTransactionDocument,
                ])
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(splitTransactionSchema)
                .validateTransactionSplitResponse(document, {
                  [getTransactionId(lastDeferredSplit)]: repayingTransferTransactionDocument.payments[0].amount,
                });
            });

            it('transfer transaction', () => {
              const document = transferTransactionDataFactory.document({
                account: accountDocument,
                transferAccount: transferAccountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                transferAccountDocument,
              ])
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(transferTransactionSchema)
                .validateTransactionTransferResponse(document, getAccountId(accountDocument));
            });

            it('loan transfer transaction', () => {
              const document = transferTransactionDataFactory.document({
                account: loanAccountDocument,
                transferAccount: transferAccountDocument,
              });

              cy.saveAccountDocuments([
                loanAccountDocument,
                transferAccountDocument,
              ])
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(transferTransactionSchema)
                .validateTransactionTransferResponse(document, getAccountId(loanAccountDocument));
            });
          });

          describe('of a loan account', () => {
            it('owning deferred transaction', () => {
              const document = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: loanAccountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(deferredTransactionSchema)
                .validateTransactionDeferredResponse(document);
            });

            it('owning deferred transaction which has been repaid', () => {
              const document = deferredTransactionDataFactory.document({
                body: {
                  amount: -5000,
                },
                account: accountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: loanAccountDocument,
              });

              const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
                account: accountDocument,
                transferAccount: transferAccountDocument,
                body: {
                  amount: -1500,
                },
                transactions: [document],
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
                transferAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocuments([
                  document,
                  repayingTransferTransactionDocument,
                ])
                .authenticate(userType)
                .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(deferredTransactionSchema)
                .validateTransactionDeferredResponse(document, {
                  paymentAmount: repayingTransferTransactionDocument.payments[0].amount,
                });
            });

            it('owning deferred transaction which has been settled', () => {
              const document = deferredTransactionDataFactory.document({
                body: {
                  isSettled: true,
                },
                account: accountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: loanAccountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(deferredTransactionSchema)
                .validateTransactionDeferredResponse(document);
            });

            it('regular reimbursement transaction', () => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(regularCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(reimbursementTransactionSchema)
                .validateTransactionReimbursementResponse(document);
            });

            it('inventory reimbursement transaction', () => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: productDocument,
                loanAccount: accountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(inventoryCategoryDocument)
                .saveProductDocument(productDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(reimbursementTransactionSchema)
                .validateTransactionReimbursementResponse(document);
            });

            it('invoice reimbursement transaction', () => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: invoiceCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveCategoryDocument(invoiceCategoryDocument)
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(reimbursementTransactionSchema)
                .validateTransactionReimbursementResponse(document);
            });

            it('owning split transaction', () => {
              const document = splitTransactionDataFactory.document({
                account: accountDocument,
                recipient: recipientDocument,
                splits: [
                  {
                    project: projectDocument,
                  },
                ],
                loans: [
                  {
                    loanAccount: loanAccountDocument,
                  },
                  {
                    loanAccount: loanAccountDocument,
                    isSettled: true,
                  },
                  {
                    loanAccount: loanAccountDocument,
                    amount: -500,
                  },
                ],
              });

              const lastDeferredSplit = document.deferredSplits[document.deferredSplits.length - 1];

              const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
                account: accountDocument,
                transferAccount: transferAccountDocument,
                body: {
                  amount: -1500,
                },
                transactions: [lastDeferredSplit],
              });

              cy.saveAccountDocuments([
                accountDocument,
                loanAccountDocument,
                transferAccountDocument,
              ])
                .saveProjectDocument(projectDocument)
                .saveRecipientDocument(recipientDocument)
                .saveTransactionDocuments([
                  document,
                  repayingTransferTransactionDocument,
                ])
                .authenticate(userType)
                .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(splitTransactionSchema)
                .validateTransactionSplitResponse(document, {
                  [getTransactionId(lastDeferredSplit)]: repayingTransferTransactionDocument.payments[0].amount,
                });
            });

            it('loan transfer transaction', () => {
              const document = transferTransactionDataFactory.document({
                account: loanAccountDocument,
                transferAccount: transferAccountDocument,
              });

              cy.saveAccountDocuments([
                loanAccountDocument,
                transferAccountDocument,
              ])
                .saveTransactionDocument(document)
                .authenticate(userType)
                .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
                .expectOkResponse()
                .expectValidResponseSchema(transferTransactionSchema)
                .validateTransactionTransferResponse(document, getAccountId(loanAccountDocument));
            });
          });
        });

        describe('should return error', () => {
          describe('if transactionId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestGetTransaction(accountDataFactory.id(), paymentTransactionDataFactory.id('not-valid'))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('transactionId', 'pathParameters');
            });

            it('does not belong to any transaction', () => {
              cy.authenticate(userType)
                .requestGetTransaction(accountDataFactory.id(), paymentTransactionDataFactory.id())
                .expectNotFoundResponse();
            });
          });

          describe('if accountId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestGetTransaction(accountDataFactory.id('not-valid'), paymentTransactionDataFactory.id())
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('accountId', 'pathParameters');
            });
          });
        });
      }
    });
  });
});

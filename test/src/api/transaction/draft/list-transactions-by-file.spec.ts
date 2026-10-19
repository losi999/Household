import { draftResponseList as schema } from '@household/shared/schemas/transaction';
import { fileDataFactory } from '../../file/data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { addSeconds, entries, getFileId } from '@household/shared/common/utils';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { allowUsers } from '@household/test/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { loanTransactionDataFactory } from '@household/test/api/transaction/loan/loan-data-factory';

import { transactionApiTest, transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { mergeTests } from '@playwright/test';
import { accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { Documents } from '@household/shared/types/documents';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { productDbTest } from '@household/test/fixtures/product-db.fixture';
import { projectDbTest } from '@household/test/fixtures/project-db.fixture';
import { recipientDbTest } from '@household/test/fixtures/recipient-db.fixture';

const permissionMap = allowUsers('editor') ;

const test = mergeTests(transactionApiTest, accountDbTest, transactionDbTest, categoryDbTest, projectDbTest, recipientDbTest, productDbTest);

test.describe('GET /transaction/v1/files/{fileId}/transactions', () => {
  let fileDocument: Documents.File;
  let accountDocument: Documents.Account;
  let loanAccountDocument: Documents.Account;
  let projectDocument: Documents.Project;
  let recipientDocument: Documents.Recipient;
  let regularCategoryDocument: Documents.Category;
  let inventoryCategoryDocument: Documents.Category;
  let invoiceCategoryDocument: Documents.Category;
  let genericProductDocument: Documents.GenericProduct;
  let specificProductDocument: Documents.SpecificProduct;
  let variantProductDocument: Documents.VariantProduct;
  let draftDocument: Documents.DraftTransaction;
  let duplicatedDraftDocument: Documents.DraftTransaction;
  let duplicatePaymentDocument: Documents.PaymentTransaction;
  let duplicateInvertedPaymentDocument: Documents.PaymentTransaction;
  let duplicateSplitDocument: Documents.SplitTransaction;
  let duplicateTransferDocument: Documents.TransferTransaction;
  let duplicateInvertedTransferDocument: Documents.TransferTransaction;
  let duplicateLoanDocument: Documents.LoanTransaction;
  let duplicateRepaymentDocument: Documents.LoanTransaction;

  test.beforeEach(async () => {
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

    genericProductDocument = productDataFactory.document.generic();
    specificProductDocument = productDataFactory.document.specific({
      genericProduct: genericProductDocument,
    });
    variantProductDocument = productDataFactory.document.variant({
      genericProduct: genericProductDocument,
      specificProduct: specificProductDocument,
    });

    fileDocument = fileDataFactory.document();
    accountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });
    draftDocument = draftTransactionDataFactory.document({
      file: fileDocument,
    });
    duplicatedDraftDocument = draftTransactionDataFactory.document({
      file: fileDocument,
    });
    duplicatePaymentDocument = paymentTransactionDataFactory.document({
      body: {
        amount: duplicatedDraftDocument.amount,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: accountDocument,
      project: projectDocument,
      recipient: recipientDocument,
      category: inventoryCategoryDocument,
      product: specificProductDocument,
    });
    duplicateInvertedPaymentDocument = paymentTransactionDataFactory.document({
      body: {
        amount: duplicatedDraftDocument.amount * -1,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: accountDocument,
      category: inventoryCategoryDocument,
      product: variantProductDocument,
    });
    duplicateSplitDocument = splitTransactionDataFactory.document({
      body: {
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      splits: [
        {
          amount: duplicatedDraftDocument.amount,
          category: invoiceCategoryDocument,
        },
      ],
      loans: undefined,
      account: accountDocument,
    });
    duplicateTransferDocument = transferTransactionDataFactory.document({
      body: {
        amount: duplicatedDraftDocument.amount,
        transferAmount: duplicatedDraftDocument.amount * -1,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: accountDocument,
      transferAccount: loanAccountDocument,
    });
    duplicateInvertedTransferDocument = transferTransactionDataFactory.document({
      body: {
        amount: duplicatedDraftDocument.amount,
        transferAmount: duplicatedDraftDocument.amount * -1,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: accountDocument,
      transferAccount: loanAccountDocument,
    });
    duplicateLoanDocument = loanTransactionDataFactory.document({
      body: {
        amount: Math.abs(duplicatedDraftDocument.amount) * -1,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: accountDocument,
      loanAccount: loanAccountDocument,
      category: inventoryCategoryDocument,
      product: genericProductDocument,
    });
    duplicateRepaymentDocument = loanTransactionDataFactory.document({
      body: {
        amount: Math.abs(duplicatedDraftDocument.amount) * -1,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: loanAccountDocument,
      loanAccount: accountDocument,
      category: regularCategoryDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestGetTransactionListByFile }) => {
      const res = await requestGetTransactionListByFile(getFileId(fileDocument));
      transactionApiExpect(res).toBeUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType: userType, 
      });
      if (!isAllowed) {
        test('should return forbidden', async ({ requestGetTransactionListByFile }) => {
          const res = await requestGetTransactionListByFile(getFileId(fileDocument));
          transactionApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of draft transactions', async ({ requestGetTransactionListByFile, saveAccounts, saveProject, saveProducts, saveRecipient, saveCategories, saveTransactions }) => {
          await saveAccounts(accountDocument, loanAccountDocument);
          await saveProject(projectDocument);
          await saveRecipient(recipientDocument);
          await saveCategories(regularCategoryDocument, inventoryCategoryDocument, invoiceCategoryDocument);
          await saveProducts(genericProductDocument, specificProductDocument, variantProductDocument);
          await saveTransactions(draftDocument, duplicatedDraftDocument, duplicatePaymentDocument, duplicateInvertedPaymentDocument, duplicateSplitDocument, duplicateTransferDocument, duplicateInvertedTransferDocument, duplicateLoanDocument, duplicateRepaymentDocument);
          const res = await requestGetTransactionListByFile(getFileId(fileDocument));
          transactionApiExpect(res).toBeOkResponse();
          transactionApiExpect(res).toMatchSchema(schema);

          transactionApiExpect(res).toContainMatchingDraftTransactionDocument(draftDocument);
          transactionApiExpect(res).toContainMatchingDraftTransactionDocument(duplicatedDraftDocument, duplicatePaymentDocument, duplicateInvertedPaymentDocument, duplicateSplitDocument, duplicateTransferDocument, duplicateInvertedTransferDocument, duplicateLoanDocument, duplicateRepaymentDocument);
        });

        test.describe('should return error', () => {
          test.describe('if fileId', () => {
            test('is not mongo id', async ({ requestGetTransactionListByFile }) => {
              const res = await requestGetTransactionListByFile(fileDataFactory.id('not-mongo-id'));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('pathParameters', 'fileId');
            });
          });
        });
      }
    });
  });
});

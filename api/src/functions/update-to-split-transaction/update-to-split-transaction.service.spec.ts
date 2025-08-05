import { IUpdateToSplitTransactionService, updateToSplitTransactionServiceFactory } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.service';
import { createSplitTransactionRequest, createAccountDocument, createCategoryDocument, createProjectDocument, createRecipientDocument, createSplitTransactionDocument, createSplitRequestItem, createProductDocument, createLoanRequestItem, createDocumentUpdate } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId, getProjectId, getProductId, toDictionary, getTransactionId, getAccountId, getRecipientId } from '@household/shared/common/utils';
import { ISplitTransactionDocumentConverter } from '@household/shared/converters/split-transaction-document-converter';
import { AccountType, CategoryType } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

describe('Update to split transaction service', () => {
  let service: IUpdateToSplitTransactionService;
  let mockAccountService: Mock<IAccountService>;
  let mockCategoryService: Mock<ICategoryService>;
  let mockRecipientService: Mock<IRecipientService>;
  let mockProjectService: Mock<IProjectService>;
  let mockProductService: Mock<IProductService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockSplitTransactionDocumentConverter: Mock<ISplitTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('findAccountsByIds');
    mockProjectService = createMockService('findProjectsByIds');
    mockCategoryService = createMockService('findCategoriesByIds');
    mockRecipientService = createMockService('findRecipientById');
    mockProductService = createMockService('listProductsByIds');
    mockTransactionService = createMockService('updateTransaction', 'findTransactionById');
    mockSplitTransactionDocumentConverter = createMockService('update');

    service = updateToSplitTransactionServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockProductService.service, mockTransactionService.service, mockSplitTransactionDocumentConverter.service);
  });

  const category = createCategoryDocument({
    categoryType: CategoryType.Inventory,
  });
  const product = createProductDocument({
    category,
  });
  const project = createProjectDocument();
  const loanAccount = createAccountDocument({
    accountType: AccountType.Loan,
  });

  const categoryId = getCategoryId(category);
  const projectId = getProjectId(project);
  const productId = getProductId(product);
  const loanAccountId = getAccountId(loanAccount);
  const queriedAccount = createAccountDocument();
  const queriedRecipient = createRecipientDocument();

  let body: Transaction.SplitRequest;
  const queriedDocument = createSplitTransactionDocument();
  const transactionId = getTransactionId(queriedDocument);
  const updateQuery = createDocumentUpdate({
    description: 'updated',
  });

  beforeEach(() => {
    body = createSplitTransactionRequest({
      accountId: getAccountId(queriedAccount),
      recipientId: getRecipientId(queriedRecipient),
      loans: [
        createLoanRequestItem({
          categoryId,
          projectId,
          productId,
          loanAccountId,
        }),
      ],
      splits: [
        createSplitRequestItem({
          categoryId,
          projectId,
          productId,
        }),
      ],
    });
  });

  describe('should return', () => {
    it('if updated to split transaction', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockSplitTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update, {
        body,
        categories: toDictionary([category], '_id'),
        accounts: toDictionary([
          queriedAccount,
          loanAccount,
        ], '_id'),
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: toDictionary([product], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      expect.assertions(8);
    });
  });

  describe('should throw error', () => {
    it('if unable to query transaction', async () => {
      mockTransactionService.functions.findTransactionById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting transaction', 500));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.findRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no transaction found', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No transaction found', 404));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.findRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if account and loan account are the same', async () => {
      body = createSplitTransactionRequest({
        ...body,
        loans: [
          createLoanRequestItem({
            loanAccountId: getAccountId(queriedAccount),
          }),
        ],
      });

      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Cannot loan to same account', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.findRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if sum of splits is not equal to total amount', async () => {
      body = createSplitTransactionRequest({
        ...body,
        amount: 100,
      });

      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Sum of splits must equal to total amount', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.findRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query account', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockRejectedValue('this is a mongo error');
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query categories', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockRejectedValue('this is a mongo error');
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query projects', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockRejectedValue('this is a mongo error');
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query recipients', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockRejectedValue('this is a mongo error');
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query products', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no account found', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Some of the accounts are not found', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no categories found', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Some of the categories are not found', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no projects found', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Some of the projects are not found', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no recipient found', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if category is "inventory" and no product found', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No product found', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if product belongs to different category', async () => {
      const otherProduct = createProductDocument();
      const otherProductId = getProductId(otherProduct);

      body = createSplitTransactionRequest({
        accountId: getAccountId(queriedAccount),
        recipientId: getRecipientId(queriedRecipient),
        splits: [],
        loans: [
          createLoanRequestItem({
            categoryId,
            projectId,
            productId: otherProductId,
            loanAccountId,
          }),
        ],
      });

      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([otherProduct]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Product belongs to different category', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [otherProductId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if account is of loan type', async () => {
      body = createSplitTransactionRequest({
        ...body,
        accountId: getAccountId(loanAccount),
        loans: [
          createLoanRequestItem({
            categoryId,
            projectId,
            productId,
            loanAccountId: getAccountId(queriedAccount),
          }),
        ],
        splits: [
          createSplitRequestItem({
            categoryId,
            projectId,
            productId,
          }),
        ],
      });

      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Account type cannot be loan', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        loanAccountId,
        getAccountId(queriedAccount),
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to save transaction', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockSplitTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating transaction', 500));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.update, {
        body,
        categories: toDictionary([category], '_id'),
        accounts: toDictionary([
          queriedAccount,
          loanAccount,
        ], '_id'),
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: toDictionary([product], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      expect.assertions(10);
    });
  });
});

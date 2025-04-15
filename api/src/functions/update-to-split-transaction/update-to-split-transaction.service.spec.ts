import { IUpdateToSplitTransactionService, updateToSplitTransactionServiceFactory } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.service';
import { createSplitTransactionRequest, createAccountDocument, createCategoryDocument, createProjectDocument, createRecipientDocument, createSplitTransactionDocument, createSplitRequestItem, createProductDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId, getProjectId, getProductId, toDictionary, getTransactionId, getAccountId, getRecipientId } from '@household/shared/common/utils';
import { ISplitTransactionDocumentConverter } from '@household/shared/converters/split-transaction-document-converter';
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
    mockAccountService = createMockService('listAccountsByIds');
    mockProjectService = createMockService('listProjectsByIds');
    mockCategoryService = createMockService('listCategoriesByIds');
    mockRecipientService = createMockService('getRecipientById');
    mockProductService = createMockService('listProductsByIds');
    mockTransactionService = createMockService('replaceTransaction', 'getTransactionById');
    mockSplitTransactionDocumentConverter = createMockService('create');

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
  const updatedDocument = createSplitTransactionDocument({
    description: 'updated',
  });

  beforeEach(() => {
    body = createSplitTransactionRequest({
      accountId: getAccountId(queriedAccount),
      recipientId: getRecipientId(queriedRecipient),
      splits: [
        createSplitRequestItem({
          categoryId,
          projectId,
          productId,
        }),
        createSplitRequestItem({
          categoryId,
          projectId,
          productId,
          loanAccountId,
        }),
      ],
    });
  });

  describe('should return', () => {
    it('if updated to split transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(updatedDocument);
      mockTransactionService.functions.replaceTransaction.mockResolvedValue(updatedDocument);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create, {
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
      validateFunctionCall(mockTransactionService.functions.replaceTransaction, transactionId, updatedDocument);
      expect.assertions(8);
    });
  });

  describe('should throw error', () => {
    it('if unable to query transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting transaction', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if no transaction found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No transaction found', 404));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if account and loan account are the same', async () => {
      body = createSplitTransactionRequest({
        ...body,
        splits: [
          createSplitRequestItem({
            loanAccountId: getAccountId(queriedAccount),
          }),
        ],
      });

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Cannot loan to same account', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if sum of splits is not equal to total amount', async () => {
      body = createSplitTransactionRequest({
        ...body,
        amount: 100,
      });

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Sum of splits must equal to total amount', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if unable to query account', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockRejectedValue('this is a mongo error');
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if unable to query categories', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockRejectedValue('this is a mongo error');
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if unable to query projects', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockRejectedValue('this is a mongo error');
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if unable to query recipients', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockRejectedValue('this is a mongo error');
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if unable to query products', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if no account found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Some of the accounts are not found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if no categories found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Some of the categories are not found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if no projects found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Some of the projects are not found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if no recipient found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if category is "inventory" and no product found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No product found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if product belongs to different category', async () => {
      const otherProduct = createProductDocument();
      const otherProductId = getProductId(otherProduct);

      body = createSplitTransactionRequest({
        ...body,
        amount: -1,
        splits: [
          createSplitRequestItem({
            categoryId,
            projectId,
            productId: otherProductId,
            loanAccountId,
          }),
        ],
      });

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([otherProduct]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Product belongs to different category', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [otherProductId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if account is of loan type', async () => {
      body = createSplitTransactionRequest({
        ...body,
        accountId: getAccountId(loanAccount),
        splits: [
          createSplitRequestItem({
            categoryId,
            projectId,
            productId,
          }),
          createSplitRequestItem({
            categoryId,
            projectId,
            productId,
            loanAccountId: getAccountId(queriedAccount),
          }),
        ],
      });

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Account type cannot be loan', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        loanAccountId,
        getAccountId(queriedAccount),
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      expect.assertions(10);
    });

    it('if unable to save transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(updatedDocument);
      mockTransactionService.functions.replaceTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating transaction', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create, {
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
      validateFunctionCall(mockTransactionService.functions.replaceTransaction, transactionId, updatedDocument);
      expect.assertions(10);
    });
  });
});

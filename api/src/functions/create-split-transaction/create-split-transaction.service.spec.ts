import { ICreateSplitTransactionService, createSplitTransactionServiceFactory } from '@household/api/functions/create-split-transaction/create-split-transaction.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId, toDictionary } from '@household/shared/common/utils';
import { ISplitTransactionDocumentConverter } from '@household/shared/converters/split-transaction-document-converter';
import { AccountType, CategoryType } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Requests } from '@household/shared/types/requests';

describe('Create split transaction service', () => {
  let service: ICreateSplitTransactionService;
  let mockAccountService: MockService<IAccountService>;
  let mockCategoryService: MockService<ICategoryService>;
  let mockRecipientService: MockService<IRecipientService>;
  let mockProjectService: MockService<IProjectService>;
  let mockProductService: MockService<IProductService>;
  let mockTransactionService: MockService<ITransactionService>;
  let mockSplitTransactionDocumentConverter: MockService<ISplitTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('findAccountsByIds');
    mockProjectService = createMockService('findProjectsByIds');
    mockCategoryService = createMockService('findCategoriesByIds');
    mockRecipientService = createMockService('findRecipientById');
    mockProductService = createMockService('listProductsByIds');
    mockTransactionService = createMockService('saveTransaction');
    mockSplitTransactionDocumentConverter = createMockService('create');

    service = createSplitTransactionServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockProductService.service, mockTransactionService.service, mockSplitTransactionDocumentConverter.service);
  });

  const category = testDataFactory.category.document({
    categoryType: CategoryType.Inventory,
  });
  const product = testDataFactory.product.document({
    category,
  });
  const project = testDataFactory.project.document();
  const loanAccount = testDataFactory.account.document({
    accountType: AccountType.Loan,
  });

  const categoryId = getCategoryId(category);
  const projectId = getProjectId(project);
  const productId = getProductId(product);
  const loanAccountId = getAccountId(loanAccount);
  const queriedAccount = testDataFactory.account.document();
  const queriedRecipient = testDataFactory.recipient.document();

  let body: Requests.SplitTransaction;
  const createdDocument = testDataFactory.transaction.document.split();
  const transactionId = getTransactionId(createdDocument);

  beforeEach(() => {
    body = testDataFactory.transaction.request.split({
      accountId: getAccountId(queriedAccount),
      recipientId: getRecipientId(queriedRecipient),
      loans: [
        {
          categoryId,
          projectId,
          productId,
          loanAccountId,
        },
      ],
      splits: [
        {
          categoryId,
          projectId,
          productId,
        },
      ],
    });
  });

  describe('should return new id', () => {
    it('of created split transaction', async () => {
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });
  });

  describe('should throw error', () => {
    it('if account and loan account are the same', async () => {
      body = testDataFactory.transaction.request.split({
        ...body,
        loans: [
          {
            loanAccountId: getAccountId(queriedAccount),
          },
        ],
      });

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Cannot loan to same account', 400));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.findRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query account', async () => {
      mockAccountService.functions.findAccountsByIds.mockRejectedValue('this is a mongo error');
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query categories', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query projects', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query recipients', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query products', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no account found', async () => {
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Some of the accounts are not found', 400));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no categories found', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Some of the categories are not found', 400));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no projects found', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Some of the projects are not found', 400));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no recipient found', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 400));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if category is "inventory" and no product found', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('No product found', 400));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if product belongs to different category', async () => {
      const otherProduct = testDataFactory.product.document();
      const otherProductId = getProductId(otherProduct);

      body = testDataFactory.transaction.request.split({
        accountId: getAccountId(queriedAccount),
        recipientId: getRecipientId(queriedRecipient),
        splits: [],
        loans: [
          {
            categoryId,
            projectId,
            productId: otherProductId,
            loanAccountId,
          },
        ],
      });
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
        expiresIn: undefined,
      }).catch(validateError('Product belongs to different category', 400));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [otherProductId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if account is of loan type', async () => {
      body = testDataFactory.transaction.request.split({
        accountId: getAccountId(loanAccount),
        recipientId: undefined,
        loans: [],
        splits: [
          {
            categoryId: undefined,
            productId: undefined,
            projectId: undefined,
          },
        ],
      });

      mockAccountService.functions.findAccountsByIds.mockResolvedValue([loanAccount]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.listProductsByIds.mockResolvedValue([]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Account type cannot be loan', 400));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [loanAccountId]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, []);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, []);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, undefined);
      validateFunctionCall(mockProductService.functions.listProductsByIds, []);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to save transaction', async () => {
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.findCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving transaction', 500));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.findCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(9);
    });
  });
});

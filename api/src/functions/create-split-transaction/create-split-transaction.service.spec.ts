import { ICreateSplitTransactionService, createSplitTransactionServiceFactory } from '@household/api/functions/create-split-transaction/create-split-transaction.service';
import { createAccountDocument, createCategoryDocument, createLoanRequestItem, createProductDocument, createProjectDocument, createRecipientDocument, createSplitRequestItem, createSplitTransactionDocument, createSplitTransactionRequest } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId, toDictionary } from '@household/shared/common/utils';
import { ISplitTransactionDocumentConverter } from '@household/shared/converters/split-transaction-document-converter';
import { AccountType, CategoryType } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

describe('Create split transaction service', () => {
  let service: ICreateSplitTransactionService;
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
    mockTransactionService = createMockService('saveTransaction');
    mockSplitTransactionDocumentConverter = createMockService('create');

    service = createSplitTransactionServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockProductService.service, mockTransactionService.service, mockSplitTransactionDocumentConverter.service);
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
  const createdDocument = createSplitTransactionDocument();
  const transactionId = getTransactionId(createdDocument);

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

  describe('should return new id', () => {
    it('of created split transaction', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });
  });

  describe('should throw error', () => {
    it('if account and loan account are the same', async () => {
      body = createSplitTransactionRequest({
        ...body,
        loans: [
          createLoanRequestItem({
            loanAccountId: getAccountId(queriedAccount),
          }),
        ],
      });

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Cannot loan to same account', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if sum of splits is not equal to total amount', async () => {
      body = createSplitTransactionRequest({
        ...body,
        amount: 100,
      });

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Sum of splits must equal to total amount', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query account', async () => {
      mockAccountService.functions.listAccountsByIds.mockRejectedValue('this is a mongo error');
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query categories', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query projects', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query recipients', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query products', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no account found', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Some of the accounts are not found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no categories found', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Some of the categories are not found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no projects found', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Some of the projects are not found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no recipient found', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if category is "inventory" and no product found', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('No product found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
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
        expiresIn: undefined,
      }).catch(validateError('Product belongs to different category', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [otherProductId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
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
        expiresIn: undefined,
      }).catch(validateError('Account type cannot be loan', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        loanAccountId,
        getAccountId(queriedAccount),
      ]);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      // expect.assertions(9);
    });

    it('if unable to save transaction', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        loanAccount,
      ]);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving transaction', 500));
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(9);
    });
  });
});

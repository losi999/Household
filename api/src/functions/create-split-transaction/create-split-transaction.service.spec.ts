import { ICreateSplitTransactionService, createSplitTransactionServiceFactory } from '@household/api/functions/create-split-transaction/create-split-transaction.service';
import { createAccountDocument, createCategoryDocument, createProductDocument, createProjectDocument, createRecipientDocument, createSplitRequestIem, createSplitTransactionDocument, createSplitTransactionRequest } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId, getProductId, getProjectId, getTransactionId, toDictionary } from '@household/shared/common/utils';
import { ISplitTransactionDocumentConverter } from '@household/shared/converters/split-transaction-document-converter';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
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
    mockAccountService = createMockService('getAccountById');
    mockProjectService = createMockService('listProjectsByIds');
    mockCategoryService = createMockService('listCategoriesByIds');
    mockRecipientService = createMockService('getRecipientById');
    mockProductService = createMockService('listProductsByIds');
    mockTransactionService = createMockService('saveTransaction');
    mockSplitTransactionDocumentConverter = createMockService('create');

    service = createSplitTransactionServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockProductService.service, mockTransactionService.service, mockSplitTransactionDocumentConverter.service);
  });

  const category = createCategoryDocument({
    categoryType: 'inventory',
  });
  const product = createProductDocument({
    category,
  });
  const project = createProjectDocument();

  const categoryId = getCategoryId(category);
  const projectId = getProjectId(project);
  const productId = getProductId(product);

  const body = createSplitTransactionRequest({
    splits: [
      createSplitRequestIem({
        categoryId,
        projectId,
        productId,
      }),
    ],
  });
  const queriedAccount = createAccountDocument();
  const queriedRecipient = createRecipientDocument();
  const createdDocument = createSplitTransactionDocument();
  const transactionId = getTransactionId(createdDocument);

  describe('should return new id', () => {
    it('if every body property is filled', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
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
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create, {
        body,
        categories: toDictionary([category], '_id'),
        accounts: toDictionary([queriedAccount], '_id'),
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: toDictionary([product], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('if category is not given', async () => {
      const modifiedBody = createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId: undefined,
            projectId,
            productId,
          }),
        ],
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, []);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create, {
        body: modifiedBody,
        categories: {},
        accounts: toDictionary([queriedAccount], '_id'),
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: toDictionary([product], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('if project is not given', async () => {
      const modifiedBody = createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId,
            projectId: undefined,
            productId,
          }),
        ],
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, []);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create, {
        body: modifiedBody,
        categories: toDictionary([category], '_id'),
        accounts: toDictionary([queriedAccount], '_id'),
        projects: {},
        recipient: queriedRecipient,
        products: toDictionary([product], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('if recipient is not given', async () => {
      const modifiedBody: Transaction.SplitRequest = {
        ...body,
        recipientId: undefined,
      };
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, undefined);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create, {
        body: modifiedBody,
        categories: toDictionary([category], '_id'),
        accounts: toDictionary([queriedAccount], '_id'),
        projects: toDictionary([project], '_id'),
        recipient: undefined,
        products: toDictionary([product], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('if no product found but category is not "inventory"', async () => {
      const regularCategory = createCategoryDocument({
        categoryType: 'regular',
      });
      const regularCategoryId = getCategoryId(regularCategory);
      const modifiedBody = createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId: regularCategoryId,
            projectId,
            productId: undefined,
          }),
        ],
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([regularCategory]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [regularCategoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, []);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create, {
        body: modifiedBody,
        categories: toDictionary([regularCategory], '_id'),
        accounts: toDictionary([queriedAccount], '_id'),
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: {},
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('if productId is not set', async () => {
      const modifiedBody = createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId,
            projectId,
            productId: undefined,
          }),
        ],
      });

      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, []);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create, {
        body: modifiedBody,
        categories: toDictionary([category], '_id'),
        accounts: toDictionary([queriedAccount], '_id'),
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: {},
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('with related ids filtered into a distinct array', async () => {
      const product2 = createProductDocument();
      const category2 = createCategoryDocument({
        products: [product2],
      });
      const project2 = createProjectDocument();

      const categoryId2 = getCategoryId(category2);
      const projectId2 = getProjectId(project2);
      const productId2 = getProductId(product2);

      const modifiedBody = createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId,
            projectId,
            productId,
          }),
          createSplitRequestIem({
            categoryId: categoryId2,
            projectId: undefined,
            productId: productId2,
          }),
          createSplitRequestIem({
            categoryId,
            projectId: projectId2,
            productId: undefined,
          }),
          createSplitRequestIem({
            categoryId: undefined,
            projectId,
            productId: productId2,
          }),
          createSplitRequestIem({
            categoryId: categoryId2,
            projectId,
            productId: undefined,
          }),
        ],
      });

      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        category,
        category2,
      ]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([
        project,
        project2,
      ]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([
        product,
        product2,
      ]);
      mockSplitTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId,
        categoryId2,
      ]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [
        projectId,
        projectId2,
      ]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        productId,
        productId2,
      ]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create, {
        body: modifiedBody,
        categories: toDictionary([
          category,
          category2,
        ], '_id'),
        accounts: toDictionary([queriedAccount], '_id'),
        projects: toDictionary([
          project,
          project2,
        ], '_id'),
        recipient: queriedRecipient,
        products: toDictionary([
          product,
          product2,
        ], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });
  });

  describe('should throw error', () => {
    it('if sum of splits is not equal to total amount', async () => {
      const modifiedBody = createSplitTransactionRequest({
        amount: 100,
      });

      await service({
        body: modifiedBody,
        expiresIn: undefined,
      }).catch(validateError('Sum of splits must equal to total amount', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query account', async () => {
      mockAccountService.functions.getAccountById.mockRejectedValue('this is a mongo error');
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query categories', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockRejectedValue('this is a mongo error');
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query projects', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockRejectedValue('this is a mongo error');
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query recipients', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockRejectedValue('this is a mongo error');
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query products', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no account found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(undefined);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no categories found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Some of the categories are not found', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no projects found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Some of the projects are not found', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no recipient found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if category is "inventory" and no product found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No product found', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
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

      const modifiedBody = createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId,
            projectId,
            productId: otherProductId,
          }),
        ],
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([otherProduct]);

      await service({
        body: modifiedBody,
        expiresIn: undefined,
      }).catch(validateError('Product belongs to different category', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [otherProductId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to save transaction', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
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
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.create, {
        body,
        categories: toDictionary([category], '_id'),
        accounts: toDictionary([queriedAccount], '_id'),
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: toDictionary([product], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(9);
    });
  });
});

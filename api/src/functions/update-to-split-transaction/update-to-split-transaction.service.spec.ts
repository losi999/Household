import { IUpdateToSplitTransactionService, updateToSplitTransactionServiceFactory } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.service';
import { createSplitTransactionRequest, createAccountDocument, createCategoryDocument, createProjectDocument, createRecipientDocument, createSplitTransactionDocument, createSplitRequestIem, createInventoryRequest, createProductDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId, getProjectId, getProductId, toDictionary, getTransactionId } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
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
  let mockTransactionDocumentConverter: Mock<ITransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('getAccountById');
    mockProjectService = createMockService('listProjectsByIds');
    mockCategoryService = createMockService('listCategoriesByIds');
    mockRecipientService = createMockService('getRecipientById');
    mockProductService = createMockService('listProductsByIds');
    mockTransactionService = createMockService('updateTransaction', 'getTransactionById');
    mockTransactionDocumentConverter = createMockService('updateSplitDocument');

    service = updateToSplitTransactionServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockProductService.service, mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  const category = createCategoryDocument({
    categoryType: 'inventory',
  });
  const project = createProjectDocument();
  const product = createProductDocument({
    category,
  });

  const categoryId = getCategoryId(category);
  const projectId = getProjectId(project);
  const productId = getProductId(product);

  const body = createSplitTransactionRequest({
    splits: [
      createSplitRequestIem({
        categoryId,
        projectId,
        inventory: createInventoryRequest({
          productId,
        }),
      }),
    ],
  });
  const queriedDocument = createSplitTransactionDocument();
  const transactionId = getTransactionId(queriedDocument);
  const updatedDocument = createSplitTransactionDocument({
    description: 'updated',
  });
  const queriedAccount = createAccountDocument();
  const queriedRecipient = createRecipientDocument();

  describe('should return', () => {
    it('if every body property is filled', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(updatedDocument);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body,
        categories: toDictionary([category], '_id'),
        account: queriedAccount,
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: toDictionary([product], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(8);
    });

    it('if category is not given', async () => {
      const modifiedBody = createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId: undefined,
            projectId,
            inventory: createInventoryRequest({
              productId,
            }),
          }),
        ],
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(updatedDocument);

      await service({
        body: modifiedBody,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, []);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body: modifiedBody,
        categories: {},
        account: queriedAccount,
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: toDictionary([product], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(8);
    });

    it('if project is not given', async () => {
      const modifiedBody = createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId,
            projectId: undefined,
            inventory: createInventoryRequest({
              productId,
            }),
          }),
        ],
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(updatedDocument);

      await service({
        body: modifiedBody,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, []);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body: modifiedBody,
        categories: toDictionary([category], '_id'),
        account: queriedAccount,
        projects: {},
        recipient: queriedRecipient,
        products: toDictionary([product], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(8);
    });

    it('if recipient is not given', async () => {
      const modifiedBody: Transaction.SplitRequest = {
        ...body,
        recipientId: undefined,
      };
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(updatedDocument);

      await service({
        body: modifiedBody,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, undefined);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body: modifiedBody,
        categories: toDictionary([category], '_id'),
        account: queriedAccount,
        projects: toDictionary([project], '_id'),
        products: toDictionary([product], '_id'),
        recipient: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
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
            inventory: undefined,
          }),
        ],
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([regularCategory]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([]);
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(updatedDocument);

      await service({
        body: modifiedBody,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [regularCategoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, []);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        body: modifiedBody,
        document: queriedDocument,
        categories: toDictionary([regularCategory], '_id'),
        account: queriedAccount,
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: {},
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(8);
    });

    it('if inventory is not set', async () => {
      const modifiedBody = createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId,
            projectId,
            inventory: undefined,
          }),
        ],
      });

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([]);
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(updatedDocument);

      await service({
        body: modifiedBody,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, []);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body: modifiedBody,
        categories: toDictionary([category], '_id'),
        account: queriedAccount,
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: {},
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(8);
    });

    it('with related ids filtered into a distinct array', async () => {
      const category2 = createCategoryDocument();
      const project2 = createProjectDocument();
      const product2 = createProductDocument({
        category: category2,
      });

      const categoryId2 = getCategoryId(category2);
      const projectId2 = getProjectId(project2);
      const productId2 = getProductId(product2);

      const modifiedBody = createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId,
            projectId,
            inventory: createInventoryRequest({
              productId,
            }),
          }),
          createSplitRequestIem({
            categoryId: categoryId2,
            projectId: undefined,
            inventory: createInventoryRequest({
              productId: productId2,
            }),
          }),
          createSplitRequestIem({
            categoryId,
            projectId: projectId2,
            inventory: undefined,
          }),
          createSplitRequestIem({
            categoryId: undefined,
            projectId,
            inventory: createInventoryRequest({
              productId: productId2,
            }),
          }),
          createSplitRequestIem({
            categoryId: categoryId2,
            projectId,
            inventory: undefined,
          }),
        ],
      });

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
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
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(updatedDocument);

      await service({
        body: modifiedBody,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body: modifiedBody,
        categories: toDictionary([
          category,
          category2,
        ], '_id'),
        account: queriedAccount,
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
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
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
      validateFunctionCall(mockAccountService.functions.getAccountById);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
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
      validateFunctionCall(mockAccountService.functions.getAccountById);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if sum of splits is not equal to total amount', async () => {
      const modifiedBody = createSplitTransactionRequest({
        amount: 100,
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);

      await service({
        body: modifiedBody,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Sum of splits must equal to total amount', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query account', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockRejectedValue('this is a mongo error');
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
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query categories', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
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
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query projects', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
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
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query recipients', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
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
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query products', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
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
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no account found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(undefined);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no categories found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
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
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no projects found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
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
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no recipient found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
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
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if category is "inventory" and no product found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
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
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if product belongs to different category', async () => {
      const otherProduct = createProductDocument({
        category: createCategoryDocument(),
      });
      const otherProductId = getProductId(otherProduct);

      const modifiedBody = createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId,
            projectId,
            inventory: createInventoryRequest({
              productId: otherProductId,
            }),
          }),
        ],
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([otherProduct]);

      await service({
        body: modifiedBody,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Product belongs to different category', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [otherProductId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to update transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([category]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([project]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.listProductsByIds.mockResolvedValue([product]);
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating transaction', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.listProductsByIds, [productId]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body,
        categories: toDictionary([category], '_id'),
        account: queriedAccount,
        projects: toDictionary([project], '_id'),
        recipient: queriedRecipient,
        products: toDictionary([product], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(10);
    });
  });
});

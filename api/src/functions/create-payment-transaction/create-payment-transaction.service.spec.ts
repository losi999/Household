import { ICreatePaymentTransactionService, createPaymentTransactionServiceFactory } from '@household/api/functions/create-payment-transaction/create-payment-transaction.service';
import { createAccountDocument, createCategoryDocument, createPaymentTransactionDocument, createPaymentTransactionRequest, createProductDocument, createProjectDocument, createRecipientDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Types } from 'mongoose';

describe('Create payment transaction service', () => {
  let service: ICreatePaymentTransactionService;
  let mockAccountService: Mock<IAccountService>;
  let mockCategoryService: Mock<ICategoryService>;
  let mockRecipientService: Mock<IRecipientService>;
  let mockProjectService: Mock<IProjectService>;
  let mockProductService: Mock<IProductService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransactionDocumentConverter: Mock<ITransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('getAccountById');
    mockProjectService = createMockService('getProjectById');
    mockCategoryService = createMockService('getCategoryById');
    mockRecipientService = createMockService('getRecipientById');
    mockProductService = createMockService('getProductById');
    mockTransactionService = createMockService('saveTransaction');
    mockTransactionDocumentConverter = createMockService('createPaymentDocument');

    service = createPaymentTransactionServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockProductService.service, mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  const body = createPaymentTransactionRequest();
  const categoryId = new Types.ObjectId();
  const queriedAccount = createAccountDocument();
  const queriedCategory = createCategoryDocument({
    categoryType: 'inventory',
    _id: categoryId,
  });
  const queriedProject = createProjectDocument();
  const queriedRecipient = createRecipientDocument();
  const queriedProduct = createProductDocument({
    category: queriedCategory,
  });
  const transactionId = new Types.ObjectId();
  const createdDocument = createPaymentTransactionDocument({
    _id: transactionId,
  });

  describe('should return new id', () => {
    it('if every body property is filled', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockTransactionDocumentConverter.functions.createPaymentDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId.toString());
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument, {
        body,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('if category is not given', async () => {
      const modifiedBody = createPaymentTransactionRequest({
        categoryId: undefined,
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(undefined);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockTransactionDocumentConverter.functions.createPaymentDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId.toString());
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, undefined);
      validateFunctionCall(mockProjectService.functions.getProjectById, modifiedBody.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, modifiedBody.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument, {
        body: modifiedBody,
        category: undefined,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('if project is not given', async () => {
      const modifiedBody = createPaymentTransactionRequest({
        projectId: undefined,
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(undefined);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockTransactionDocumentConverter.functions.createPaymentDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId.toString());
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, modifiedBody.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, undefined);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, modifiedBody.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument, {
        body: modifiedBody,
        category: queriedCategory,
        account: queriedAccount,
        project: undefined,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('if recipient is not given', async () => {
      const modifiedBody = createPaymentTransactionRequest({
        recipientId: undefined,
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockTransactionDocumentConverter.functions.createPaymentDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId.toString());
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, modifiedBody.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, modifiedBody.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, undefined);
      validateFunctionCall(mockProductService.functions.getProductById, modifiedBody.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument, {
        body: modifiedBody,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: undefined,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('if no product found but category is not "inventory"', async () => {
      const category = createCategoryDocument({
        categoryType: 'invoice',
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(category);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(undefined);
      mockTransactionDocumentConverter.functions.createPaymentDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId.toString());
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument, {
        body,
        category,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('if inventory is not set', async () => {
      const modifiedBody = createPaymentTransactionRequest({
        inventory: undefined,
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(undefined);
      mockTransactionDocumentConverter.functions.createPaymentDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId.toString());
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, modifiedBody.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, modifiedBody.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, undefined);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument, {
        body: modifiedBody,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });
  });

  describe('should throw error', () => {
    it('if no account found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(undefined);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no category found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(undefined);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No category found', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no project found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(undefined);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No project found', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if no recipient found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if category is "inventory" and no product found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(undefined);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No product found', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if product belongs to different category', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(createProductDocument({
        category: createCategoryDocument({
          _id: new Types.ObjectId(),
        }),
      }));

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Product belongs to different category', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query account', async () => {
      mockAccountService.functions.getAccountById.mockRejectedValue('this is a mongo error');
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query category', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockRejectedValue('this is a mongo error');
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query project', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockRejectedValue('this is a mongo error');
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query recipient', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockRejectedValue('this is a mongo error');
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to query product', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to save transaction', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockTransactionDocumentConverter.functions.createPaymentDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving transaction', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createPaymentDocument, {
        body,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(9);
    });
  });
});

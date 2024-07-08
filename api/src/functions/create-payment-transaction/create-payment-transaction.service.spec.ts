import { ICreatePaymentTransactionService, createPaymentTransactionServiceFactory } from '@household/api/functions/create-payment-transaction/create-payment-transaction.service';
import { createAccountDocument, createCategoryDocument, createPaymentTransactionDocument, createPaymentTransactionRequest, createProductDocument, createProductId, createProjectDocument, createRecipientDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { IPaymentTransactionDocumentConverter } from '@household/shared/converters/payment-transaction-document-converter';
import { IReimbursementTransactionDocumentConverter } from '@household/shared/converters/reimbursement-transaction-document-converter';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

describe('Create payment transaction service', () => {
  let service: ICreatePaymentTransactionService;
  let mockAccountService: Mock<IAccountService>;
  let mockCategoryService: Mock<ICategoryService>;
  let mockRecipientService: Mock<IRecipientService>;
  let mockProjectService: Mock<IProjectService>;
  let mockProductService: Mock<IProductService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockPaymentTransactionDocumentConverter: Mock<IPaymentTransactionDocumentConverter>;
  let mockDeferredTransactionDocumentConverter: Mock<IDeferredTransactionDocumentConverter>;
  let mockReimbursementTransactionDocumentConverter: Mock<IReimbursementTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('getAccountById');
    mockProjectService = createMockService('getProjectById');
    mockCategoryService = createMockService('getCategoryById');
    mockRecipientService = createMockService('getRecipientById');
    mockProductService = createMockService('getProductById');
    mockTransactionService = createMockService('saveTransaction');
    mockPaymentTransactionDocumentConverter = createMockService('create');
    mockDeferredTransactionDocumentConverter = createMockService('create');
    mockReimbursementTransactionDocumentConverter = createMockService('create');

    service = createPaymentTransactionServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockProductService.service, mockTransactionService.service, mockPaymentTransactionDocumentConverter.service, mockReimbursementTransactionDocumentConverter.service, mockDeferredTransactionDocumentConverter.service);
  });

  let body: Transaction.PaymentRequest;
  let queriedAccount: Account.Document;
  let queriedCategory: Category.Document;
  let queriedProject: Project.Document;
  let queriedRecipient: Recipient.Document;
  let queriedProduct: Product.Document;
  const createdDocument = createPaymentTransactionDocument();
  const transactionId = getTransactionId(createdDocument);

  beforeEach(() => {
    queriedAccount = createAccountDocument();
    queriedCategory = createCategoryDocument({
      categoryType: 'inventory',
    });
    queriedProduct = createProductDocument({
      category: queriedCategory,
    });
    queriedProject = createProjectDocument();
    queriedRecipient = createRecipientDocument();

    body = createPaymentTransactionRequest({
      categoryId: getCategoryId(queriedCategory),
      projectId: getProjectId(queriedProject),
      recipientId: getRecipientId(queriedRecipient),
      accountId: getAccountId(queriedAccount),
      productId: getProductId(queriedProduct),
    });
  });

  describe('should return new id', () => {
    it('if every body property is filled', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockPaymentTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create, {
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
      body.categoryId = undefined;

      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(undefined);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockPaymentTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, undefined);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create, {
        body,
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
      body.projectId = undefined,

      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(undefined);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockPaymentTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, undefined);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create, {
        body,
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
      body.recipientId = undefined;

      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockPaymentTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, undefined);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create, {
        body,
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
      queriedCategory.categoryType = 'invoice';

      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(undefined);
      mockPaymentTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create, {
        body,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });

    it('if productId is not set', async () => {
      body.productId = undefined;

      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(undefined);
      mockPaymentTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, undefined);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create, {
        body,
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
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
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
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
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
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
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
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
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
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if product belongs to different category', async () => {
      body.productId = createProductId();

      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(createProductDocument());

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Product belongs to different category', 400));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
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
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
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
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
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
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
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
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
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
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(9);
    });

    it('if unable to save transaction', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockPaymentTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving transaction', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create, {
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

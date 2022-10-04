import { IUpdateToPaymentTransactionService, updateToPaymentTransactionServiceFactory } from '@household/api/functions/update-to-payment-transaction/update-to-payment-transaction.service';
import { createAccountDocument, createCategoryDocument, createInventoryRequest, createPaymentTransactionDocument, createPaymentTransactionRequest, createProductDocument, createProductId, createProjectDocument, createRecipientDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId, getProjectId, getRecipientId, getAccountId, getProductId, getTransactionId } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction, Account, Category, Project, Recipient, Product } from '@household/shared/types/types';

describe('Update to payment transaction service', () => {
  let service: IUpdateToPaymentTransactionService;
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
    mockTransactionService = createMockService('updateTransaction', 'getTransactionById');
    mockTransactionDocumentConverter = createMockService('updatePaymentDocument');

    service = updateToPaymentTransactionServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockProductService.service, mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  let body: Transaction.PaymentRequest;
  let queriedAccount: Account.Document;
  let queriedCategory: Category.Document;
  let queriedProject: Project.Document;
  let queriedRecipient: Recipient.Document;
  let queriedProduct: Product.Document;

  beforeEach(() => {
    queriedAccount = createAccountDocument();
    queriedProduct = createProductDocument();
    queriedCategory = createCategoryDocument({
      categoryType: 'inventory',
      products: [queriedProduct],
    });
    queriedProject = createProjectDocument();
    queriedRecipient = createRecipientDocument();

    body = createPaymentTransactionRequest({
      categoryId: getCategoryId(queriedCategory),
      projectId: getProjectId(queriedProject),
      recipientId: getRecipientId(queriedRecipient),
      accountId: getAccountId(queriedAccount),
      inventory: createInventoryRequest({
        productId: getProductId(queriedProduct),
      }),
    });
  });

  const queriedDocument = createPaymentTransactionDocument();
  const transactionId = getTransactionId(queriedDocument);
  const updatedDocument = createPaymentTransactionDocument({
    description: 'updated',
  });

  describe('should return', () => {
    it('if every body property is filled', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockTransactionDocumentConverter.functions.updatePaymentDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument, {
        body,
        document: queriedDocument,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(8);
    });

    it('if category is not given', async () => {
      body.categoryId = undefined;

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(undefined);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockTransactionDocumentConverter.functions.updatePaymentDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, undefined);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument, {
        body,
        document: queriedDocument,
        category: undefined,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(8);
    });

    it('if project is not given', async () => {
      body.projectId = undefined,

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(undefined);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockTransactionDocumentConverter.functions.updatePaymentDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, undefined);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument, {
        body,
        document: queriedDocument,
        category: queriedCategory,
        account: queriedAccount,
        project: undefined,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(8);
    });

    it('if recipient is not given', async () => {
      body.recipientId = undefined;

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockTransactionDocumentConverter.functions.updatePaymentDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, undefined);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument, {
        body,
        document: queriedDocument,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: undefined,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(8);
    });

    it('if no product found but category is not "inventory"', async () => {
      queriedCategory.categoryType = 'invoice';

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(undefined);
      mockTransactionDocumentConverter.functions.updatePaymentDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument, {
        body,
        document: queriedDocument,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(8);
    });

    it('if inventory is not set', async () => {
      body.inventory = undefined;

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(undefined);
      mockTransactionDocumentConverter.functions.updatePaymentDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, undefined);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument, {
        body,
        document: queriedDocument,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: undefined,
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
      validateFunctionCall(mockCategoryService.functions.getCategoryById);
      validateFunctionCall(mockProjectService.functions.getProjectById);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.getProductById);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
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
      validateFunctionCall(mockCategoryService.functions.getCategoryById);
      validateFunctionCall(mockProjectService.functions.getProjectById);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.getProductById);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });
    it('if no account found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(undefined);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no category found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(undefined);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No category found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no project found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(undefined);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No project found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if no recipient found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if category is "inventory" and no product found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No product found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if product belongs to different category', async () => {
      body.inventory.productId = createProductId();

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(createProductDocument());

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Product belongs to different category', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query account', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockRejectedValue('this is a mongo error');
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query category', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockRejectedValue('this is a mongo error');
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query project', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockRejectedValue('this is a mongo error');
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query recipient', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockRejectedValue('this is a mongo error');
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to query product', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(10);
    });

    it('if unable to update transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockTransactionDocumentConverter.functions.updatePaymentDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating transaction', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.inventory.productId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updatePaymentDocument, {
        body,
        document: queriedDocument,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(10);
    });
  });
});

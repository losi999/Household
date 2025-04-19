import { ICreatePaymentTransactionService, createPaymentTransactionServiceFactory } from '@household/api/functions/create-payment-transaction/create-payment-transaction.service';
import { createAccountDocument, createCategoryDocument, createDeferredTransactionDocument, createPaymentTransactionDocument, createPaymentTransactionRequest, createProductDocument, createProductId, createProjectDocument, createRecipientDocument, createReimbursementTransactionDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { IPaymentTransactionDocumentConverter } from '@household/shared/converters/payment-transaction-document-converter';
import { IReimbursementTransactionDocumentConverter } from '@household/shared/converters/reimbursement-transaction-document-converter';
import { AccountType, CategoryType } from '@household/shared/enums';
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
    mockAccountService = createMockService('listAccountsByIds');
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
  let queriedLoanAccount: Account.Document;
  let queriedCategory: Category.Document;
  let queriedProject: Project.Document;
  let queriedRecipient: Recipient.Document;
  let queriedProduct: Product.Document;
  const createdPaymentDocument = createPaymentTransactionDocument();
  const createdDeferredDocument = createDeferredTransactionDocument();
  const createdReimbursementDocument = createReimbursementTransactionDocument();

  beforeEach(() => {
    queriedAccount = createAccountDocument();
    queriedLoanAccount = createAccountDocument({
      accountType: AccountType.Loan,
    });
    queriedCategory = createCategoryDocument({
      categoryType: CategoryType.Inventory,
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
    it('of created payment document', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockPaymentTransactionDocumentConverter.functions.create.mockReturnValue(createdPaymentDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdPaymentDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(getTransactionId(createdPaymentDocument));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdPaymentDocument);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.create);
      expect.assertions(10);
    });

    it('of created deferred document', async () => {
      body = createPaymentTransactionRequest({
        ...body,
        amount: -1023,
        loanAccountId: getAccountId(queriedLoanAccount),
      });
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedLoanAccount,
      ]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockDeferredTransactionDocumentConverter.functions.create.mockReturnValue(createdDeferredDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDeferredDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(getTransactionId(createdDeferredDocument));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create, {
        body,
        category: queriedCategory,
        payingAccount: queriedAccount,
        ownerAccount: queriedLoanAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDeferredDocument);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.create);
      expect.assertions(10);
    });

    it('of created reimbursement document', async () => {
      body = createPaymentTransactionRequest({
        ...body,
        amount: -1023,
        accountId: getAccountId(queriedLoanAccount),
        loanAccountId: getAccountId(queriedAccount),
      });
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedLoanAccount,
      ]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockReimbursementTransactionDocumentConverter.functions.create.mockReturnValue(createdReimbursementDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdReimbursementDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(getTransactionId(createdReimbursementDocument));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.create, {
        body,
        category: queriedCategory,
        payingAccount: queriedLoanAccount,
        ownerAccount: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdReimbursementDocument);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(10);
    });
  });

  describe('should throw error', () => {
    it('if account and loanAccount would be the same', async () => {
      body = createPaymentTransactionRequest({
        ...body,
        loanAccountId: body.accountId,
      });
      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Cannot loan to same account', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.getCategoryById);
      validateFunctionCall(mockProjectService.functions.getProjectById);
      validateFunctionCall(mockRecipientService.functions.getRecipientById);
      validateFunctionCall(mockProductService.functions.getProductById);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });
    it('if no account found', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if no loan account found', async () => {
      body = createPaymentTransactionRequest({
        ...body,
        loanAccountId: getAccountId(queriedLoanAccount),
      });
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if no category found', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(undefined);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No category found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if no project found', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(undefined);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No project found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if no recipient found', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if category is "inventory" and no product found', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(undefined);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No product found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if product belongs to different category', async () => {
      body.productId = createProductId();

      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(createProductDocument());

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Product belongs to different category', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if unable to query account', async () => {
      mockAccountService.functions.listAccountsByIds.mockRejectedValue('this is a mongo error');
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if unable to query category', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockRejectedValue('this is a mongo error');
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if unable to query project', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockRejectedValue('this is a mongo error');
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if unable to query recipient', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockRejectedValue('this is a mongo error');
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if unable to query product', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if account is loan type for payment transaction', async () => {
      body = createPaymentTransactionRequest({
        ...body,
        accountId: getAccountId(queriedLoanAccount),
      });
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedLoanAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Account type cannot be loan', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if loanAccount is loan type for reimbursement transaction', async () => {
      const queriedSecondLoanAccount = createAccountDocument({
        accountType: AccountType.Loan,
      });
      body = createPaymentTransactionRequest({
        ...body,
        loanAccountId: getAccountId(queriedSecondLoanAccount),
        accountId: getAccountId(queriedLoanAccount),
      });
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedLoanAccount,
        queriedSecondLoanAccount,
      ]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Account type cannot be loan', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.getProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });

    it('if unable to save transaction', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.getProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockPaymentTransactionDocumentConverter.functions.create.mockReturnValue(createdPaymentDocument);
      mockTransactionService.functions.saveTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving transaction', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        undefined,
      ]);
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdPaymentDocument);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.create);
      expect.assertions(11);
    });
  });
});

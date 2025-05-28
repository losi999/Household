import { IUpdateToPaymentTransactionService, updateToPaymentTransactionServiceFactory } from '@household/api/functions/update-to-payment-transaction/update-to-payment-transaction.service';
import { createAccountDocument, createCategoryDocument, createDocumentUpdate, createPaymentTransactionRequest, createProductDocument, createProductId, createProjectDocument, createRecipientDocument, createTransferTransactionDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId, getProjectId, getRecipientId, getAccountId, getProductId, getTransactionId } from '@household/shared/common/utils';
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
import { Transaction, Account, Category, Project, Recipient, Product } from '@household/shared/types/types';

describe('Update to payment transaction service', () => {
  let service: IUpdateToPaymentTransactionService;
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
    mockAccountService = createMockService('findAccountsByIds');
    mockProjectService = createMockService('findProjectById');
    mockCategoryService = createMockService('getCategoryById');
    mockRecipientService = createMockService('findRecipientById');
    mockProductService = createMockService('getProductById');
    mockTransactionService = createMockService('updateTransaction', 'getTransactionById');
    mockPaymentTransactionDocumentConverter = createMockService('update');
    mockDeferredTransactionDocumentConverter = createMockService('update');
    mockReimbursementTransactionDocumentConverter = createMockService('update');

    service = updateToPaymentTransactionServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockProductService.service, mockTransactionService.service, mockPaymentTransactionDocumentConverter.service, mockReimbursementTransactionDocumentConverter.service, mockDeferredTransactionDocumentConverter.service);
  });

  let body: Transaction.PaymentRequest;
  let queriedAccount: Account.Document;
  let queriedLoanAccount: Account.Document;
  let queriedCategory: Category.Document;
  let queriedProject: Project.Document;
  let queriedRecipient: Recipient.Document;
  let queriedProduct: Product.Document;

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

  const queriedDocument = createTransferTransactionDocument();
  const transactionId = getTransactionId(queriedDocument);
  const updateQuery = createDocumentUpdate({
    description: 'updated',
  });

  describe('should return', () => {
    it('if updated to payment transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockPaymentTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update, {
        body,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      expect.assertions(10);
    });

    it('if updated to deferred transaction', async () => {
      body = createPaymentTransactionRequest({
        ...body,
        loanAccountId: getAccountId(queriedLoanAccount),
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedLoanAccount,
      ]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockDeferredTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update, {
        body,
        category: queriedCategory,
        payingAccount: queriedAccount,
        ownerAccount: queriedLoanAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      expect.assertions(10);
    });

    it('if updated to reimbursement transaction', async () => {
      body = createPaymentTransactionRequest({
        ...body,
        accountId: getAccountId(queriedLoanAccount),
        loanAccountId: getAccountId(queriedAccount),
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedLoanAccount,
      ]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockReimbursementTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update, {
        body,
        category: queriedCategory,
        ownerAccount: queriedAccount,
        payingAccount: queriedLoanAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      expect.assertions(10);
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
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.getCategoryById);
      validateFunctionCall(mockProjectService.functions.findProjectById);
      validateFunctionCall(mockRecipientService.functions.findRecipientById);
      validateFunctionCall(mockProductService.functions.getProductById);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if no transaction found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No transaction found', 404));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.getCategoryById);
      validateFunctionCall(mockProjectService.functions.findProjectById);
      validateFunctionCall(mockRecipientService.functions.findRecipientById);
      validateFunctionCall(mockProductService.functions.getProductById);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if account and loanAccount would be the same', async () => {
      body = createPaymentTransactionRequest({
        ...body,
        loanAccountId: body.accountId,
      });

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Cannot loan to same account', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockCategoryService.functions.getCategoryById);
      validateFunctionCall(mockProjectService.functions.findProjectById);
      validateFunctionCall(mockRecipientService.functions.findRecipientById);
      validateFunctionCall(mockProductService.functions.getProductById);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      expect.assertions(12);
    });
    it('if no account found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if no loan account found', async () => {
      body = createPaymentTransactionRequest({
        ...body,
        loanAccountId: getAccountId(queriedLoanAccount),
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if no category found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(undefined);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No category found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if no project found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(undefined);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No project found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if no recipient found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(undefined);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if category is "inventory" and no product found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No product found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if product belongs to different category', async () => {
      body.productId = createProductId();

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(createProductDocument());

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Product belongs to different category', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if unable to query account', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockRejectedValue('this is a mongo error');
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if unable to query category', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockRejectedValue('this is a mongo error');
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if unable to query project', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockRejectedValue('this is a mongo error');
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if unable to query recipient', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockRejectedValue('this is a mongo error');
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if unable to query product', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(12);
    });

    it('if account is loan type for payment transaction', async () => {
      body = createPaymentTransactionRequest({
        ...body,
        accountId: getAccountId(queriedLoanAccount),
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedLoanAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Account type cannot be loan', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      expect.assertions(12);
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
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedLoanAccount,
        queriedSecondLoanAccount,
      ]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Account type cannot be loan', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.loanAccountId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      expect.assertions(12);
    });

    it('if unable to update transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([queriedAccount]);
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedProject);
      mockRecipientService.functions.findRecipientById.mockResolvedValue(queriedRecipient);
      mockProductService.functions.getProductById.mockResolvedValue(queriedProduct);
      mockPaymentTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating transaction', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        undefined,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.categoryId);
      validateFunctionCall(mockProjectService.functions.findProjectById, body.projectId);
      validateFunctionCall(mockRecipientService.functions.findRecipientById, body.recipientId);
      validateFunctionCall(mockProductService.functions.getProductById, body.productId);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.update, {
        body,
        category: queriedCategory,
        account: queriedAccount,
        project: queriedProject,
        recipient: queriedRecipient,
        product: queriedProduct,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.update);
      expect.assertions(12);
    });
  });
});

import { IUpdateToSplitTransactionService, updateToSplitTransactionServiceFactory } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.service';
import { createSplitTransactionRequest, createAccountDocument, createCategoryDocument, createProjectDocument, createRecipientDocument, createSplitTransactionDocument, createTransactionId, createProjectId, createCategoryId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';

describe('Update to split transaction service', () => {
  let service: IUpdateToSplitTransactionService;
  let mockAccountService: Mock<IAccountService>;
  let mockCategoryService: Mock<ICategoryService>;
  let mockRecipientService: Mock<IRecipientService>;
  let mockProjectService: Mock<IProjectService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransactionDocumentConverter: Mock<ITransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('getAccountById');
    mockProjectService = createMockService('listProjectsByIds');
    mockCategoryService = createMockService('listCategoriesByIds');
    mockRecipientService = createMockService('getRecipientById');
    mockTransactionService = createMockService('updateTransaction', 'getTransactionById');
    mockTransactionDocumentConverter = createMockService('updateSplitDocument');

    service = updateToSplitTransactionServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  const categoryId1 = createCategoryId('category1');
  const categoryId2 = createCategoryId('category2');
  const projectId1 = createProjectId();
  const projectId2 = createProjectId();
  const transactionId = createTransactionId();

  const body = createSplitTransactionRequest({}, {
    categoryId: categoryId1,
    projectId: projectId1,
  }, {
    categoryId: categoryId2,
    projectId: projectId2,
  }, {
    categoryId: categoryId1,
    projectId: projectId2,
  });
  const queriedDocument = createSplitTransactionDocument();
  const updatedDocument = createSplitTransactionDocument({
    description: 'updated',
  });
  const queriedAccount = createAccountDocument();
  const queriedCategory = createCategoryDocument();
  const queriedProject = createProjectDocument();
  const queriedRecipient = createRecipientDocument();

  describe('should return', () => {
    it('if every body property is filled', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        queriedCategory,
        queriedCategory,
      ]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([
        queriedProject,
        queriedProject,
      ]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(updatedDocument);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId1,
        categoryId2,
      ]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [
        projectId1,
        projectId2,
      ]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body,
        categories: [
          queriedCategory,
          queriedCategory,
        ],
        account: queriedAccount,
        projects: [
          queriedProject,
          queriedProject,
        ],
        recipient: queriedRecipient,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(7);
    });

    it('if category is not given', async () => {
      const modifiedBody = createSplitTransactionRequest({}, {
        categoryId: undefined,
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([queriedProject]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
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
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [modifiedBody.splits[0].projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body: modifiedBody,
        categories: [],
        account: queriedAccount,
        projects: [queriedProject],
        recipient: queriedRecipient,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(7);
    });

    it('if project is not given', async () => {
      const modifiedBody = createSplitTransactionRequest({}, {
        projectId: undefined,
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([queriedCategory]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(updatedDocument);

      await service({
        body: modifiedBody,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [modifiedBody.splits[0].categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, []);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body: modifiedBody,
        categories: [queriedCategory],
        account: queriedAccount,
        projects: [],
        recipient: queriedRecipient,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(7);
    });

    it('if recipient is not given', async () => {
      const modifiedBody = createSplitTransactionRequest({
        recipientId: undefined,
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([queriedCategory]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([queriedProject]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(updatedDocument);

      await service({
        body: modifiedBody,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [modifiedBody.splits[0].categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [modifiedBody.splits[0].projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, undefined);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body: modifiedBody,
        categories: [queriedCategory],
        account: queriedAccount,
        projects: [queriedProject],
        recipient: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(7);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(9);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(9);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(9);
    });

    it('if unable to query account', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockRejectedValue('this is a mongo error');
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        queriedCategory,
        queriedCategory,
      ]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([
        queriedProject,
        queriedProject,
      ]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedAccount);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId1,
        categoryId2,
      ]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [
        projectId1,
        projectId2,
      ]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(9);
    });

    it('if unable to query categories', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockRejectedValue('this is a mongo error');
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([
        queriedProject,
        queriedProject,
      ]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedAccount);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId1,
        categoryId2,
      ]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [
        projectId1,
        projectId2,
      ]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(9);
    });

    it('if unable to query projects', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        queriedCategory,
        queriedCategory,
      ]);
      mockProjectService.functions.listProjectsByIds.mockRejectedValue('this is a mongo error');
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedAccount);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId1,
        categoryId2,
      ]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [
        projectId1,
        projectId2,
      ]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(9);
    });

    it('if unable to query recipients', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        queriedCategory,
        queriedCategory,
      ]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([
        queriedProject,
        queriedProject,
      ]);
      mockRecipientService.functions.getRecipientById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId1,
        categoryId2,
      ]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [
        projectId1,
        projectId2,
      ]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(9);
    });

    it('if no account found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(undefined);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        queriedCategory,
        queriedCategory,
      ]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([
        queriedProject,
        queriedProject,
      ]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId1,
        categoryId2,
      ]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [
        projectId1,
        projectId2,
      ]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(9);
    });

    it('if no categories found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([
        queriedProject,
        queriedProject,
      ]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Some of the categories are not found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId1,
        categoryId2,
      ]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [
        projectId1,
        projectId2,
      ]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(9);
    });

    it('if no projects found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        queriedCategory,
        queriedCategory,
      ]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Some of the projects are not found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId1,
        categoryId2,
      ]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [
        projectId1,
        projectId2,
      ]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(9);
    });

    it('if no recipient found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        queriedCategory,
        queriedCategory,
      ]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([
        queriedProject,
        queriedProject,
      ]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId1,
        categoryId2,
      ]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [
        projectId1,
        projectId2,
      ]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(9);
    });

    it('if unable to update transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        queriedCategory,
        queriedCategory,
      ]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([
        queriedProject,
        queriedProject,
      ]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockTransactionDocumentConverter.functions.updateSplitDocument.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating transaction', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.getAccountById, body.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId1,
        categoryId2,
      ]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [
        projectId1,
        projectId2,
      ]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, body.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateSplitDocument, {
        document: queriedDocument,
        body,
        categories: [
          queriedCategory,
          queriedCategory,
        ],
        account: queriedAccount,
        projects: [
          queriedProject,
          queriedProject,
        ],
        recipient: queriedRecipient,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(9);
    });
  });
});

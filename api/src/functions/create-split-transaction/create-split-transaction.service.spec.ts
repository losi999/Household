import { ICreateSplitTransactionService, createSplitTransactionServiceFactory } from '@household/api/functions/create-split-transaction/create-split-transaction.service';
import { createAccountDocument, createCategoryDocument, createCategoryId, createProjectDocument, createProjectId, createRecipientDocument, createSplitTransactionDocument, createSplitTransactionRequest } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Types } from 'mongoose';

describe('Create split transaction service', () => {
  let service: ICreateSplitTransactionService;
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
    mockTransactionService = createMockService('saveTransaction');
    mockTransactionDocumentConverter = createMockService('createSplitDocument');

    service = createSplitTransactionServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  const categoryId1 = createCategoryId('category1');
  const categoryId2 = createCategoryId('category2');
  const projectId1 = createProjectId('project1');
  const projectId2 = createProjectId('project2');

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
  const queriedAccount = createAccountDocument();
  const queriedCategory = createCategoryDocument();
  const queriedProject = createProjectDocument();
  const queriedRecipient = createRecipientDocument();
  const transactionId = new Types.ObjectId();
  const createdDocument = createSplitTransactionDocument({
    _id: transactionId,
  });

  describe('should return new id', () => {
    it('if every body property is filled', async () => {
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
      mockTransactionDocumentConverter.functions.createSplitDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId.toString());
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument, {
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(7);
    });

    it('if category is not given', async () => {
      const modifiedBody = createSplitTransactionRequest({}, {
        categoryId: undefined,
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([queriedProject]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockTransactionDocumentConverter.functions.createSplitDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId.toString());
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, []);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [modifiedBody.splits[0].projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument, {
        body: modifiedBody,
        categories: [],
        account: queriedAccount,
        projects: [queriedProject],
        recipient: queriedRecipient,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(7);
    });

    it('if project is not given', async () => {
      const modifiedBody = createSplitTransactionRequest({}, {
        projectId: undefined,
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([queriedCategory]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);
      mockTransactionDocumentConverter.functions.createSplitDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId.toString());
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [modifiedBody.splits[0].categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, []);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, modifiedBody.recipientId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument, {
        body: modifiedBody,
        categories: [queriedCategory],
        account: queriedAccount,
        projects: [],
        recipient: queriedRecipient,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(7);
    });

    it('if recipient is not given', async () => {
      const modifiedBody = createSplitTransactionRequest({
        recipientId: undefined,
      });
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([queriedCategory]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([queriedProject]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);
      mockTransactionDocumentConverter.functions.createSplitDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body: modifiedBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId.toString());
      validateFunctionCall(mockAccountService.functions.getAccountById, modifiedBody.accountId);
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [modifiedBody.splits[0].categoryId]);
      validateFunctionCall(mockProjectService.functions.listProjectsByIds, [modifiedBody.splits[0].projectId]);
      validateFunctionCall(mockRecipientService.functions.getRecipientById, undefined);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument, {
        body: modifiedBody,
        categories: [queriedCategory],
        account: queriedAccount,
        projects: [queriedProject],
        recipient: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(7);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(8);
    });

    it('if unable to query account', async () => {
      mockAccountService.functions.getAccountById.mockRejectedValue('this is a mongo error');
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
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(8);
    });

    it('if unable to query categories', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockRejectedValue('this is a mongo error');
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([
        queriedProject,
        queriedProject,
      ]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(8);
    });

    it('if unable to query projects', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        queriedCategory,
        queriedCategory,
      ]);
      mockProjectService.functions.listProjectsByIds.mockRejectedValue('this is a mongo error');
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(8);
    });

    it('if unable to query recipients', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(8);
    });

    it('if no account found', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(8);
    });

    it('if no categories found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([ ]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([
        queriedProject,
        queriedProject,
      ]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Some of the categories are not found', 400));
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(8);
    });

    it('if no projects found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        queriedCategory,
        queriedCategory,
      ]);
      mockProjectService.functions.listProjectsByIds.mockResolvedValue([]);
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedRecipient);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Some of the projects are not found', 400));
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(8);
    });

    it('if no recipient found', async () => {
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
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 400));
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(8);
    });

    it('if unable to save transaction', async () => {
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
      mockTransactionDocumentConverter.functions.createSplitDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving transaction', 500));
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createSplitDocument, {
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(8);
    });
  });
});

import { IDatabaseArchiveService, databaseArchiveServiceFactory } from '@household/api/functions/database-archive/database-archive.service';
import { createAccountDocument, createProjectDocument, createRecipientDocument, createPaymentTransactionDocument, createCategoryDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { IStorageService } from '@household/shared/services/storage-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { clear, advanceTo } from 'jest-date-mock';

describe('Database archive service', () => {
  let service: IDatabaseArchiveService;
  let mockAccountService: Mock<IAccountService>;
  let mockCategoryService: Mock<ICategoryService>;
  let mockRecipientService: Mock<IRecipientService>;
  let mockProjectService: Mock<IProjectService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockStorageService: Mock<IStorageService>;

  const now = new Date();
  const archiveBucket = 'bucket-name';

  beforeEach(() => {
    mockAccountService = createMockService('dumpAccounts');
    mockProjectService = createMockService('dumpProjects');
    mockCategoryService = createMockService('dumpCategories');
    mockRecipientService = createMockService('dumpRecipients');
    mockTransactionService = createMockService('dumpTransactions');
    mockStorageService = createMockService('writeFile');

    service = databaseArchiveServiceFactory(mockAccountService.service, mockProjectService.service, mockCategoryService.service, mockRecipientService.service, mockTransactionService.service, mockStorageService.service);

    advanceTo(now);
    process.env.DATABASE_ARCHIVE_BUCKET = archiveBucket;
  });

  afterEach(() => {
    clear();
    delete process.env.DATABASE_ARCHIVE_BUCKET;
  });

  const accounts = [createAccountDocument()];
  const projects = [createProjectDocument()];
  const categories = [createCategoryDocument()];
  const recipients = [createRecipientDocument()];
  const transactions = [createPaymentTransactionDocument()];

  it('should return if data is saved in s3', async () => {
    mockAccountService.functions.dumpAccounts.mockResolvedValue(accounts);
    mockProjectService.functions.dumpProjects.mockResolvedValue(projects);
    mockCategoryService.functions.dumpCategories.mockResolvedValue(categories);
    mockRecipientService.functions.dumpRecipients.mockResolvedValue(recipients);
    mockTransactionService.functions.dumpTransactions.mockResolvedValue(transactions);
    mockStorageService.functions.writeFile.mockResolvedValue(undefined);

    await service();
    expect(mockAccountService.functions.dumpAccounts).toHaveBeenCalled();
    expect(mockProjectService.functions.dumpProjects).toHaveBeenCalled();
    expect(mockCategoryService.functions.dumpCategories).toHaveBeenCalled();
    expect(mockRecipientService.functions.dumpRecipients).toHaveBeenCalled();
    expect(mockTransactionService.functions.dumpTransactions).toHaveBeenCalled();
    validateNthFunctionCall(mockStorageService.functions.writeFile, 1, archiveBucket, 'accounts.json', accounts, now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 2, archiveBucket, 'projects.json', projects, now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 3, archiveBucket, 'categories.json', categories, now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 4, archiveBucket, 'recipients.json', recipients, now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 5, archiveBucket, 'transactions.json', transactions, now.toISOString());
    expect.assertions(10);
  });

  describe('should throw error', () => {
    it('if unable to list accounts', async () => {
      mockAccountService.functions.dumpAccounts.mockRejectedValue({
        message: 'this is a mongo error',
      });
      mockProjectService.functions.dumpProjects.mockResolvedValue(projects);
      mockCategoryService.functions.dumpCategories.mockResolvedValue(categories);
      mockRecipientService.functions.dumpRecipients.mockResolvedValue(recipients);
      mockTransactionService.functions.dumpTransactions.mockResolvedValue(transactions);

      await service().catch(validateError('this is a mongo error'));
      expect(mockAccountService.functions.dumpAccounts).toHaveBeenCalled();
      expect(mockProjectService.functions.dumpProjects).toHaveBeenCalled();
      expect(mockCategoryService.functions.dumpCategories).toHaveBeenCalled();
      expect(mockRecipientService.functions.dumpRecipients).toHaveBeenCalled();
      expect(mockTransactionService.functions.dumpTransactions).toHaveBeenCalled();
      validateFunctionCall(mockStorageService.functions.writeFile);
      expect.assertions(7);
    });

    it('if unable to list projects', async () => {
      mockAccountService.functions.dumpAccounts.mockResolvedValue(accounts);
      mockProjectService.functions.dumpProjects.mockRejectedValue({
        message: 'this is a mongo error',
      });
      mockCategoryService.functions.dumpCategories.mockResolvedValue(categories);
      mockRecipientService.functions.dumpRecipients.mockResolvedValue(recipients);
      mockTransactionService.functions.dumpTransactions.mockResolvedValue(transactions);

      await service().catch(validateError('this is a mongo error'));
      expect(mockAccountService.functions.dumpAccounts).toHaveBeenCalled();
      expect(mockProjectService.functions.dumpProjects).toHaveBeenCalled();
      expect(mockCategoryService.functions.dumpCategories).toHaveBeenCalled();
      expect(mockRecipientService.functions.dumpRecipients).toHaveBeenCalled();
      expect(mockTransactionService.functions.dumpTransactions).toHaveBeenCalled();
      validateFunctionCall(mockStorageService.functions.writeFile);
      expect.assertions(7);
    });

    it('if unable to list categories', async () => {
      mockAccountService.functions.dumpAccounts.mockResolvedValue(accounts);
      mockProjectService.functions.dumpProjects.mockResolvedValue(projects);
      mockCategoryService.functions.dumpCategories.mockRejectedValue({
        message: 'this is a mongo error',
      });
      mockRecipientService.functions.dumpRecipients.mockResolvedValue(recipients);
      mockTransactionService.functions.dumpTransactions.mockResolvedValue(transactions);

      await service().catch(validateError('this is a mongo error'));
      expect(mockAccountService.functions.dumpAccounts).toHaveBeenCalled();
      expect(mockProjectService.functions.dumpProjects).toHaveBeenCalled();
      expect(mockCategoryService.functions.dumpCategories).toHaveBeenCalled();
      expect(mockRecipientService.functions.dumpRecipients).toHaveBeenCalled();
      expect(mockTransactionService.functions.dumpTransactions).toHaveBeenCalled();
      validateFunctionCall(mockStorageService.functions.writeFile);
      expect.assertions(7);
    });

    it('if unable to list recipients', async () => {
      mockAccountService.functions.dumpAccounts.mockResolvedValue(accounts);
      mockProjectService.functions.dumpProjects.mockResolvedValue(projects);
      mockCategoryService.functions.dumpCategories.mockResolvedValue(categories);
      mockRecipientService.functions.dumpRecipients.mockRejectedValue({
        message: 'this is a mongo error',
      });
      mockTransactionService.functions.dumpTransactions.mockResolvedValue(transactions);

      await service().catch(validateError('this is a mongo error'));
      expect(mockAccountService.functions.dumpAccounts).toHaveBeenCalled();
      expect(mockProjectService.functions.dumpProjects).toHaveBeenCalled();
      expect(mockCategoryService.functions.dumpCategories).toHaveBeenCalled();
      expect(mockRecipientService.functions.dumpRecipients).toHaveBeenCalled();
      expect(mockTransactionService.functions.dumpTransactions).toHaveBeenCalled();
      validateFunctionCall(mockStorageService.functions.writeFile);
      expect.assertions(7);
    });

    it('if unable to list transactions', async () => {
      mockAccountService.functions.dumpAccounts.mockResolvedValue(accounts);
      mockProjectService.functions.dumpProjects.mockResolvedValue(projects);
      mockCategoryService.functions.dumpCategories.mockResolvedValue(categories);
      mockRecipientService.functions.dumpRecipients.mockResolvedValue(recipients);
      mockTransactionService.functions.dumpTransactions.mockRejectedValue({
        message: 'this is a mongo error',
      });

      await service().catch(validateError('this is a mongo error'));
      expect(mockAccountService.functions.dumpAccounts).toHaveBeenCalled();
      expect(mockProjectService.functions.dumpProjects).toHaveBeenCalled();
      expect(mockCategoryService.functions.dumpCategories).toHaveBeenCalled();
      expect(mockRecipientService.functions.dumpRecipients).toHaveBeenCalled();
      expect(mockTransactionService.functions.dumpTransactions).toHaveBeenCalled();
      validateFunctionCall(mockStorageService.functions.writeFile);
      expect.assertions(7);
    });

    it('if unable to write accounts to s3', async () => {
      mockAccountService.functions.dumpAccounts.mockResolvedValue(accounts);
      mockProjectService.functions.dumpProjects.mockResolvedValue(projects);
      mockCategoryService.functions.dumpCategories.mockResolvedValue(categories);
      mockRecipientService.functions.dumpRecipients.mockResolvedValue(recipients);
      mockTransactionService.functions.dumpTransactions.mockResolvedValue(transactions);
      mockStorageService.functions.writeFile.mockRejectedValueOnce({
        message: 'this is an s3 error',
      });
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);

      await service().catch(validateError('this is an s3 error'));
      expect(mockAccountService.functions.dumpAccounts).toHaveBeenCalled();
      expect(mockProjectService.functions.dumpProjects).toHaveBeenCalled();
      expect(mockCategoryService.functions.dumpCategories).toHaveBeenCalled();
      expect(mockRecipientService.functions.dumpRecipients).toHaveBeenCalled();
      expect(mockTransactionService.functions.dumpTransactions).toHaveBeenCalled();
      validateNthFunctionCall(mockStorageService.functions.writeFile, 1, archiveBucket, 'accounts.json', accounts, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 2, archiveBucket, 'projects.json', projects, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 3, archiveBucket, 'categories.json', categories, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 4, archiveBucket, 'recipients.json', recipients, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 5, archiveBucket, 'transactions.json', transactions, now.toISOString());
      expect.assertions(11);
    });

    it('if unable to write projects to s3', async () => {
      mockAccountService.functions.dumpAccounts.mockResolvedValue(accounts);
      mockProjectService.functions.dumpProjects.mockResolvedValue(projects);
      mockCategoryService.functions.dumpCategories.mockResolvedValue(categories);
      mockRecipientService.functions.dumpRecipients.mockResolvedValue(recipients);
      mockTransactionService.functions.dumpTransactions.mockResolvedValue(transactions);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockRejectedValueOnce({
        message: 'this is an s3 error',
      });
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);

      await service().catch(validateError('this is an s3 error'));
      expect(mockAccountService.functions.dumpAccounts).toHaveBeenCalled();
      expect(mockProjectService.functions.dumpProjects).toHaveBeenCalled();
      expect(mockCategoryService.functions.dumpCategories).toHaveBeenCalled();
      expect(mockRecipientService.functions.dumpRecipients).toHaveBeenCalled();
      expect(mockTransactionService.functions.dumpTransactions).toHaveBeenCalled();
      validateNthFunctionCall(mockStorageService.functions.writeFile, 1, archiveBucket, 'accounts.json', accounts, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 2, archiveBucket, 'projects.json', projects, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 3, archiveBucket, 'categories.json', categories, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 4, archiveBucket, 'recipients.json', recipients, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 5, archiveBucket, 'transactions.json', transactions, now.toISOString());
      expect.assertions(11);
    });

    it('if unable to write categories to s3', async () => {
      mockAccountService.functions.dumpAccounts.mockResolvedValue(accounts);
      mockProjectService.functions.dumpProjects.mockResolvedValue(projects);
      mockCategoryService.functions.dumpCategories.mockResolvedValue(categories);
      mockRecipientService.functions.dumpRecipients.mockResolvedValue(recipients);
      mockTransactionService.functions.dumpTransactions.mockResolvedValue(transactions);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockRejectedValueOnce({
        message: 'this is an s3 error',
      });
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);

      await service().catch(validateError('this is an s3 error'));
      expect(mockAccountService.functions.dumpAccounts).toHaveBeenCalled();
      expect(mockProjectService.functions.dumpProjects).toHaveBeenCalled();
      expect(mockCategoryService.functions.dumpCategories).toHaveBeenCalled();
      expect(mockRecipientService.functions.dumpRecipients).toHaveBeenCalled();
      expect(mockTransactionService.functions.dumpTransactions).toHaveBeenCalled();
      validateNthFunctionCall(mockStorageService.functions.writeFile, 1, archiveBucket, 'accounts.json', accounts, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 2, archiveBucket, 'projects.json', projects, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 3, archiveBucket, 'categories.json', categories, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 4, archiveBucket, 'recipients.json', recipients, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 5, archiveBucket, 'transactions.json', transactions, now.toISOString());
      expect.assertions(11);
    });

    it('if unable to write recipients to s3', async () => {
      mockAccountService.functions.dumpAccounts.mockResolvedValue(accounts);
      mockProjectService.functions.dumpProjects.mockResolvedValue(projects);
      mockCategoryService.functions.dumpCategories.mockResolvedValue(categories);
      mockRecipientService.functions.dumpRecipients.mockResolvedValue(recipients);
      mockTransactionService.functions.dumpTransactions.mockResolvedValue(transactions);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockRejectedValueOnce({
        message: 'this is an s3 error',
      });
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);

      await service().catch(validateError('this is an s3 error'));
      expect(mockAccountService.functions.dumpAccounts).toHaveBeenCalled();
      expect(mockProjectService.functions.dumpProjects).toHaveBeenCalled();
      expect(mockCategoryService.functions.dumpCategories).toHaveBeenCalled();
      expect(mockRecipientService.functions.dumpRecipients).toHaveBeenCalled();
      expect(mockTransactionService.functions.dumpTransactions).toHaveBeenCalled();
      validateNthFunctionCall(mockStorageService.functions.writeFile, 1, archiveBucket, 'accounts.json', accounts, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 2, archiveBucket, 'projects.json', projects, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 3, archiveBucket, 'categories.json', categories, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 4, archiveBucket, 'recipients.json', recipients, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 5, archiveBucket, 'transactions.json', transactions, now.toISOString());
      expect.assertions(11);
    });

    it('if unable to write transactions to s3', async () => {
      mockAccountService.functions.dumpAccounts.mockResolvedValue(accounts);
      mockProjectService.functions.dumpProjects.mockResolvedValue(projects);
      mockCategoryService.functions.dumpCategories.mockResolvedValue(categories);
      mockRecipientService.functions.dumpRecipients.mockResolvedValue(recipients);
      mockTransactionService.functions.dumpTransactions.mockResolvedValue(transactions);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockResolvedValueOnce(undefined);
      mockStorageService.functions.writeFile.mockRejectedValueOnce({
        message: 'this is an s3 error',
      });

      await service().catch(validateError('this is an s3 error'));
      expect(mockAccountService.functions.dumpAccounts).toHaveBeenCalled();
      expect(mockProjectService.functions.dumpProjects).toHaveBeenCalled();
      expect(mockCategoryService.functions.dumpCategories).toHaveBeenCalled();
      expect(mockRecipientService.functions.dumpRecipients).toHaveBeenCalled();
      expect(mockTransactionService.functions.dumpTransactions).toHaveBeenCalled();
      validateNthFunctionCall(mockStorageService.functions.writeFile, 1, archiveBucket, 'accounts.json', accounts, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 2, archiveBucket, 'projects.json', projects, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 3, archiveBucket, 'categories.json', categories, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 4, archiveBucket, 'recipients.json', recipients, now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 5, archiveBucket, 'transactions.json', transactions, now.toISOString());
      expect.assertions(11);
    });
  });
});

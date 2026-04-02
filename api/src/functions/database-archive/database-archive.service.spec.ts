import { IDatabaseArchiveService, databaseArchiveServiceFactory } from '@household/api/functions/database-archive/database-archive.service';
import { createAccountDocument, createProjectDocument, createRecipientDocument, createPaymentTransactionDocument, createCategoryDocument, createProductDocument, createSettingDocument, createFileDocument, testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { IStorageService } from '@household/shared/services/storage-service';

describe('Database archive service', () => {
  let service: IDatabaseArchiveService;
  let mockMongodbService: MockService<IMongodbService>;
  let mockStorageService: MockService<IStorageService>;

  const now = new Date();

  beforeEach(() => {
    mockMongodbService = createMockService('dump');
    mockStorageService = createMockService('writeFile');

    service = databaseArchiveServiceFactory(mockMongodbService.service, mockStorageService.service);
    vi.useFakeTimers().setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const accounts = [createAccountDocument()];
  const projects = [createProjectDocument()];
  const categories = [createCategoryDocument()];
  const recipients = [createRecipientDocument()];
  const transactions = [createPaymentTransactionDocument()];
  const products = [createProductDocument()];
  const settings = [createSettingDocument()];
  const files = [createFileDocument()];
  const customers = [testDataFactory.customer.document()];
  const calendarDays = [testDataFactory.calendar.day.document()];
  const calendarEntries = [testDataFactory.calendar.entry.document()];
  const prices = [testDataFactory.price.document()];

  it('should return if data is saved in s3', async () => {
    mockMongodbService.functions.dump.mockResolvedValue({
      accounts,
      projects,
      calendarDays,
      calendarEntries,
      categories,
      customers,
      files,
      prices,
      products,
      recipients,
      settings,
      transactions,
    });
    mockStorageService.functions.writeFile.mockResolvedValue(undefined);

    await service();
    expect(mockMongodbService.functions.dump).toHaveBeenCalled();
    validateNthFunctionCall(mockStorageService.functions.writeFile, 1, 'accounts.json', JSON.stringify(accounts), now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 2, 'projects.json', JSON.stringify(projects), now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 3, 'calendarDays.json', JSON.stringify(calendarDays), now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 4, 'calendarEntries.json', JSON.stringify(calendarEntries), now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 5, 'categories.json', JSON.stringify(categories), now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 6, 'customers.json', JSON.stringify(customers), now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 7, 'files.json', JSON.stringify(files), now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 8, 'prices.json', JSON.stringify(prices), now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 9, 'products.json', JSON.stringify(products), now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 10, 'recipients.json', JSON.stringify(recipients), now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 11, 'settings.json', JSON.stringify(settings), now.toISOString());
    validateNthFunctionCall(mockStorageService.functions.writeFile, 12, 'transactions.json', JSON.stringify(transactions), now.toISOString());
    expect.assertions(13);
  });

  describe('should throw error', () => {
    it('if unable to dump data', async () => {
      mockMongodbService.functions.dump.mockRejectedValue({
        message: 'this is a mongo error',
      });
      mockStorageService.functions.writeFile.mockResolvedValue(undefined);

      await service().catch(validateError('this is a mongo error'));
      expect(mockMongodbService.functions.dump).toHaveBeenCalled();
      validateFunctionCall(mockStorageService.functions.writeFile);
      expect.assertions(3);
    });

    it('if unable to write to s3', async () => {
      mockMongodbService.functions.dump.mockResolvedValue({
        accounts,
        projects,
        calendarDays,
        calendarEntries,
        categories,
        customers,
        files,
        prices,
        products,
        recipients,
        settings,
        transactions,
      });
      mockStorageService.functions.writeFile.mockRejectedValue({
        message: 'this is an s3 error',
      });

      await service().catch(validateError('this is an s3 error'));
      expect(mockMongodbService.functions.dump).toHaveBeenCalled();
      validateNthFunctionCall(mockStorageService.functions.writeFile, 1, 'accounts.json', JSON.stringify(accounts), now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 2, 'projects.json', JSON.stringify(projects), now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 3, 'calendarDays.json', JSON.stringify(calendarDays), now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 4, 'calendarEntries.json', JSON.stringify(calendarEntries), now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 5, 'categories.json', JSON.stringify(categories), now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 6, 'customers.json', JSON.stringify(customers), now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 7, 'files.json', JSON.stringify(files), now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 8, 'prices.json', JSON.stringify(prices), now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 9, 'products.json', JSON.stringify(products), now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 10, 'recipients.json', JSON.stringify(recipients), now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 11, 'settings.json', JSON.stringify(settings), now.toISOString());
      validateNthFunctionCall(mockStorageService.functions.writeFile, 12, 'transactions.json', JSON.stringify(transactions), now.toISOString());
      expect.assertions(14);
    });
  });
});

import { IResolveCalendarWorkEntryService, resolveCalendarWorkEntryServiceFactory } from '@household/api/functions/resolve-calendar-work-entry/resolve-calendar-work-entry.service';
import { createAccountDocument, createCategoryDocument, createDocumentUpdate, createPaymentTransactionDocument, createSettingDocument, testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getCategoryId, getTransactionId } from '@household/shared/common/utils';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { IPaymentTransactionDocumentConverter } from '@household/shared/converters/payment-transaction-document-converter';
import { CalendarEntryResolutionStatus, CalendarEntryType, SettingKey } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { ISettingService } from '@household/shared/services/setting-service';

describe('Resolve calendar work entry service', () => {
  let service: IResolveCalendarWorkEntryService;
  let mockCalendarEntryService: MockService<ICalendarEntryService>;
  let mockPaymentTransactionDocumentConverter: MockService<IPaymentTransactionDocumentConverter>;
  let mockSettingService: MockService<ISettingService>;
  let mockAccountService: MockService<IAccountService>;
  let mockCategoryService: MockService<ICategoryService>;
  let mockCalendarEntryDocumentConverter: MockService<ICalendarEntryDocumentConverter>;

  beforeEach(() => {
    mockCalendarEntryService = createMockService('findCalendarEntryById', 'updateCalendarEntry', 'updateCalendarEntryWithPayment');
    mockPaymentTransactionDocumentConverter = createMockService('createFromEntry');
    mockSettingService = createMockService('listSettingsByKeys');
    mockAccountService = createMockService('findAccountById');
    mockCategoryService = createMockService('findCategoryById');
    mockCalendarEntryDocumentConverter = createMockService('resolve');

    service = resolveCalendarWorkEntryServiceFactory(mockCalendarEntryService.service, mockPaymentTransactionDocumentConverter.service, mockSettingService.service, mockAccountService.service, mockCategoryService.service, mockCalendarEntryDocumentConverter.service);
  });
  const expiresIn = 3600;
  const calendarEntryId = testDataFactory.calendar.entry.id();
  const queriedCalendarEntry = testDataFactory.calendar.entry.document({
    entryType: CalendarEntryType.Work,
  });
  const documentUpdate = createDocumentUpdate();
  
  describe('payment type is transfer', () => {
    const body = testDataFactory.calendar.entry.resolution.request({
      status: CalendarEntryResolutionStatus.PendingTransfer,
    });

    it('should return', async () => {
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarEntry);
      mockCalendarEntryDocumentConverter.functions.resolve.mockReturnValue(documentUpdate);
      mockCalendarEntryService.functions.updateCalendarEntry.mockResolvedValue(undefined);
  
      const result = await service({
        body,
        calendarEntryId,
        expiresIn,
      });
      expect(result).toEqual(undefined);
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      expect(mockCalendarEntryDocumentConverter.functions.resolve).toHaveBeenCalled();
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry, calendarEntryId, documentUpdate);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntryWithPayment);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.createFromEntry);
      validateFunctionCall(mockSettingService.functions.listSettingsByKeys);
      validateFunctionCall(mockAccountService.functions.findAccountById);
      validateFunctionCall(mockCategoryService.functions.findCategoryById);
      expect.assertions(9);
    });

    describe('should throw error', () => {
      it('if unable to get document', async () => {
        mockCalendarEntryService.functions.findCalendarEntryById.mockRejectedValue('this is a mongo error');
  
        await service({
          body,
          calendarEntryId,
          expiresIn,
        }).catch(validateError('Error while getting calendar entry', 500));
        validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.resolve);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntryWithPayment);
        validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.createFromEntry);
        validateFunctionCall(mockSettingService.functions.listSettingsByKeys);
        validateFunctionCall(mockAccountService.functions.findAccountById);
        validateFunctionCall(mockCategoryService.functions.findCategoryById);
        expect.assertions(10);
      });

      it('if calendar entry not found', async () => {
        mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(undefined);
  
        await service({
          body,
          calendarEntryId,
          expiresIn,
        }).catch(validateError('No calendar entry found', 404));
        validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.resolve);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntryWithPayment);
        validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.createFromEntry);
        validateFunctionCall(mockSettingService.functions.listSettingsByKeys);
        validateFunctionCall(mockAccountService.functions.findAccountById);
        validateFunctionCall(mockCategoryService.functions.findCategoryById);
        expect.assertions(10);
      });

      it('if calendar entry is not work type', async () => {
        mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue({
          ...queriedCalendarEntry,
          entryType: CalendarEntryType.Personal,
        });
  
        await service({
          body,
          calendarEntryId,
          expiresIn,
        }).catch(validateError('Calendar entry must be of "work" type', 400));
        validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.resolve);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntryWithPayment);
        validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.createFromEntry);
        validateFunctionCall(mockSettingService.functions.listSettingsByKeys);
        validateFunctionCall(mockAccountService.functions.findAccountById);
        validateFunctionCall(mockCategoryService.functions.findCategoryById);
        expect.assertions(10);
      });

      it('if calendar entry is already resolved', async () => {
        mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue({
          ...queriedCalendarEntry,
          resolution: {
            status: CalendarEntryResolutionStatus.Paid,
            delay: undefined,
          },
        });
  
        await service({
          body,
          calendarEntryId,
          expiresIn,
        }).catch(validateError('Calendar entry is already resolved', 400));
        validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.resolve);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntryWithPayment);
        validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.createFromEntry);
        validateFunctionCall(mockSettingService.functions.listSettingsByKeys);
        validateFunctionCall(mockAccountService.functions.findAccountById);
        validateFunctionCall(mockCategoryService.functions.findCategoryById);
        expect.assertions(10);
      });

      it('if unable to update document', async () => {
        mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarEntry);
        mockCalendarEntryDocumentConverter.functions.resolve.mockReturnValue(documentUpdate);
        mockCalendarEntryService.functions.updateCalendarEntry.mockRejectedValue('this is a mongo error');
  
        await service({
          body,
          calendarEntryId,
          expiresIn,
        }).catch(validateError('Error while updating calendar entry', 500));
        validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
        expect(mockCalendarEntryDocumentConverter.functions.resolve).toHaveBeenCalled();
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry, calendarEntryId, documentUpdate);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntryWithPayment);
        validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.createFromEntry);
        validateFunctionCall(mockSettingService.functions.listSettingsByKeys);
        validateFunctionCall(mockAccountService.functions.findAccountById);
        validateFunctionCall(mockCategoryService.functions.findCategoryById);
        expect.assertions(10);
      });
    });
  });

  describe('payment type is cash', () => {
    const amount = 5000;
    const body = testDataFactory.calendar.entry.resolution.request({
      status: CalendarEntryResolutionStatus.Paid,
      amount,
    });
    const queriedAccount = createAccountDocument();
    const accountId = getAccountId(queriedAccount);
    const queriedCategory = createCategoryDocument();
    const categoryId = getCategoryId(queriedCategory);
    const paymentTransactionDocument = createPaymentTransactionDocument();
    
    it('should return transaction Id', async () => {
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarEntry);
      mockSettingService.functions.listSettingsByKeys.mockResolvedValue([
        createSettingDocument({
          settingKey: SettingKey.HairdressingIncomeAccount,
          value: accountId,
        }),
        createSettingDocument({
          settingKey: SettingKey.HairdressingIncomeCategory,
          value: categoryId,
        }),
      ]);
      mockAccountService.functions.findAccountById.mockResolvedValue(queriedAccount);
      mockCategoryService.functions.findCategoryById.mockResolvedValue(queriedCategory);
      mockPaymentTransactionDocumentConverter.functions.createFromEntry.mockReturnValue(paymentTransactionDocument);
      mockCalendarEntryDocumentConverter.functions.resolve.mockReturnValue(documentUpdate);
      mockCalendarEntryService.functions.updateCalendarEntryWithPayment.mockResolvedValue(paymentTransactionDocument);

      const result = await service({
        body,
        calendarEntryId,
        expiresIn,
      });
      expect(result).toEqual(getTransactionId(paymentTransactionDocument));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.resolve, {
        body,
        transaction: paymentTransactionDocument,
      }, expiresIn);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntryWithPayment, calendarEntryId, documentUpdate);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.createFromEntry, {
        account: queriedAccount,
        calendarEntry: queriedCalendarEntry,
        category: queriedCategory,
        amount,
      }, expiresIn);
      validateFunctionCall(mockSettingService.functions.listSettingsByKeys, SettingKey.HairdressingIncomeAccount, SettingKey.HairdressingIncomeCategory);
      validateFunctionCall(mockAccountService.functions.findAccountById, accountId);
      validateFunctionCall(mockCategoryService.functions.findCategoryById, categoryId);
      expect.assertions(9);
    });

    describe('should throw error', () => {
      it('if unable to get settings', async () => {
        mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarEntry);
        mockSettingService.functions.listSettingsByKeys.mockRejectedValue('this is a mongo error');

        await service({
          body,
          calendarEntryId,
          expiresIn,
        }).catch(validateError('Error while listing settings', 500));
        validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.resolve);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntryWithPayment);
        validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.createFromEntry);
        validateFunctionCall(mockSettingService.functions.listSettingsByKeys, SettingKey.HairdressingIncomeAccount, SettingKey.HairdressingIncomeCategory);
        validateFunctionCall(mockAccountService.functions.findAccountById);
        validateFunctionCall(mockCategoryService.functions.findCategoryById);
        expect.assertions(10);
      });

      it('if unable to get account', async () => {
        mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarEntry);
        mockSettingService.functions.listSettingsByKeys.mockResolvedValue([
          createSettingDocument({
            settingKey: SettingKey.HairdressingIncomeAccount,
            value: accountId,
          }),
          createSettingDocument({
            settingKey: SettingKey.HairdressingIncomeCategory,
            value: categoryId,
          }),
        ]);
        mockAccountService.functions.findAccountById.mockRejectedValue('this is a mongo error');
        mockCategoryService.functions.findCategoryById.mockResolvedValue(queriedCategory);

        await service({
          body,
          calendarEntryId,
          expiresIn,
        }).catch(validateError('Error while getting account', 500));
        validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.resolve);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntryWithPayment);
        validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.createFromEntry);
        validateFunctionCall(mockSettingService.functions.listSettingsByKeys, SettingKey.HairdressingIncomeAccount, SettingKey.HairdressingIncomeCategory);
        validateFunctionCall(mockAccountService.functions.findAccountById, accountId);
        validateFunctionCall(mockCategoryService.functions.findCategoryById, categoryId);
        expect.assertions(10);
      });

      it('if unable to get category', async () => {
        mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarEntry);
        mockSettingService.functions.listSettingsByKeys.mockResolvedValue([
          createSettingDocument({
            settingKey: SettingKey.HairdressingIncomeAccount,
            value: accountId,
          }),
          createSettingDocument({
            settingKey: SettingKey.HairdressingIncomeCategory,
            value: categoryId,
          }),
        ]);
        mockAccountService.functions.findAccountById.mockResolvedValue(queriedAccount);
        mockCategoryService.functions.findCategoryById.mockRejectedValue('this is a mongo error');

        await service({
          body,
          calendarEntryId,
          expiresIn,
        }).catch(validateError('Error while getting category', 500));
        validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.resolve);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntryWithPayment);
        validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.createFromEntry);
        validateFunctionCall(mockSettingService.functions.listSettingsByKeys, SettingKey.HairdressingIncomeAccount, SettingKey.HairdressingIncomeCategory);
        validateFunctionCall(mockAccountService.functions.findAccountById, accountId);
        validateFunctionCall(mockCategoryService.functions.findCategoryById, categoryId);
        expect.assertions(10);
      });

      it('if unable to update calendar entry', async () => {
        mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarEntry);
        mockSettingService.functions.listSettingsByKeys.mockResolvedValue([
          createSettingDocument({
            settingKey: SettingKey.HairdressingIncomeAccount,
            value: accountId,
          }),
          createSettingDocument({
            settingKey: SettingKey.HairdressingIncomeCategory,
            value: categoryId,
          }),
        ]);
        mockAccountService.functions.findAccountById.mockResolvedValue(queriedAccount);
        mockCategoryService.functions.findCategoryById.mockResolvedValue(queriedCategory);
        mockPaymentTransactionDocumentConverter.functions.createFromEntry.mockReturnValue(paymentTransactionDocument);
        mockCalendarEntryDocumentConverter.functions.resolve.mockReturnValue(documentUpdate);
        mockCalendarEntryService.functions.updateCalendarEntryWithPayment.mockRejectedValue('this is a mongo error');

        await service({
          body,
          calendarEntryId,
          expiresIn,
        }).catch(validateError('Error while updating calendar entry with payment', 500));
        validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.resolve, {
          body,
          transaction: paymentTransactionDocument,
        }, expiresIn);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
        validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntryWithPayment, calendarEntryId, documentUpdate);
        validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.createFromEntry, {
          account: queriedAccount,
          calendarEntry: queriedCalendarEntry,
          category: queriedCategory,
          amount,
        }, expiresIn);
        validateFunctionCall(mockSettingService.functions.listSettingsByKeys, SettingKey.HairdressingIncomeAccount, SettingKey.HairdressingIncomeCategory);
        validateFunctionCall(mockAccountService.functions.findAccountById, accountId);
        validateFunctionCall(mockCategoryService.functions.findCategoryById, categoryId);
        expect.assertions(10);
      });
    });
  });
});


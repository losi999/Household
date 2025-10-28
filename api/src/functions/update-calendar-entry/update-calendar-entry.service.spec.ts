import { IUpdateCalendarEntryService, updateCalendarEntryServiceFactory } from '@household/api/functions/update-calendar-entry/update-calendar-entry.service';
import { calendarEntryDataFactory, createDocumentUpdate2, customerDataFactory, testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCustomerId, getPriceId } from '@household/shared/common/utils';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';
import { IPriceService } from '@household/shared/services/price-service';

describe('Update calendar entry service', () => {
  let service: IUpdateCalendarEntryService;
  let mockCalendarEntryService: Mock<ICalendarEntryService>;
  let mockCalendarEntryDocumentConverter: Mock<ICalendarEntryDocumentConverter>;
  let mockCustomerService: Mock<ICustomerService>;
  let mockPriceService: Mock<IPriceService>;

  beforeEach(() => {
    mockCalendarEntryService = createMockService('findCalendarEntryById', 'updateCalendarEntry');
    mockCalendarEntryDocumentConverter = createMockService('update');
    mockCustomerService = createMockService('findCustomerById');
    mockPriceService = createMockService('findPricesByIds');

    service = updateCalendarEntryServiceFactory(mockCalendarEntryService.service, mockCalendarEntryDocumentConverter.service, mockCustomerService.service, mockPriceService.service);
  });

  const calendarEntryId = calendarEntryDataFactory.id();
  const queriedCalendarIssueEntry = calendarEntryDataFactory.document({
    entryType: CalendarEntryType.Issue,
  });
  const queriedCalendarPersonalEntry = calendarEntryDataFactory.document({
    entryType: CalendarEntryType.Personal,
  });
  const queriedCalendarWorkEntry = calendarEntryDataFactory.document({
    entryType: CalendarEntryType.Work,
  });

  const updateQuery = createDocumentUpdate2();

  it('should return if personal entry is updated', async () => {
    const body = calendarEntryDataFactory.personalRequest();
    mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarPersonalEntry);
    mockCalendarEntryDocumentConverter.functions.update.mockReturnValue(updateQuery);
    mockCalendarEntryService.functions.updateCalendarEntry.mockResolvedValue(undefined);

    await service({
      calendarEntryId,
      body,
      expiresIn: undefined,
    });
    validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
    validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update, {
      body,
    }, undefined);
    validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry, calendarEntryId, updateQuery);
    validateFunctionCall(mockCustomerService.functions.findCustomerById);
    validateFunctionCall(mockPriceService.functions.findPricesByIds);
    expect.assertions(5);
  });

  it('should return if issue entry is updated', async () => {
    const body = calendarEntryDataFactory.issueRequest();
    mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarIssueEntry);
    mockCalendarEntryDocumentConverter.functions.update.mockReturnValue(updateQuery);
    mockCalendarEntryService.functions.updateCalendarEntry.mockResolvedValue(undefined);

    await service({
      calendarEntryId,
      body,
      expiresIn: undefined,
    });
    validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
    validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update, {
      body,
    }, undefined);
    validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry, calendarEntryId, updateQuery);
    validateFunctionCall(mockCustomerService.functions.findCustomerById);
    validateFunctionCall(mockPriceService.functions.findPricesByIds);
    expect.assertions(5);
  });

  it('should return if work entry is updated', async () => {
    const queriedCustomer = customerDataFactory.document();
    const customerId = getCustomerId(queriedCustomer);
    const queriedPrice = testDataFactory.price.document();
    const priceId = getPriceId(queriedPrice);

    const body = calendarEntryDataFactory.workRequest({
      customerId,
      prices: [
        {
          priceId,
          quantity: 1,
        },
      ],
    });
    mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarWorkEntry);
    mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
    mockPriceService.functions.findPricesByIds.mockResolvedValue([queriedPrice]);
    mockCalendarEntryDocumentConverter.functions.update.mockReturnValue(updateQuery);
    mockCalendarEntryService.functions.updateCalendarEntry.mockResolvedValue(undefined);

    await service({
      calendarEntryId,
      body,
      expiresIn: undefined,
    });
    validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
    validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update, {
      body,
      customer: queriedCustomer,
      prices: [queriedPrice],
    }, undefined);
    validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry, calendarEntryId, updateQuery);
    validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
    validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
    expect.assertions(5);
  });

  describe('should throw error', () => {
    it('if unable to query calendar entry', async () => {
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = calendarEntryDataFactory.workRequest({
        customerId,
        prices: [
          {
            priceId,
            quantity: 1,
          },
        ],
      });
      mockCalendarEntryService.functions.findCalendarEntryById.mockRejectedValue('this is a mongo error');

      await service({
        calendarEntryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while getting calendar entry', 500));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      expect.assertions(7);
    });

    it('if calendar entry not found', async () => {
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = calendarEntryDataFactory.workRequest({
        customerId,
        prices: [
          {
            priceId,
            quantity: 1,
          },
        ],
      });
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(undefined);

      await service({
        calendarEntryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('No calendar entry found', 404));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      expect.assertions(7);
    });

    it('if calendar entry type is about to be changed', async () => {
      const body = calendarEntryDataFactory.personalRequest();
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarWorkEntry);

      await service({
        calendarEntryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Entry type cannot be changed', 400));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      expect.assertions(7);
    });

    it('if calendar entry is already paid', async () => {
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = calendarEntryDataFactory.workRequest({
        customerId,
        prices: [
          {
            priceId,
            quantity: 1,
          },
        ],
      });
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue({
        ...queriedCalendarWorkEntry,
        resolution: {
          status: CalendarEntryResolutionStatus.Paid,
          delay: undefined,
        },
      });

      await service({
        calendarEntryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Calendar entry is already resolved', 400));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      expect.assertions(7);
    });

    it('if unable to query customer', async () => {
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = calendarEntryDataFactory.workRequest({
        customerId,
        prices: [
          {
            priceId,
            quantity: 1,
          },
        ],
      });
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarWorkEntry);
      mockCustomerService.functions.findCustomerById.mockRejectedValue('this is a mongo error');

      await service({
        calendarEntryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while getting customer', 500));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      expect.assertions(7);
    });

    it('if customer not found', async () => {
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = calendarEntryDataFactory.workRequest({
        customerId,
        prices: [
          {
            priceId,
            quantity: 1,
          },
        ],
      });
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarWorkEntry);
      mockCustomerService.functions.findCustomerById.mockResolvedValue(undefined);

      await service({
        calendarEntryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('No customer found', 400));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      expect.assertions(7);
    });

    it('if unable to query prices', async () => {
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = calendarEntryDataFactory.workRequest({
        customerId,
        prices: [
          {
            priceId,
            quantity: 1,
          },
        ],
      });
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarWorkEntry);
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
      mockPriceService.functions.findPricesByIds.mockRejectedValue('this is a mongo error');

      await service({
        calendarEntryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while listing prices by ids', 500));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
      expect.assertions(7);
    });

    it('if some of the prices are not found', async () => {
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = calendarEntryDataFactory.workRequest({
        customerId,
        prices: [
          {
            priceId,
            quantity: 1,
          },
        ],
      });
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarWorkEntry);
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
      mockPriceService.functions.findPricesByIds.mockResolvedValue([]);

      await service({
        calendarEntryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Some of the prices are not found', 400));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
      expect.assertions(7);
    });

    it('if unable to update calendar entry', async () => {
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = calendarEntryDataFactory.workRequest({
        customerId,
        prices: [
          {
            priceId,
            quantity: 1,
          },
        ],
      });
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarWorkEntry);
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
      mockPriceService.functions.findPricesByIds.mockResolvedValue([queriedPrice]);
      mockCalendarEntryDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockCalendarEntryService.functions.updateCalendarEntry.mockRejectedValue('this is a mongo error');

      await service({
        calendarEntryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while updating calendar entry', 500));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.update, {
        body,
        customer: queriedCustomer,
        prices: [queriedPrice],
      }, undefined);
      validateFunctionCall(mockCalendarEntryService.functions.updateCalendarEntry, calendarEntryId, updateQuery);
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
      expect.assertions(7);
    });
  });
});

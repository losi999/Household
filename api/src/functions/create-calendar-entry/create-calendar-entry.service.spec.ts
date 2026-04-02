import { ICreateCalendarEntryService, createCalendarEntryServiceFactory } from '@household/api/functions/create-calendar-entry/create-calendar-entry.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCalendarEntryId, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';
import { IPriceService } from '@household/shared/services/price-service';

describe('Create calendar entry service', () => {
  let service: ICreateCalendarEntryService;
  let mockCalendarEntryService: MockService<ICalendarEntryService>;
  let mockCalendarEntryDocumentConverter: MockService<ICalendarEntryDocumentConverter>;
  let mockCustomerService: MockService<ICustomerService>;
  let mockPriceService: MockService<IPriceService>;
  
  beforeEach(() => {
    mockCalendarEntryService = createMockService('saveCalendarEntry');
    mockCalendarEntryDocumentConverter = createMockService('create');
    mockCustomerService = createMockService('findCustomerById');
    mockPriceService = createMockService('findPricesByIds');

    service = createCalendarEntryServiceFactory(mockCalendarEntryService.service, mockCalendarEntryDocumentConverter.service, mockCustomerService.service, mockPriceService.service);
  });

  const convertedCalendarEntryDocument = testDataFactory.calendar.entry.document();
  const calendarEntryId = getCalendarEntryId(convertedCalendarEntryDocument);

  it('should return new id if personal entry is created', async () => {
    const body = testDataFactory.calendar.entry.request.personal();
    mockCalendarEntryDocumentConverter.functions.create.mockReturnValue(convertedCalendarEntryDocument);
    mockCalendarEntryService.functions.saveCalendarEntry.mockResolvedValue(convertedCalendarEntryDocument);

    const result = await service({
      body,
      expiresIn: undefined,
    });
    expect(result).toEqual(calendarEntryId.toString()),
    validateFunctionCall(mockCalendarEntryDocumentConverter.functions.create, {
      body,
    }, undefined);
    validateFunctionCall(mockCalendarEntryService.functions.saveCalendarEntry, convertedCalendarEntryDocument);
    validateFunctionCall(mockCustomerService.functions.findCustomerById);
    validateFunctionCall(mockPriceService.functions.findPricesByIds);
    expect.assertions(5);
  });

  it('should return new id if issue entry is created', async () => {
    const body = testDataFactory.calendar.entry.request.issue();
    mockCalendarEntryDocumentConverter.functions.create.mockReturnValue(convertedCalendarEntryDocument);
    mockCalendarEntryService.functions.saveCalendarEntry.mockResolvedValue(convertedCalendarEntryDocument);

    const result = await service({
      body,
      expiresIn: undefined,
    });
    expect(result).toEqual(calendarEntryId.toString()),
    validateFunctionCall(mockCalendarEntryDocumentConverter.functions.create, {
      body,
    }, undefined);
    validateFunctionCall(mockCalendarEntryService.functions.saveCalendarEntry, convertedCalendarEntryDocument);
    validateFunctionCall(mockCustomerService.functions.findCustomerById);
    validateFunctionCall(mockPriceService.functions.findPricesByIds);
    expect.assertions(5);
  });

  it('should return new id if work entry is created', async () => {
    const queriedCustomer = testDataFactory.customer.document();
    const customerId = getCustomerId(queriedCustomer);
    const queriedPrice = testDataFactory.price.document();
    const priceId = getPriceId(queriedPrice);

    const body = testDataFactory.calendar.entry.request.work({
      body: {
        customerId,
      },
      prices: {
        listed: [
          {
            priceId,
            quantity: 1,
          },
        ],
      }, 
    });
    mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
    mockPriceService.functions.findPricesByIds.mockResolvedValue([queriedPrice]);
    mockCalendarEntryDocumentConverter.functions.create.mockReturnValue(convertedCalendarEntryDocument);
    mockCalendarEntryService.functions.saveCalendarEntry.mockResolvedValue(convertedCalendarEntryDocument);

    const result = await service({
      body,
      expiresIn: undefined,
    });
    expect(result).toEqual(calendarEntryId.toString()),
    validateFunctionCall(mockCalendarEntryDocumentConverter.functions.create, {
      body,
      customer: queriedCustomer,
      prices: [queriedPrice],
    }, undefined);
    validateFunctionCall(mockCalendarEntryService.functions.saveCalendarEntry, convertedCalendarEntryDocument);
    validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
    validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
    expect.assertions(5);
  });
  
  describe('should throw error', () => {
    it('if unable to query customer', async () => {
      const queriedCustomer = testDataFactory.customer.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = testDataFactory.calendar.entry.request.work({
        body: {
          customerId,
        },
        prices: {
          listed: [
            {
              priceId,
              quantity: 1,
            },
          ],
        }, 
      });
      mockCustomerService.functions.findCustomerById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while getting customer', 500));
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.create);
      validateFunctionCall(mockCalendarEntryService.functions.saveCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      expect.assertions(6);
    });

    it('if customer not found', async () => {
      const queriedCustomer = testDataFactory.customer.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = testDataFactory.calendar.entry.request.work({
        body: {
          customerId,
        },
        prices: {
          listed: [
            {
              priceId,
              quantity: 1,
            },
          ],
        }, 
      });
      mockCustomerService.functions.findCustomerById.mockResolvedValue(undefined);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No customer found', 400));
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.create);
      validateFunctionCall(mockCalendarEntryService.functions.saveCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      expect.assertions(6);
    });

    it('if unable to query prices', async () => {
      const queriedCustomer = testDataFactory.customer.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = testDataFactory.calendar.entry.request.work({
        body: {
          customerId,
        },
        prices: {
          listed: [
            {
              priceId,
              quantity: 1,
            },
          ],
        }, 
      });
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
      mockPriceService.functions.findPricesByIds.mockRejectedValue('this is a mongo error');
      
      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while listing prices by ids', 500));
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.create);
      validateFunctionCall(mockCalendarEntryService.functions.saveCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
      expect.assertions(6);
    });

    it('if some of the prices are not found', async () => {
      const queriedCustomer = testDataFactory.customer.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = testDataFactory.calendar.entry.request.work({
        body: {
          customerId,
        },
        prices: {
          listed: [
            {
              priceId,
              quantity: 1,
            },
          ],
        }, 
      });
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
      mockPriceService.functions.findPricesByIds.mockResolvedValue([]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Some of the prices are not found', 400));
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.create);
      validateFunctionCall(mockCalendarEntryService.functions.saveCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
      expect.assertions(6);
    });

    it('if unable to save calendar entry', async () => {
      const queriedCustomer = testDataFactory.customer.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = testDataFactory.price.document();
      const priceId = getPriceId(queriedPrice);

      const body = testDataFactory.calendar.entry.request.work({
        body: {
          customerId,
        },
        prices: {
          listed: [
            {
              priceId,
              quantity: 1,
            },
          ],
        }, 
      });
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
      mockPriceService.functions.findPricesByIds.mockResolvedValue([queriedPrice]);
      mockCalendarEntryDocumentConverter.functions.create.mockReturnValue(convertedCalendarEntryDocument);
      mockCalendarEntryService.functions.saveCalendarEntry.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving calendar entry', 500));
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.create, {
        body,
        customer: queriedCustomer,
        prices: [queriedPrice],
      }, undefined);
      validateFunctionCall(mockCalendarEntryService.functions.saveCalendarEntry, convertedCalendarEntryDocument);
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
      expect.assertions(6);
    });
  });
});

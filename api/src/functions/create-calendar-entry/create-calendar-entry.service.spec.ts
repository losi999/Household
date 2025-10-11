import { ICreateCalendarEntryService, createCalendarEntryServiceFactory } from '@household/api/functions/create-calendar-entry/create-calendar-entry.service';
import { calendarEntryDataFactory, customerDataFactory, priceDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCalendarEntryId, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';
import { IPriceService } from '@household/shared/services/price-service';

describe('Create calendar entry service', () => {
  let service: ICreateCalendarEntryService;
  let mockCalendarEntryService: Mock<ICalendarEntryService>;
  let mockCalendarEntryDocumentConverter: Mock<ICalendarEntryDocumentConverter>;
  let mockCustomerService: Mock<ICustomerService>;
  let mockPriceService: Mock<IPriceService>;
  
  beforeEach(() => {
    mockCalendarEntryService = createMockService('saveCalendarEntry');
    mockCalendarEntryDocumentConverter = createMockService('create');
    mockCustomerService = createMockService('findCustomerById');
    mockPriceService = createMockService('findPricesByIds');

    service = createCalendarEntryServiceFactory(mockCalendarEntryService.service, mockCalendarEntryDocumentConverter.service, mockCustomerService.service, mockPriceService.service);
  });

  const convertedCalendarEntryDocument = calendarEntryDataFactory.document();
  const calendarEntryId = getCalendarEntryId(convertedCalendarEntryDocument);

  it('should return new id if personal entry is created', async () => {
    const body = calendarEntryDataFactory.personalRequest();
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
    const body = calendarEntryDataFactory.issueRequest();
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
    const queriedCustomer = customerDataFactory.document();
    const customerId = getCustomerId(queriedCustomer);
    const queriedPrice = priceDataFactory.document();
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
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = priceDataFactory.document();
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
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = priceDataFactory.document();
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
      mockCustomerService.functions.findCustomerById.mockResolvedValue(undefined);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No customer found', 404));
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.create);
      validateFunctionCall(mockCalendarEntryService.functions.saveCalendarEntry);
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      expect.assertions(6);
    });

    it('if unable to query prices', async () => {
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = priceDataFactory.document();
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
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = priceDataFactory.document();
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
      const queriedCustomer = customerDataFactory.document();
      const customerId = getCustomerId(queriedCustomer);
      const queriedPrice = priceDataFactory.document();
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

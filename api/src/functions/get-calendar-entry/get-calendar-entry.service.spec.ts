import { IGetCalendarEntryService, getCalendarEntryServiceFactory } from '@household/api/functions/get-calendar-entry/get-calendar-entry.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';

describe('Get calendar entry service', () => {
  let service: IGetCalendarEntryService;
  let mockCalendarEntryService: MockService<ICalendarEntryService>;
  let mockCalendarEntryDocumentConverter: MockService<ICalendarEntryDocumentConverter>;

  beforeEach(() => {
    mockCalendarEntryService = createMockService('getCalendarEntryById');
    mockCalendarEntryDocumentConverter = createMockService('toResponse');

    service = getCalendarEntryServiceFactory(mockCalendarEntryService.service, mockCalendarEntryDocumentConverter.service);
  });

  const queriedDocument = testDataFactory.calendar.entry.document();
  const calendarEntryId = testDataFactory.calendar.entry.id();
  const convertedResponse = testDataFactory.calendar.entry.response.personal();

  it('should return with response', async () => {
    mockCalendarEntryService.functions.getCalendarEntryById.mockResolvedValue(queriedDocument);
    mockCalendarEntryDocumentConverter.functions.toResponse.mockReturnValue(convertedResponse);

    const result = await service({
      calendarEntryId,
    });
    expect(result).toEqual(convertedResponse);
    validateFunctionCall(mockCalendarEntryService.functions.getCalendarEntryById, calendarEntryId);
    validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponse, queriedDocument);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query calendar entry', async () => {
      mockCalendarEntryService.functions.getCalendarEntryById.mockRejectedValue('this is a mongo error');

      await service({
        calendarEntryId,
      }).catch(validateError('Error while getting calendar entry', 500));
      validateFunctionCall(mockCalendarEntryService.functions.getCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });

    it('if calendar entry not found', async () => {
      mockCalendarEntryService.functions.getCalendarEntryById.mockResolvedValue(undefined);

      await service({
        calendarEntryId,
      }).catch(validateError('No calendar entry found', 404));
      validateFunctionCall(mockCalendarEntryService.functions.getCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });
  });
});

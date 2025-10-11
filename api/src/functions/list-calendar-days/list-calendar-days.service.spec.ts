import { IListCalendarDaysService, listCalendarDaysServiceFactory } from '@household/api/functions/list-calendar-days/list-calendar-days.service';
import { calendarDayDataFactory, calendarEntryDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICalendarDayDocumentConverter } from '@household/shared/converters/calendar-day-document-converter';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';

describe('List calendar days service', () => {
  let service: IListCalendarDaysService;
  let mockCalendarEntryService: Mock<ICalendarEntryService>;
  let mockCalendarDayService: Mock<ICalendarDayService>;
  let mockCalendarDayDocumentConverter: Mock<ICalendarDayDocumentConverter>;

  beforeEach(() => {
    mockCalendarEntryService = createMockService('listCalendarEntries');
    mockCalendarDayService = createMockService('listCalendarDays');
    mockCalendarDayDocumentConverter = createMockService('toResponse');

    service = listCalendarDaysServiceFactory(mockCalendarEntryService.service, mockCalendarDayService.service, mockCalendarDayDocumentConverter.service);
  });

  const dateFrom = '2025-10-11';
  const dateTo = '2025-10-15';
  const queriedCalendarEntry = calendarEntryDataFactory.document();
  const queriedCalendarDay = calendarDayDataFactory.document();
  const convertedResponse = calendarDayDataFactory.response();

  it('should return documents', async () => {
    mockCalendarEntryService.functions.listCalendarEntries.mockResolvedValue([queriedCalendarEntry]);
    mockCalendarDayService.functions.listCalendarDays.mockResolvedValue([queriedCalendarDay]);
    mockCalendarDayDocumentConverter.functions.toResponse.mockReturnValue([convertedResponse]);

    const result = await service({
      dateFrom,
      dateTo,
    });
    expect(result).toEqual([convertedResponse]);
    validateFunctionCall(mockCalendarEntryService.functions.listCalendarEntries, {
      dateFrom,
      dateTo,
    });
    validateFunctionCall(mockCalendarDayService.functions.listCalendarDays, {
      dateFrom,
      dateTo,
    });
    validateFunctionCall(mockCalendarDayDocumentConverter.functions.toResponse, {
      dateFrom,
      dateTo,
      days: [queriedCalendarDay],
      entries: [queriedCalendarEntry],
    });
    expect.assertions(4);
  });

  describe('should throw error', () => {
    it('if unable to query calendar entries', async () => {
      mockCalendarEntryService.functions.listCalendarEntries.mockRejectedValue('this is a mongo error');
      mockCalendarDayService.functions.listCalendarDays.mockResolvedValue([queriedCalendarDay]);

      await service({
        dateFrom,
        dateTo,
      }).catch(validateError('Error while listing calendar entries', 500));
      validateFunctionCall(mockCalendarEntryService.functions.listCalendarEntries, {
        dateFrom,
        dateTo,
      });
      validateFunctionCall(mockCalendarDayService.functions.listCalendarDays, {
        dateFrom,
        dateTo,
      });
      validateFunctionCall(mockCalendarDayDocumentConverter.functions.toResponse);
      expect.assertions(5);
    });

    it('if unable to query calendar days', async () => {
      mockCalendarEntryService.functions.listCalendarEntries.mockResolvedValue([queriedCalendarEntry]);
      mockCalendarDayService.functions.listCalendarDays.mockRejectedValue('this is a mongo error');

      await service({
        dateFrom,
        dateTo,
      }).catch(validateError('Error while listing calendar days', 500));
      validateFunctionCall(mockCalendarEntryService.functions.listCalendarEntries, {
        dateFrom,
        dateTo,
      });
      validateFunctionCall(mockCalendarDayService.functions.listCalendarDays, {
        dateFrom,
        dateTo,
      });
      validateFunctionCall(mockCalendarDayDocumentConverter.functions.toResponse);
      expect.assertions(5);
    });
  });
});

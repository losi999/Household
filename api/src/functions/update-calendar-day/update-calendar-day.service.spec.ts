
import { IUpdateCalendarDayService, updateCalendarDayServiceFactory } from '@household/api/functions/update-calendar-day/update-calendar-day.service';
import { createDocumentUpdate, testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICalendarDayDocumentConverter } from '@household/shared/converters/calendar-day-document-converter';
import { CalendarDayType } from '@household/shared/enums';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';

describe('Update calendar day service', () => {
  let service: IUpdateCalendarDayService;
  let mockCalendarDayService: MockService<ICalendarDayService>;
  let mockCalendarDayDocumentConverter: MockService<ICalendarDayDocumentConverter>;

  beforeEach(() => {
    mockCalendarDayService = createMockService('findCalendarDayByDay', 'updateCalendarDay');
    mockCalendarDayDocumentConverter = createMockService('update');

    service = updateCalendarDayServiceFactory(mockCalendarDayService.service, mockCalendarDayDocumentConverter.service);
  });
  
  const queriedDocument = testDataFactory.calendar.day.document({
    dayType: CalendarDayType.Workday,
  });
  const body = testDataFactory.calendar.day.request.workday();
  const day = '2025-10-11';
  const updateQuery = createDocumentUpdate();

  it('should return if calendar day is updated', async () => {
    mockCalendarDayService.functions.findCalendarDayByDay.mockResolvedValue(queriedDocument);
    mockCalendarDayDocumentConverter.functions.update.mockReturnValue(updateQuery);
    mockCalendarDayService.functions.updateCalendarDay.mockResolvedValue(undefined);

    await service({
      body,
      day,
      expiresIn: undefined,
    });
    validateFunctionCall(mockCalendarDayService.functions.findCalendarDayByDay, day);
    validateFunctionCall(mockCalendarDayDocumentConverter.functions.update, body, undefined);
    validateFunctionCall(mockCalendarDayService.functions.updateCalendarDay, day, updateQuery);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query calendar day', async () => {
      mockCalendarDayService.functions.findCalendarDayByDay.mockRejectedValue('this is a mongo error');

      await service({
        body,
        day,
        expiresIn: undefined,
      }).catch(validateError('Error while getting calendar day', 500));
      validateFunctionCall(mockCalendarDayService.functions.findCalendarDayByDay, day);
      validateFunctionCall(mockCalendarDayDocumentConverter.functions.update);
      validateFunctionCall(mockCalendarDayService.functions.updateCalendarDay);
      expect.assertions(5);
    });

    it('if holiday is about to be updated', async () => {
      const queriedDocument = testDataFactory.calendar.day.document({
        dayType: CalendarDayType.Holiday,
      });
      mockCalendarDayService.functions.findCalendarDayByDay.mockResolvedValue(queriedDocument);

      await service({
        body,
        day,
        expiresIn: undefined,
      }).catch(validateError('Selected calendar day is a national holiday', 400));
      validateFunctionCall(mockCalendarDayService.functions.findCalendarDayByDay, day);
      validateFunctionCall(mockCalendarDayDocumentConverter.functions.update);
      validateFunctionCall(mockCalendarDayService.functions.updateCalendarDay);
      expect.assertions(5);
    });

    it('if unable to update calendar day', async () => {
      mockCalendarDayService.functions.findCalendarDayByDay.mockResolvedValue(queriedDocument);
      mockCalendarDayDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockCalendarDayService.functions.updateCalendarDay.mockRejectedValue('this is a mongo error');

      await service({
        body,
        day,
        expiresIn: undefined,
      }).catch(validateError('Error while updating calendar day', 500));
      validateFunctionCall(mockCalendarDayService.functions.findCalendarDayByDay, day);
      validateFunctionCall(mockCalendarDayDocumentConverter.functions.update, body, undefined);
      validateFunctionCall(mockCalendarDayService.functions.updateCalendarDay, day, updateQuery);
      expect.assertions(5);
    });
  });
});

import { IDeleteCalendarDayService, deleteCalendarDayServiceFactory } from '@household/api/functions/delete-calendar-day/delete-calendar-day.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { CalendarDayType } from '@household/shared/enums';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';

describe('Delete calendar day service', () => {
  let service: IDeleteCalendarDayService;
  let mockCalendarDayService: MockService<ICalendarDayService>;
  beforeEach(() => {
    mockCalendarDayService = createMockService('findCalendarDayByDay', 'deleteCalendarDay');

    service = deleteCalendarDayServiceFactory(mockCalendarDayService.service);
  });

  const queriedDocument = testDataFactory.calendar.day.document({
    dayType: CalendarDayType.Workday,
  });

  const day = '2025-10-11';

  it('should return if document is deleted', async () => {
    mockCalendarDayService.functions.findCalendarDayByDay.mockResolvedValue(queriedDocument);
    mockCalendarDayService.functions.deleteCalendarDay.mockResolvedValue(undefined);

    await service({
      day,
    });
    validateFunctionCall(mockCalendarDayService.functions.findCalendarDayByDay, day);
    validateFunctionCall(mockCalendarDayService.functions.deleteCalendarDay, day);
    expect.assertions(2);
  });

  describe('should throw error', () => {
    it('if unable to query document', async () => {
      mockCalendarDayService.functions.findCalendarDayByDay.mockRejectedValue('this is a mongo error');

      await service({
        day,
      }).catch(validateError('Error while getting calendar day', 500));
      validateFunctionCall(mockCalendarDayService.functions.findCalendarDayByDay, day);
      validateFunctionCall(mockCalendarDayService.functions.deleteCalendarDay);
      expect.assertions(4);
    });

    it('if holiday is about to be deleted', async () => {
      const queriedDocument = testDataFactory.calendar.day.document({
        dayType: CalendarDayType.Holiday,
      });
      mockCalendarDayService.functions.findCalendarDayByDay.mockResolvedValue(queriedDocument);

      await service({
        day,
      }).catch(validateError('Selected calendar day is a national holiday', 400));
      validateFunctionCall(mockCalendarDayService.functions.findCalendarDayByDay, day);
      validateFunctionCall(mockCalendarDayService.functions.deleteCalendarDay);
      expect.assertions(4);
    });

    it('if unable to delete document', async () => {
      mockCalendarDayService.functions.findCalendarDayByDay.mockResolvedValue(queriedDocument);
      mockCalendarDayService.functions.deleteCalendarDay.mockRejectedValue('this is a mongo error');

      await service({
        day,
      }).catch(validateError('Error while deleting calendar day', 500));
      validateFunctionCall(mockCalendarDayService.functions.findCalendarDayByDay, day);
      validateFunctionCall(mockCalendarDayService.functions.deleteCalendarDay, day);
      expect.assertions(4);
    });
  });
});

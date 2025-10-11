import { IDeleteCalendarDayService, deleteCalendarDayServiceFactory } from '@household/api/functions/delete-calendar-day/delete-calendar-day.service';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';

describe('Delete calendar day service', () => {
  let service: IDeleteCalendarDayService;
  let mockCalendarDayService: Mock<ICalendarDayService>;
  beforeEach(() => {
    mockCalendarDayService = createMockService('deleteCalendarDay');

    service = deleteCalendarDayServiceFactory(mockCalendarDayService.service);
  });

  const day = '2025-10-11';

  it('should return if document is deleted', async () => {
    mockCalendarDayService.functions.deleteCalendarDay.mockResolvedValue(undefined);

    await service({
      day,
    });
    validateFunctionCall(mockCalendarDayService.functions.deleteCalendarDay, day);
    expect.assertions(1);
  });

  describe('should throw error', () => {
    it('if unable to delete document', async () => {
      mockCalendarDayService.functions.deleteCalendarDay.mockRejectedValue('this is a mongo error');

      await service({
        day,
      }).catch(validateError('Error while deleting calendar day', 500));
      validateFunctionCall(mockCalendarDayService.functions.deleteCalendarDay, day);
      expect.assertions(3);
    });
  });
});


import { IUpdateCalendarDayService, updateCalendarDayServiceFactory } from '@household/api/functions/update-calendar-day/update-calendar-day.service';
import { calendarDayDataFactory, createDocumentUpdate2 } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICalendarDayDocumentConverter } from '@household/shared/converters/calendar-day-document-converter';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';

describe('Update calendar day service', () => {
  let service: IUpdateCalendarDayService;
  let mockCalendarDayService: Mock<ICalendarDayService>;
  let mockCalendarDayDocumentConverter: Mock<ICalendarDayDocumentConverter>;

  beforeEach(() => {
    mockCalendarDayService = createMockService('updateCalendarDay');
    mockCalendarDayDocumentConverter = createMockService('update');

    service = updateCalendarDayServiceFactory(mockCalendarDayService.service, mockCalendarDayDocumentConverter.service);
  });

  const body = calendarDayDataFactory.request();
  const day = '2025-10-11';
  const updateQuery = createDocumentUpdate2();

  it('should return if calendar day is updated', async () => {
    mockCalendarDayDocumentConverter.functions.update.mockReturnValue(updateQuery);
    mockCalendarDayService.functions.updateCalendarDay.mockResolvedValue(undefined);

    await service({
      body,
      day,
      expiresIn: undefined,
    });
    validateFunctionCall(mockCalendarDayDocumentConverter.functions.update, body, undefined);
    validateFunctionCall(mockCalendarDayService.functions.updateCalendarDay, day, updateQuery);
    expect.assertions(2);
  });

  describe('should throw error', () => {
    it('if unable to update calendar day', async () => {
      mockCalendarDayDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockCalendarDayService.functions.updateCalendarDay.mockRejectedValue('this is a mongo error');

      await service({
        body,
        day,
        expiresIn: undefined,
      }).catch(validateError('Error while updating calendar day', 500));
      validateFunctionCall(mockCalendarDayDocumentConverter.functions.update, body, undefined);
      validateFunctionCall(mockCalendarDayService.functions.updateCalendarDay, day, updateQuery);
      expect.assertions(4);
    });
  });
});

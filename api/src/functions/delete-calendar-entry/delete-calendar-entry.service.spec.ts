import { deleteCalendarEntryServiceFactory, IDeleteCalendarEntryService } from '@household/api/functions/delete-calendar-entry/delete-calendar-entry.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';

describe('Delete calendar entry service', () => {
  let service: IDeleteCalendarEntryService;
  let mockCalendarEntryService: MockService<ICalendarEntryService>;
  beforeEach(() => {
    mockCalendarEntryService = createMockService('findCalendarEntryById', 'deleteCalendarEntry');

    service = deleteCalendarEntryServiceFactory(mockCalendarEntryService.service);
  });

  const calendarEntryId = testDataFactory.calendar.entry.id();
  const queriedCalendarEntry = testDataFactory.calendar.entry.document();

  it('should return if document is deleted', async () => {
    mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarEntry);
    mockCalendarEntryService.functions.deleteCalendarEntry.mockResolvedValue(undefined);

    await service({
      calendarEntryId,
    });
    validateFunctionCall(mockCalendarEntryService.functions.deleteCalendarEntry, calendarEntryId);
    expect.assertions(1);
  });

  describe('should throw error', () => {
    it('if unable to query document', async () => {
      mockCalendarEntryService.functions.findCalendarEntryById.mockRejectedValue('this is a mongo error');

      await service({
        calendarEntryId,
      }).catch(validateError('Error while getting calendar entry', 500));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryService.functions.deleteCalendarEntry);
      expect.assertions(4);
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
        calendarEntryId,
      }).catch(validateError('Calendar entry is already resolved', 400));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryService.functions.deleteCalendarEntry);
      expect.assertions(4);
    });

    it('if unable to delete document', async () => {
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue(queriedCalendarEntry);
      mockCalendarEntryService.functions.deleteCalendarEntry.mockRejectedValue('this is a mongo error');

      await service({
        calendarEntryId,
      }).catch(validateError('Error while deleting calendar entry', 500));
      validateFunctionCall(mockCalendarEntryService.functions.findCalendarEntryById, calendarEntryId);
      validateFunctionCall(mockCalendarEntryService.functions.deleteCalendarEntry, calendarEntryId);
      expect.assertions(4);
    });
  });
});

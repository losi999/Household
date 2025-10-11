import { deleteCalendarEntryServiceFactory, IDeleteCalendarEntryService } from '@household/api/functions/delete-calendar-entry/delete-calendar-entry.service';
import { calendarEntryDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';

describe('Delete calendar entry service', () => {
  let service: IDeleteCalendarEntryService;
  let mockCalendarEntryService: Mock<ICalendarEntryService>;
  beforeEach(() => {
    mockCalendarEntryService = createMockService('findCalendarEntryById', 'deleteCalendarEntry');

    service = deleteCalendarEntryServiceFactory(mockCalendarEntryService.service);
  });

  const calendarEntryId = calendarEntryDataFactory.id();
  const queriedCalendarEntry = calendarEntryDataFactory.document();

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

    it('if calendar entry is already paid', async () => {
      mockCalendarEntryService.functions.findCalendarEntryById.mockResolvedValue({
        ...queriedCalendarEntry,
        isPaid: true,
      });

      await service({
        calendarEntryId,
      }).catch(validateError('Calendar entry is already paid', 400));
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

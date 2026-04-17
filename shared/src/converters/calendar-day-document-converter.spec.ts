import { createDocumentUpdate, testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { addSeconds } from '@household/shared/common/utils';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { calendarDayDocumentConverterFactory, ICalendarDayDocumentConverter } from '@household/shared/converters/calendar-day-document-converter';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';

describe('Calendar day document converter', () => {
  let converter: ICalendarDayDocumentConverter;
  let mockCalendarEntryDocumentConverter: MockService<ICalendarEntryDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(now);
    mockCalendarEntryDocumentConverter = createMockService('toResponseList');
    converter = calendarDayDocumentConverterFactory(mockCalendarEntryDocumentConverter.service);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const expiresIn = 3600;

  describe('update', () => {
    it('should update document (workday)', () => {
      const body = testDataFactory.calendar.day.request.workday({
        start: 10,
        end: 50,
      });

      const result = converter.update(body, expiresIn);
      expect(result).toEqual(createDocumentUpdate({
        update: {
          $set: {
            ...body,
            expiresAt: addSeconds(expiresIn, now),
          },
        },
      }));
    });
    
    it('should update document (vacation)', () => {
      const body = testDataFactory.calendar.day.request.vacation();

      const result = converter.update(body, expiresIn);
      expect(result).toEqual(createDocumentUpdate({
        update: {
          $set: {
            ...body,
            expiresAt: addSeconds(expiresIn, now),
          },
          $unset: {
            start: true,
            end: true,            
          },
        },
      }));
    });
  });

  describe('toResponse', () => {
    const customWorkdayStart = 30;
    const customWorkdayEnd = 82;

    describe('not weekend', () => {
      const day = '2025-10-20';
      const personalEntry = testDataFactory.calendar.entry.document({
        day,
        entryType: CalendarEntryType.Personal,
      });

      const issueEntry = testDataFactory.calendar.entry.document({
        day,
        entryType: CalendarEntryType.Issue,
      });

      const workEntry = testDataFactory.calendar.entry.document({
        day,
        entryType: CalendarEntryType.Work,
      });

      it('should return workday without custom time limits', () => {
        mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);
          
        const result = converter.toResponse({
          dateFrom: day,
          dateTo: day,
          days: [],
          entries: [
            personalEntry,
            issueEntry,
            workEntry,
          ],
        });
        expect(result).toEqual([
          testDataFactory.calendar.day.response.workday({
            day,
            start: WORKDAY_START,
            end: WORKDAY_END,
          }),
        ]);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
          personalEntry,
          issueEntry,
          workEntry,
        ]);
      });

      it('should return workday with custom time limits', () => {
        mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);
      
        const result = converter.toResponse({
          dateFrom: day,
          dateTo: day,
          days: [
            testDataFactory.calendar.day.document({
              day,
              dayType: CalendarDayType.Workday,
              start: customWorkdayStart,
              end: customWorkdayEnd,
            }),
          ],
          entries: [
            personalEntry,
            issueEntry,
            workEntry,
          ],
        });
        expect(result).toEqual([
          testDataFactory.calendar.day.response.workday({
            day,
            start: customWorkdayStart,
            end: customWorkdayEnd,
          }),
        ]);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
          personalEntry,
          issueEntry,
          workEntry,
        ]);
      });

      it('should return vacation day', () => {
        mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

        const result = converter.toResponse({
          dateFrom: day,
          dateTo: day,
          days: [
            testDataFactory.calendar.day.document({
              day,
              dayType: CalendarDayType.Vacation,
            }),
          ],
          entries: [
            personalEntry,
            issueEntry,
            workEntry,
          ],
        });
        expect(result).toEqual([
          testDataFactory.calendar.day.response.vacation({
            day,
          }),
        ]);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
          personalEntry,
          issueEntry,
          workEntry,
        ]);
      });

      it('should return holiday', () => {
        mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

        const result = converter.toResponse({
          dateFrom: day,
          dateTo: day,
          days: [
            testDataFactory.calendar.day.document({
              day,
              dayType: CalendarDayType.Holiday,
            }),
          ],
          entries: [
            personalEntry,
            issueEntry,
            workEntry,
          ],
        });
        expect(result).toEqual([
          testDataFactory.calendar.day.response.holiday({
            day,
          }),
        ]);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
          personalEntry,
          issueEntry,
          workEntry,
        ]);
      });
    });

    describe('weekend', () => {
      const day = '2025-10-25';
      const personalEntry = testDataFactory.calendar.entry.document({
        day,
        entryType: CalendarEntryType.Personal,
      });

      const issueEntry = testDataFactory.calendar.entry.document({
        day,
        entryType: CalendarEntryType.Issue,
      });

      const workEntry = testDataFactory.calendar.entry.document({
        day,
        entryType: CalendarEntryType.Work,
      });

      it('should return weekend without custom time limits', () => {
        mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

        const result = converter.toResponse({
          dateFrom: day,
          dateTo: day,
          days: [],
          entries: [
            personalEntry,
            issueEntry,
            workEntry,
          ],
        });
        expect(result).toEqual([
          testDataFactory.calendar.day.response.weekend({
            day,
            start: undefined,
            end: undefined,
          }),
        ]);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
          personalEntry,
          issueEntry,
          workEntry,
        ]);
      });

      it('should return weekend with custom time limits', () => {
        mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);
      
        const result = converter.toResponse({
          dateFrom: day,
          dateTo: day,
          days: [
            testDataFactory.calendar.day.document({
              day,
              dayType: CalendarDayType.Workday,
              start: customWorkdayStart,
              end: customWorkdayEnd,
            }),
          ],
          entries: [
            personalEntry,
            issueEntry,
            workEntry,
          ],
        });
        expect(result).toEqual([
          testDataFactory.calendar.day.response.weekend({
            day,
            start: customWorkdayStart,
            end: customWorkdayEnd,
          }),
        ]);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
          personalEntry,
          issueEntry,
          workEntry,
        ]);
      });

      it('should return vacation day', () => {
        mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

        const result = converter.toResponse({
          dateFrom: day,
          dateTo: day,
          days: [
            testDataFactory.calendar.day.document({
              day,
              dayType: CalendarDayType.Vacation,
            }),
          ],
          entries: [
            personalEntry,
            issueEntry,
            workEntry,
          ],
        });
        expect(result).toEqual([
          testDataFactory.calendar.day.response.vacation({
            day,
          }),
        ]);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
          personalEntry,
          issueEntry,
          workEntry,
        ]);
      });

      it('should return holiday', () => {
        mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

        const result = converter.toResponse({
          dateFrom: day,
          dateTo: day,
          days: [
            testDataFactory.calendar.day.document({
              day,
              dayType: CalendarDayType.Holiday,
            }),
          ],
          entries: [
            personalEntry,
            issueEntry,
            workEntry,
          ],
        });
        expect(result).toEqual([
          testDataFactory.calendar.day.response.holiday({
            day,
          }),
        ]);
        validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
          personalEntry,
          issueEntry,
          workEntry,
        ]);
      });
    });
  });
});

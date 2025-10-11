import { calendarDayDataFactory, calendarEntryDataFactory, createDocumentUpdate2 } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateFunctionCall } from '@household/shared/common/unit-testing';
import { addSeconds } from '@household/shared/common/utils';
import { WORKDAY_END, WORKDAY_LENGTH, WORKDAY_START } from '@household/shared/constants';
import { calendarDayDocumentConverterFactory, ICalendarDayDocumentConverter } from '@household/shared/converters/calendar-day-document-converter';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { advanceTo, clear } from 'jest-date-mock';

describe('Calendar day document converter', () => {
  let converter: ICalendarDayDocumentConverter;
  let mockCalendarEntryDocumentConverter: Mock<ICalendarEntryDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    mockCalendarEntryDocumentConverter = createMockService('toResponseList');
    converter = calendarDayDocumentConverterFactory(mockCalendarEntryDocumentConverter.service);
  });

  afterEach(() => {
    clear();
  });

  const expiresIn = 3600;

  describe('update', () => {
    it('should update document (workday)', () => {
      const body = calendarDayDataFactory.workdayRequest({
        start: 10,
        end: 50,
      });

      const result = converter.update(body, expiresIn);
      expect(result).toEqual(createDocumentUpdate2({
        update: {
          $set: {
            ...body,
            expiresAt: addSeconds(expiresIn, now),
          },
        },
      }));
    });
    
    it('should update document (vacation)', () => {
      const body = calendarDayDataFactory.vacationRequest();

      const result = converter.update(body, expiresIn);
      expect(result).toEqual(createDocumentUpdate2({
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
    const lateWorkEnd = 80;
    const earlyWorkStart = 32;

    describe('not weekend', () => {
      const day = '2025-10-20';
      const personalEntry = calendarEntryDataFactory.document({
        day,
        entryType: CalendarEntryType.Personal,
      });

      const issueEntry = calendarEntryDataFactory.document({
        day,
        entryType: CalendarEntryType.Issue,
      });

      describe('without work entries', () => {   
        it('should return workday without custom time limits', () => {
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);
          
          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [],
            entries: [
              personalEntry,
              issueEntry,
            ],
          });
          expect(result).toEqual([
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Workday,
              plannedStart: WORKDAY_START,
              plannedEnd: WORKDAY_END,
              start: WORKDAY_START,
              end: WORKDAY_END,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
          ]);
        });

        it('should return workday with custom time limits', () => {

          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);
      
          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Workday,
                start: customWorkdayStart,
                end: customWorkdayEnd,
              }),
            ],
            entries: [
              personalEntry,
              issueEntry,
            ],
          });
          expect(result).toEqual([
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Workday,
              plannedStart: customWorkdayStart,
              plannedEnd: customWorkdayEnd,
              start: customWorkdayStart,
              end: customWorkdayEnd,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
          ]);
        });

        it('should return vacation day', () => {
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Vacation,
              }),
            ],
            entries: [
              personalEntry,
              issueEntry,
            ],
          });
          expect(result).toEqual([
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Vacation,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
          ]);
        });

        it('should return holiday', () => {
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Holiday,
              }),
            ],
            entries: [
              personalEntry,
              issueEntry,
            ],
          });
          expect(result).toEqual([
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Holiday,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
          ]);
        });
      });

      describe('with work entries', () => {
        it('should return workday without custom time limits (calculated start time)', () => {
          const workEntry = calendarEntryDataFactory.document({
            day,
            entryType: CalendarEntryType.Work,
            end: lateWorkEnd,
            start: lateWorkEnd - 2,
          });
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
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Workday,
              plannedStart: WORKDAY_START,
              plannedEnd: WORKDAY_END,
              start: lateWorkEnd - WORKDAY_LENGTH,
              end: WORKDAY_END,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
            workEntry,
          ]);
        });

        it('should return workday without custom time limits (calculated end time)', () => {
          const workEntry = calendarEntryDataFactory.document({
            day,
            entryType: CalendarEntryType.Work,
            end: earlyWorkStart + 2,
            start: earlyWorkStart,
          });
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
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Workday,
              plannedStart: WORKDAY_START,
              plannedEnd: WORKDAY_END,
              start: WORKDAY_START,
              end: earlyWorkStart + WORKDAY_LENGTH,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
            workEntry,
          ]);
        });

        it('should return workday with custom time limits (calculated start time)', () => {
          const workEntry = calendarEntryDataFactory.document({
            day,
            entryType: CalendarEntryType.Work,
            end: lateWorkEnd,
            start: lateWorkEnd - 2,
          });
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);
          
          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
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
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Workday,
              plannedStart: customWorkdayStart,
              plannedEnd: customWorkdayEnd,
              start: lateWorkEnd - WORKDAY_LENGTH,
              end: customWorkdayEnd,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
            workEntry,
          ]);
        });

        it('should return workday with custom time limits (calculated end time)', () => {
          const workEntry = calendarEntryDataFactory.document({
            day,
            entryType: CalendarEntryType.Work,
            end: earlyWorkStart + 2,
            start: earlyWorkStart,
          });
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);
          
          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
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
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Workday,
              plannedStart: customWorkdayStart,
              plannedEnd: customWorkdayEnd,
              start: customWorkdayStart,
              end: earlyWorkStart + WORKDAY_LENGTH,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
            workEntry,
          ]);
        });

        it('should return vacation day', () => {
          const workEntry = calendarEntryDataFactory.document({
            day,
            entryType: CalendarEntryType.Work,
            end: lateWorkEnd,
            start: lateWorkEnd - 2,
          });
          
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
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
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Vacation,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
            workEntry,
          ]);
        });

        it('should return holiday', () => {
          const workEntry = calendarEntryDataFactory.document({
            day,
            entryType: CalendarEntryType.Work,
            end: lateWorkEnd,
            start: lateWorkEnd - 2,
          });
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
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
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Holiday,
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

    describe('weekend', () => {
      const day = '2025-10-25';
      const personalEntry = calendarEntryDataFactory.document({
        day,
        entryType: CalendarEntryType.Personal,
      });

      const issueEntry = calendarEntryDataFactory.document({
        day,
        entryType: CalendarEntryType.Issue,
      });

      describe('without work entries', () => {
        it('should return weekend without custom time limits', () => {
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [],
            entries: [
              personalEntry,
              issueEntry,
            ],
          });
          expect(result).toEqual([
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Weekend,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
          ]);
        });

        it('should return weekend with custom time limits', () => {
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);
      
          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Workday,
                start: customWorkdayStart,
                end: customWorkdayEnd,
              }),
            ],
            entries: [
              personalEntry,
              issueEntry,
            ],
          });
          expect(result).toEqual([
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Weekend,
              plannedStart: customWorkdayStart,
              plannedEnd: customWorkdayEnd,
              start: customWorkdayStart,
              end: customWorkdayEnd,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
          ]);
        });

        it('should return vacation day', () => {
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Vacation,
              }),
            ],
            entries: [
              personalEntry,
              issueEntry,
            ],
          });
          expect(result).toEqual([
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Vacation,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
          ]);
        });

        it('should return holiday', () => {
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Holiday,
              }),
            ],
            entries: [
              personalEntry,
              issueEntry,
            ],
          });
          expect(result).toEqual([
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Holiday,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
          ]);
        });
      });

      describe('with work entries', () => {
        it('should return weeked without custom time limits', () => {      
          const workEntry = calendarEntryDataFactory.document({
            day,
            entryType: CalendarEntryType.Work,
            end: earlyWorkStart + 2,
            start: earlyWorkStart,
          });

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
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Weekend,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
            workEntry,
          ]);
        });

        it('should return weekend with custom time limits (calculated start time)', () => {
          const workEntry = calendarEntryDataFactory.document({
            day,
            entryType: CalendarEntryType.Work,
            end: lateWorkEnd,
            start: lateWorkEnd - 2,
          });
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);
      
          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
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
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Weekend,
              plannedStart: customWorkdayStart,
              plannedEnd: customWorkdayEnd,
              start: lateWorkEnd - WORKDAY_LENGTH,
              end: customWorkdayEnd,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
            workEntry,
          ]);
        });

        it('should return weekend with custom time limits (calculated end time)', () => {
          const workEntry = calendarEntryDataFactory.document({
            day,
            entryType: CalendarEntryType.Work,
            end: earlyWorkStart + 2,
            start: earlyWorkStart,
          });
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);
      
          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
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
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Weekend,
              plannedStart: customWorkdayStart,
              plannedEnd: customWorkdayEnd,
              start: customWorkdayStart,
              end: earlyWorkStart + WORKDAY_LENGTH,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
            workEntry,
          ]);
        });

        it('should return vacation day', () => {
          const workEntry = calendarEntryDataFactory.document({
            day,
            entryType: CalendarEntryType.Work,
            end: earlyWorkStart + 2,
            start: earlyWorkStart,
          });
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
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
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Vacation,
            }),
          ]);
          validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseList, [
            personalEntry,
            issueEntry,
            workEntry,
          ]);
        });

        it('should return holiday', () => {
          const workEntry = calendarEntryDataFactory.document({
            day,
            entryType: CalendarEntryType.Work,
            end: earlyWorkStart + 2,
            start: earlyWorkStart,
          });
          mockCalendarEntryDocumentConverter.functions.toResponseList.mockReturnValue([]);

          const result = converter.toResponse({
            dateFrom: day,
            dateTo: day,
            days: [
              calendarDayDataFactory.document({
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
            calendarDayDataFactory.response({
              day,
              dayType: CalendarDayType.Holiday,
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
});

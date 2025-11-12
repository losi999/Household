import { calendarApiActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { calendarReducer, CalendarState } from '@household/web/app/hairdressing/calendar/state/calendar.reducer';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { Calendar } from '@household/shared/types/types';
import { LimitedCalendarDay } from '@household/web/types/common';

type TestCase = {
  earliestStart: number;
  latestEnd: number;
  plannedStart: number;
  plannedEnd: number;
  calculatedStart: number;
  calculatedEnd: number;
};

const defaultDayLimitTestCases: TestCase[] = [
  {
    earliestStart: 52,
    latestEnd: 60,
    plannedStart: WORKDAY_START,
    plannedEnd: WORKDAY_END,
    calculatedStart: 32,
    calculatedEnd: 80,
  },
  {
    earliestStart: 32,
    latestEnd: 52,
    plannedStart: WORKDAY_START,
    plannedEnd: WORKDAY_END,
    calculatedStart: 28,
    calculatedEnd: 60,
  },
  {
    earliestStart: 60,
    latestEnd: 80,
    plannedStart: WORKDAY_START,
    plannedEnd: WORKDAY_END,
    calculatedStart: 52,
    calculatedEnd: 84,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: WORKDAY_START,
    plannedEnd: WORKDAY_END,
    calculatedStart: 44,
    calculatedEnd: 68,
  },
];

const testCases: TestCase[] = [
  ...defaultDayLimitTestCases,
  {
    earliestStart: 40,
    latestEnd: 50,
    plannedStart: 32,
    plannedEnd: 48,
    calculatedStart: 32,
    calculatedEnd: 48,
  },
  {
    earliestStart: 28,
    latestEnd: 48,
    plannedStart: 32,
    plannedEnd: 64,
    calculatedStart: 32,
    calculatedEnd: 56,
  },
  {
    earliestStart: 48,
    latestEnd: 68,
    plannedStart: 32,
    plannedEnd: 64,
    calculatedStart: 40,
    calculatedEnd: 64,
  },
  {
    earliestStart: 56,
    latestEnd: 64,
    plannedStart: 32,
    plannedEnd: 48,
    calculatedStart: 36,
    calculatedEnd: 48,
  },
  {
    earliestStart: 48,
    latestEnd: 56,
    plannedStart: 64,
    plannedEnd: 80,
    calculatedStart: 64,
    calculatedEnd: 76,
  },
  {
    earliestStart: 68,
    latestEnd: 72,
    plannedStart: 32,
    plannedEnd: 40,
    calculatedStart: undefined,
    calculatedEnd: undefined,
  },
  {
    earliestStart: 24,
    latestEnd: 28,
    plannedStart: 56,
    plannedEnd: 64,
    calculatedStart: undefined,
    calculatedEnd: undefined,
  },
  {
    earliestStart: 68,
    latestEnd: 72,
    plannedStart: 48,
    plannedEnd: 60,
    calculatedStart: 48,
    calculatedEnd: 60,
  },
  {
    earliestStart: 24,
    latestEnd: 28,
    plannedStart: 36,
    plannedEnd: 48,
    calculatedStart: 36,
    calculatedEnd: 48,
  },
  {
    earliestStart: 40,
    latestEnd: 60,
    plannedStart: 44,
    plannedEnd: 56,
    calculatedStart: 44,
    calculatedEnd: 56,
  },
  {
    earliestStart: 44,
    latestEnd: 56,
    plannedStart: 40,
    plannedEnd: 64,
    calculatedStart: 40,
    calculatedEnd: 64,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: 42,
    plannedEnd: 70,
    calculatedStart: 44,
    calculatedEnd: 68,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: 48,
    plannedEnd: 64,
    calculatedStart: 48,
    calculatedEnd: 64,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: WORKDAY_START,
    plannedEnd: 70,
    calculatedStart: 44,
    calculatedEnd: 68,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: WORKDAY_START,
    plannedEnd: 56,
    calculatedStart: 44,
    calculatedEnd: 56,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: WORKDAY_START,
    plannedEnd: 42,
    calculatedStart: undefined,
    calculatedEnd: undefined,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: WORKDAY_START,
    plannedEnd: 36,
    calculatedStart: undefined,
    calculatedEnd: undefined,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: 42,
    plannedEnd: WORKDAY_END,
    calculatedStart: 44,
    calculatedEnd: 68,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: 48,
    plannedEnd: WORKDAY_END,
    calculatedStart: 48,
    calculatedEnd: 68,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: 70,
    plannedEnd: WORKDAY_END,
    calculatedStart: undefined,
    calculatedEnd: undefined,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: 76,
    plannedEnd: WORKDAY_END,
    calculatedStart: undefined,
    calculatedEnd: undefined,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: 42,
    plannedEnd: 64,
    calculatedStart: 44,
    calculatedEnd: 64,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: 48,
    plannedEnd: 70,
    calculatedStart: 48,
    calculatedEnd: 68,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: 41,
    plannedEnd: 42,
    calculatedStart: undefined,
    calculatedEnd: undefined,
  },
  {
    earliestStart: 40,
    latestEnd: 72,
    plannedStart: 70,
    plannedEnd: 71,
    calculatedStart: undefined,
    calculatedEnd: undefined,
  },
];

fdescribe('Calendar reducer', () => {
  let initialState: CalendarState;
  beforeEach(() => {
    initialState = {};
  });

  it('should return the default state when an unknown action is used', () => {
    const action = {
      type: 'Unknown', 
    } as any;
    const state = calendarReducer(initialState, action);
    expect(state).toBe(initialState);
  });

  describe('Calendar API', () => {
    describe('On List calendar days completed', () => {
      let day: string;
      let workEntry: Calendar.Entry.WorkEntryResponse;
      let issueEntry: Calendar.Entry.IssueEntryResponse;
      let personalEntry: Calendar.Entry.PersonalEntryResponse;

      beforeEach(() => {
        day = testDataFactory.calendar.day.futureDay();
        workEntry = testDataFactory.calendar.entry.response.work({
          day,
        });
        issueEntry = testDataFactory.calendar.entry.response.issue({
          day,
        });
        personalEntry = testDataFactory.calendar.entry.response.personal({
          day,
        });
      });

      it('should set holiday', () => {
        const dayResponse = testDataFactory.calendar.day.response.holiday({
          day,
          entries: [
            workEntry,
            personalEntry,
            issueEntry,
          ],
        });
        const action = calendarApiActions.listCalendarDaysCompleted({
          days: [dayResponse],
        });
        const state = calendarReducer(initialState, action);
        expect(state).toEqual({
          [day]: {
            ...dayResponse,
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        });
      });

      it('should set vacation', () => {
        const dayResponse = testDataFactory.calendar.day.response.vacation({
          day,
          entries: [
            workEntry,
            personalEntry,
            issueEntry,
          ],
        });
        const action = calendarApiActions.listCalendarDaysCompleted({
          days: [dayResponse],
        });
        const state = calendarReducer(initialState, action);
        expect(state).toEqual({
          [day]: {
            ...dayResponse,
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        });
      });

      it('should set weekend without planned work', () => {
        const dayResponse = testDataFactory.calendar.day.response.weekend({
          day,
          entries: [
            workEntry,
            personalEntry,
            issueEntry,
          ],
          end: undefined,
          start: undefined,
        });
        const action = calendarApiActions.listCalendarDaysCompleted({
          days: [dayResponse],
        });
        const state = calendarReducer(initialState, action);
        expect(state).toEqual({
          [day]: {
            ...dayResponse,
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        });
      });

      it('should set weekend with planned work', () => {
        const dayResponse = testDataFactory.calendar.day.response.weekend({
          day,
          entries: [
            personalEntry,
            issueEntry,
          ],
        });
        const action = calendarApiActions.listCalendarDaysCompleted({
          days: [dayResponse],
        });
        const state = calendarReducer(initialState, action);
        expect(state).toEqual({
          [day]: {
            ...dayResponse,
            calculatedStart: dayResponse.start,
            calculatedEnd: dayResponse.end,
          },
        });
      });

      it('should set workday with planned work', () => {
        const dayResponse = testDataFactory.calendar.day.response.workday({
          day,
          entries: [
            personalEntry,
            issueEntry,
          ],
        });
        const action = calendarApiActions.listCalendarDaysCompleted({
          days: [dayResponse],
        });
        const state = calendarReducer(initialState, action);
        expect(state).toEqual({
          [day]: {
            ...dayResponse,
            calculatedStart: dayResponse.start,
            calculatedEnd: dayResponse.end,
          },
        });
      });

      describe('with work entry', () => {
        testCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should calculate workday limits #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            const dayResponse = testDataFactory.calendar.day.response.workday({
              day,
              start: plannedStart,
              end: plannedEnd,
              entries: [
                issueEntry,
                personalEntry,
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: earliestStart,
                  end: earliestStart + 1,
                }),
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: latestEnd - 1,
                  end: latestEnd,
                }),
              ],
            });
            const action = calendarApiActions.listCalendarDaysCompleted({
              days: [dayResponse],
            });
            const state = calendarReducer(initialState, action);
            expect(state).toEqual({
              [day]: {
                ...dayResponse,
                calculatedStart,
                calculatedEnd,
              },
            });
          });
        });
      });
    });

    describe('On Update calendar day completed', () => {  
      let day: string;
      let workEntry: Calendar.Entry.WorkEntryResponse;
      let issueEntry: Calendar.Entry.IssueEntryResponse;
      let personalEntry: Calendar.Entry.PersonalEntryResponse;

      beforeEach(() => {
        day = testDataFactory.calendar.day.futureDay();
        workEntry = testDataFactory.calendar.entry.response.work({
          day,
        });
        issueEntry = testDataFactory.calendar.entry.response.issue({
          day,
        });
        personalEntry = testDataFactory.calendar.entry.response.personal({
          day,
        });
      });
      
      it('should update to vacation', () => {
        initialState = {
          [day]: {
            ...testDataFactory.calendar.day.response.workday({
              day,
              entries: [
                workEntry,
                personalEntry,
                issueEntry,
              ],
              start: WORKDAY_START,
              end: WORKDAY_END,
            }),
            calculatedStart: WORKDAY_START,
            calculatedEnd: WORKDAY_END,
          },
        };
        const request = testDataFactory.calendar.day.request.vacation();
        const action = calendarApiActions.updateCalendarDayCompleted({
          day,
          ...request,
        });
        const state = calendarReducer(initialState, action);
        expect(state).toEqual({
          [day]: {
            calculatedStart: undefined,
            calculatedEnd: undefined,
            dayType: CalendarDayType.Vacation,
            entries: [
              workEntry,
              personalEntry,
              issueEntry,
            ],
            day,
          },
        });
      });

      it('should update to workday', () => {
        initialState = {
          [day]: {
            ...testDataFactory.calendar.day.response.vacation({
              day,
              entries: [
                personalEntry,
                issueEntry,
              ],
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        };
        const request = testDataFactory.calendar.day.request.workday();
        const action = calendarApiActions.updateCalendarDayCompleted({
          day,
          ...request,
        });
        const state = calendarReducer(initialState, action);
        expect(state).toEqual({
          [day]: {
            calculatedStart: request.start,
            calculatedEnd: request.end,
            dayType: CalendarDayType.Workday,
            start: request.start,
            end: request.end,
            entries: [
              personalEntry,
              issueEntry,
            ],
            day,
          },
        });
      });

      it('should update a weekend to workday', () => {
        initialState = {
          [day]: {
            ...testDataFactory.calendar.day.response.weekend({
              day,
              entries: [
                personalEntry,
                issueEntry,
              ],
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        };
        const request = testDataFactory.calendar.day.request.workday();
        const action = calendarApiActions.updateCalendarDayCompleted({
          day,
          ...request,
        });
        const state = calendarReducer(initialState, action);
        expect(state).toEqual({
          [day]: {
            calculatedStart: request.start,
            calculatedEnd: request.end,
            dayType: CalendarDayType.Weekend,
            start: request.start,
            end: request.end,
            entries: [
              personalEntry,
              issueEntry,
            ],
            day,
          },
        });
      });

      describe('with work entry', () => {
        testCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should recalculate limits of workday #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            const originalDay = testDataFactory.calendar.day.response.workday({
              day,
              start: WORKDAY_START,
              end: WORKDAY_END,
              entries: [
                issueEntry,
                personalEntry,
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: earliestStart,
                  end: earliestStart + 1,
                }),
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: latestEnd - 1,
                  end: latestEnd,
                }),
              ],
            });
            initialState = {
              [day]: {
                ...originalDay,
                calculatedStart: undefined,
                calculatedEnd: undefined,
              },
            };
            const request = testDataFactory.calendar.day.request.workday({
              start: plannedStart,
              end: plannedEnd,
            });
            const action = calendarApiActions.updateCalendarDayCompleted({
              day,
              ...request,
            });
            const state = calendarReducer(initialState, action);
            expect(state).toEqual({
              [day]: {
                ...originalDay,
                calculatedStart: calculatedStart,
                calculatedEnd: calculatedEnd,
                dayType: CalendarDayType.Workday,
                start: request.start,
                end: request.end,
              },
            });
          });
        }); 
      });
    });

    describe('On Delete calendar day completed', () => {     
      let day: string;
      let issueEntry: Calendar.Entry.IssueEntryResponse;
      let personalEntry: Calendar.Entry.PersonalEntryResponse;

      beforeEach(() => {
        day = testDataFactory.calendar.day.futureDay();
        issueEntry = testDataFactory.calendar.entry.response.issue({
          day,
        });
        personalEntry = testDataFactory.calendar.entry.response.personal({
          day,
        });
      });

      it('should delete a vacation', () => {
        initialState = {
          [day]: {
            ...testDataFactory.calendar.day.response.vacation({
              day,
              entries: [
                issueEntry,
                personalEntry,
              ],
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        };

        const action = calendarApiActions.deleteCalendarDayCompleted({
          day,
        });
        const state = calendarReducer(initialState, action);
        expect(state).toEqual({
          [day]: {
            calculatedStart: WORKDAY_START,
            calculatedEnd: WORKDAY_END,
            dayType: CalendarDayType.Workday,
            start: WORKDAY_START,
            end: WORKDAY_END,
            entries: [
              issueEntry,
              personalEntry,
            ],
            day,
          },
        });
      });

      it('should delete planned work from a weekend', () => {
        initialState = {
          [day]: {
            ...testDataFactory.calendar.day.response.weekend({
              day,
              entries: [
                issueEntry,
                personalEntry,
              ],
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        };

        const action = calendarApiActions.deleteCalendarDayCompleted({
          day,
        });
        const state = calendarReducer(initialState, action);
        expect(state).toEqual({
          [day]: {
            calculatedStart: undefined,
            calculatedEnd: undefined,
            dayType: CalendarDayType.Weekend,
            start: undefined,
            end: undefined,
            entries: [
              issueEntry,
              personalEntry,
            ],
            day,
          },
        });
      });

      it('should delete planned work from a workday', () => {
        initialState = {
          [day]: {
            ...testDataFactory.calendar.day.response.workday({
              day,
              entries: [
                issueEntry,
                personalEntry,
              ],
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        };

        const action = calendarApiActions.deleteCalendarDayCompleted({
          day,
        });
        const state = calendarReducer(initialState, action);
        expect(state).toEqual({
          [day]: {
            calculatedStart: WORKDAY_START,
            calculatedEnd: WORKDAY_END,
            dayType: CalendarDayType.Workday,
            start: WORKDAY_START,
            end: WORKDAY_END,
            entries: [
              issueEntry,
              personalEntry,
            ],
            day,
          },
        });
      });

      describe('with work entry', () => {
        defaultDayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should recalculate limits of workday #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            const day = testDataFactory.calendar.day.futureDay();
            const originalDay = testDataFactory.calendar.day.response.workday({
              day,
              entries: [
                issueEntry,
                personalEntry,
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: earliestStart,
                  end: earliestStart + 1,
                }),
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: latestEnd - 1,
                  end: latestEnd,
                }),
              ],
            });
            initialState = {
              [day]: {
                ...originalDay,
                calculatedStart: undefined,
                calculatedEnd: undefined,
              },
            };
            const action = calendarApiActions.deleteCalendarDayCompleted({
              day,
            });
            const state = calendarReducer(initialState, action);
            expect(state).toEqual({
              [day]: {
                ...originalDay,
                calculatedStart: calculatedStart,
                calculatedEnd: calculatedEnd,
                dayType: CalendarDayType.Workday,
                start: WORKDAY_START,
                end: WORKDAY_END,
              },
            });
          });
        });
      });
    });

    describe('On Create calendar entry completed', () => {
      let day: string;
      let originalDay: LimitedCalendarDay;
      let calendarEntryId: Calendar.Entry.Id;

      beforeEach(() => {
        day = testDataFactory.calendar.day.futureDay();
        calendarEntryId = testDataFactory.calendar.entry.id();
      });

      const createPersonalEntryTest = () => {
        it('should create a personal entry', () => {
          const request = testDataFactory.calendar.entry.request.personal({
            day,
          });
          const action = calendarApiActions.createCalendarEntryCompleted({
            calendarEntryId,
            customer: undefined,
            ...request,
          });
          const state = calendarReducer(initialState, action);
          expect(state).toEqual({
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...request,
                  calendarEntryId,
                },
              ],
            },
          });
        });
      };
      const createIssueEntryTest = () => {
        it('should create a issue entry', () => {
          const request = testDataFactory.calendar.entry.request.issue({
            day,
          });
          const action = calendarApiActions.createCalendarEntryCompleted({
            calendarEntryId,
            customer: undefined,
            ...request,
          });
          const state = calendarReducer(initialState, action);
          expect(state).toEqual({
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...request,
                  calendarEntryId,
                },
              ],
            },
          });
        });
      };
      const createWorkEntryTest = () => {
        it('should create a work entry', () => {
          const customerResponse = testDataFactory.customer.response();
          const request = testDataFactory.calendar.entry.request.work({
            body: {
              day,
            },
          });
          const action = calendarApiActions.createCalendarEntryCompleted({
            calendarEntryId,
            customer: customerResponse,
            ...request,
          });
          const state = calendarReducer(initialState, action);
          
          const { start, end, description, title, entryType } = request;
          expect(state).toEqual({
            [day]: {
              ...originalDay,
              entries: [
                {
                  calendarEntryId,
                  day,
                  start,
                  end,
                  description,
                  title,
                  prices: undefined,
                  resolution: undefined,
                  entryType,
                  customer: customerResponse,
                },
              ],
            },
          });
        });
      };

      describe('on a vacation', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.vacation({
              day,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };

          initialState = {
            [day]: originalDay,
          };
        });
       
        createPersonalEntryTest();
        createIssueEntryTest();
        createWorkEntryTest();
      });

      describe('on a holiday', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.holiday({
              day,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };
          initialState = {
            [day]: originalDay,
          };
        });
       
        createPersonalEntryTest();
        createIssueEntryTest();
        createWorkEntryTest();
      });

      describe('on a weekend without planned work', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.weekend({
              day,
              start: undefined,
              end: undefined,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };
          initialState = {
            [day]: originalDay,
          };
        });
       
        createPersonalEntryTest();
        createIssueEntryTest();
        createWorkEntryTest();
      });

      describe('on a workday', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.workday({
              day,
              start: WORKDAY_START,
              end: WORKDAY_END,
            }),
            calculatedStart: WORKDAY_START,
            calculatedEnd: WORKDAY_END,
          };
          initialState = {
            [day]: originalDay,
          };
        });
       
        createPersonalEntryTest();
        createIssueEntryTest();

        testCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {

          it(`should create work entry with limits recalculated #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            originalDay = {
              ...testDataFactory.calendar.day.response.workday({
                day,
                start: plannedStart,
                end: plannedEnd,
                entries: [
                  testDataFactory.calendar.entry.response.work({
                    day,
                    start: latestEnd - 1,
                    end: latestEnd,
                  }),
                ],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };
            initialState = {
              [day]: originalDay,
            };

            const customerResponse = testDataFactory.customer.response();
            const request = testDataFactory.calendar.entry.request.work({
              body: {
                day,
                start: earliestStart,
                end: earliestStart + 1,
              },
            });
            const action = calendarApiActions.createCalendarEntryCompleted({
              calendarEntryId,
              customer: customerResponse,
              ...request,
            });
            const state = calendarReducer(initialState, action);
            expect(state).toEqual({
              [day]: {
                ...originalDay,
                calculatedStart,
                calculatedEnd,
                entries: [
                  {
                    calendarEntryId,
                    day,
                    start: request.start,
                    end: request.end,
                    description: request.description,
                    title: request.title,
                    prices: undefined,
                    resolution: undefined,
                    entryType: CalendarEntryType.Work,
                    customer: customerResponse,
                  },
                  ...originalDay.entries,
                ],
              },
            });
          });
        });
      });
    });

    describe('On Update calendar entry completed', () => {
      let calendarEntryId: Calendar.Entry.Id;
      
      beforeEach(() => {
        calendarEntryId = testDataFactory.calendar.entry.id(); 
      });

      describe('on the same', () => {
        let day: string;
        let originalDay: LimitedCalendarDay;
        let originalEntry: Calendar.Entry.Response;

        beforeEach(() => {
          day = testDataFactory.calendar.day.futureDay();
        });

        const updatePersonalEntryTest = () => {
          it('should update personal entry', () => {
            originalEntry = testDataFactory.calendar.entry.response.personal({
              calendarEntryId,
              day,
            });

            initialState = {
              [day]: {
                ...originalDay,
                entries: [originalEntry],
              },
            };

            const request = testDataFactory.calendar.entry.request.personal({
              day,
            });
            const action = calendarApiActions.updateCalendarEntryCompleted({
              calendarEntryId,
              day,
              ...request,
              customer: undefined,
            });

            const state = calendarReducer(initialState, action);
            expect(state).toEqual({
              [day]: {
                ...originalDay,
                entries: [
                  {
                    calendarEntryId,
                    ...request,
                  },
                ],
              },
            });
          });
        };

        const updateIssueEntryTest = () => {
          it('should update issue entry', () => {
            originalEntry = testDataFactory.calendar.entry.response.issue({
              calendarEntryId,
              day,
            });

            initialState = {
              [day]: {
                ...originalDay,
                entries: [originalEntry],
              },
            };

            const request = testDataFactory.calendar.entry.request.issue({
              day,
            });
            const action = calendarApiActions.updateCalendarEntryCompleted({
              calendarEntryId,
              day,
              ...request,
              customer: undefined,
            });

            const state = calendarReducer(initialState, action);
            expect(state).toEqual({
              [day]: {
                ...originalDay,
                entries: [
                  {
                    calendarEntryId,
                    ...request,
                  },
                ],
              },
            });
          });
        };

        const updateWorkEntryTest = () => {
          it('should update work entry', () => {
            originalEntry = testDataFactory.calendar.entry.response.work({
              calendarEntryId,
              day,
            });

            initialState = {
              [day]: {
                ...originalDay,
                entries: [originalEntry],
              },
            };

            initialState = {
              [day]: originalDay,
            };
            
            const customerResponse = testDataFactory.customer.response();
            const request = testDataFactory.calendar.entry.request.work({
              body: {
                day,
              },
            });
            const action = calendarApiActions.updateCalendarEntryCompleted({
              calendarEntryId,
              day,
              ...request,
              customer: customerResponse,
            });

            const state = calendarReducer(initialState, action);

            const { start, end, description, title, entryType } = request;
            expect(state).toEqual({
              [day]: {
                ...originalDay,
                entries: [
                  {
                    calendarEntryId,
                    day,
                    start,
                    end,
                    description,
                    title,
                    prices: undefined,
                    resolution: undefined,
                    entryType,
                    customer: customerResponse,
                  },
                ],
              },
            });
          });
        };

        describe('vacation day', () => {
          beforeEach(() => {
            originalDay = {
              ...testDataFactory.calendar.day.response.vacation({
                day,
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };
          });
         
          updatePersonalEntryTest();
          updateIssueEntryTest();
          updateWorkEntryTest();
        });

        describe('holiday', () => {
          beforeEach(() => {
            originalDay = {
              ...testDataFactory.calendar.day.response.holiday({
                day,
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };
          });
         
          updatePersonalEntryTest();
          updateIssueEntryTest();
          updateWorkEntryTest();
        });

        describe('weekend without planned work', () => {
          beforeEach(() => {
            originalDay = {
              ...testDataFactory.calendar.day.response.weekend({
                day,
                start: undefined,
                end: undefined,
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };
          });
         
          updatePersonalEntryTest();
          updateIssueEntryTest();
          updateWorkEntryTest();
        });

        describe('workday', () => {    
          beforeEach(() => {
            originalDay = {
              ...testDataFactory.calendar.day.response.workday({
                day,
                start: WORKDAY_START,
                end: WORKDAY_END,
              }),
              calculatedStart: WORKDAY_START,
              calculatedEnd: WORKDAY_END,
            };
          });
         
          updatePersonalEntryTest();
          updateIssueEntryTest();

          testCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
            it(`should update work entry with limits recalculated #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
              originalEntry = testDataFactory.calendar.entry.response.work({
                calendarEntryId,
                day,
              });

              const untouchedEntry = testDataFactory.calendar.entry.response.work({
                day,
                start: latestEnd - 1,
                end: latestEnd,
              });

              originalDay = {
                ...testDataFactory.calendar.day.response.workday({
                  day,
                  entries: [
                    originalEntry,
                    untouchedEntry,
                  ],
                  start: plannedStart,
                  end: plannedEnd,
                }),                
                calculatedStart: undefined,
                calculatedEnd: undefined,
              };

              initialState = {
                [day]: originalDay,
              };
            
              const customerResponse = testDataFactory.customer.response();
              const request = testDataFactory.calendar.entry.request.work({
                body: {
                  day,
                  start: earliestStart,
                  end: earliestStart + 1,
                },
              });
              const action = calendarApiActions.updateCalendarEntryCompleted({
                calendarEntryId,
                day,
                ...request,
                customer: customerResponse,
              });

              const state = calendarReducer(initialState, action);

              const { start, end, description, title, entryType } = request;
              expect(state).toEqual({
                [day]: {
                  ...originalDay,
                  calculatedStart,
                  calculatedEnd,
                  entries: [
                    {
                      calendarEntryId,
                      day,
                      start,
                      end,
                      description,
                      title,
                      prices: undefined,
                      resolution: undefined,
                      entryType,
                      customer: customerResponse,
                    },
                    untouchedEntry,
                  ],
                },
              });
            });
          });
        });
      });

      describe('on different', () => {
        let dayFrom: string;
        let dayTo: string;
        let originalDayFrom: LimitedCalendarDay;
        let originalDayTo: LimitedCalendarDay;
        let originalEntry: Calendar.Entry.Response;

        beforeEach(() => {
          dayFrom = testDataFactory.calendar.day.pastDay();
          dayTo = testDataFactory.calendar.day.futureDay();
        });

        const updatePersonalEntryTest = () => {
          it('should update personal entry', () => {
            originalEntry = testDataFactory.calendar.entry.response.personal({
              calendarEntryId,
              day: dayFrom,
            });

            initialState = {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [originalEntry],
              },
              [dayTo]: originalDayTo,
            };

            const request = testDataFactory.calendar.entry.request.personal({
              day: dayTo,
            });
            const action = calendarApiActions.updateCalendarEntryCompleted({
              calendarEntryId,
              day: dayTo,
              ...request,
              customer: undefined,
            });

            const state = calendarReducer(initialState, action);
            expect(state).toEqual({
              [dayFrom]: {
                ...originalDayFrom,
                entries: [],
              },
              [dayTo]: {
                ...originalDayTo,
                entries: [
                  {
                    calendarEntryId,
                    ...request,
                  },
                ],
              },
            });
          });
        };
        const updateIssueEntryTest = () => {
          it('should update issue entry', () => {
            originalEntry = testDataFactory.calendar.entry.response.issue({
              calendarEntryId,
              day: dayFrom,
            });

            initialState = {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [originalEntry],
              },
              [dayTo]: originalDayTo,
            };

            const request = testDataFactory.calendar.entry.request.issue({
              day: dayTo,
            });
            const action = calendarApiActions.updateCalendarEntryCompleted({
              calendarEntryId,
              day: dayTo,
              ...request,
              customer: undefined,
            });

            const state = calendarReducer(initialState, action);
            expect(state).toEqual({
              [dayFrom]: {
                ...originalDayFrom,
                entries: [],
              },
              [dayTo]: {
                ...originalDayTo,
                entries: [
                  {
                    calendarEntryId,
                    ...request,
                  },
                ],
              },
            });
          });
        };
        const updateWorkEntryTest = () => {
          it('should update work entry', () => {
            originalEntry = testDataFactory.calendar.entry.response.work({
              calendarEntryId,
              day: dayFrom,
            });

            initialState = {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [originalEntry],
              },
              [dayTo]: originalDayTo,
            };
            
            const customerResponse = testDataFactory.customer.response();
            const request = testDataFactory.calendar.entry.request.work({
              body: {
                day: dayTo,
              },
            });
            const action = calendarApiActions.updateCalendarEntryCompleted({
              calendarEntryId,
              day: dayTo,
              ...request,
              customer: customerResponse,
            });

            const state = calendarReducer(initialState, action);

            const { start, end, description, title, entryType } = request;
            expect(state).toEqual({
              [dayFrom]: {
                ...originalDayFrom,
                entries: [ ],
              },
              [dayTo]: {
                ...originalDayTo,
                entries: [
                  {
                    calendarEntryId,
                    day: dayTo,
                    start,
                    end,
                    description,
                    title,
                    prices: undefined,
                    resolution: undefined,
                    entryType,
                    customer: customerResponse,
                  },
                ],
              },
            });
          });
        };

        describe('vacation days', () => {
          beforeEach(() => {
            originalDayFrom = {
              ...testDataFactory.calendar.day.response.vacation({
                day: dayFrom,
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };

            originalDayTo = {
              ...testDataFactory.calendar.day.response.vacation({
                day: dayTo,
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };
          });

          updatePersonalEntryTest();
          updateIssueEntryTest();
          updateWorkEntryTest();
        });

        describe('holidays', () => {
          beforeEach(() => {
            originalDayFrom = {
              ...testDataFactory.calendar.day.response.holiday({
                day: dayFrom,
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };

            originalDayTo = {
              ...testDataFactory.calendar.day.response.holiday({
                day: dayTo,
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };
          });

          updatePersonalEntryTest();
          updateIssueEntryTest();
          updateWorkEntryTest();
        });

        describe('weekends without planned work', () => {
          beforeEach(() => {
            originalDayFrom = {
              ...testDataFactory.calendar.day.response.weekend({
                day: dayFrom,
                start: undefined,
                end: undefined,
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };

            originalDayTo = {
              ...testDataFactory.calendar.day.response.weekend({
                day: dayTo,
                start: undefined,
                end: undefined,
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };
          });

          updatePersonalEntryTest();
          updateIssueEntryTest();
          updateWorkEntryTest();
        });

        describe('workdays', () => {
          beforeEach(() => {
            originalDayFrom = {
              ...testDataFactory.calendar.day.response.workday({
                day: dayFrom,
                start: WORKDAY_START,
                end: WORKDAY_END,
              }),
              calculatedStart: WORKDAY_START,
              calculatedEnd: WORKDAY_END,
            };

            originalDayTo = {
              ...testDataFactory.calendar.day.response.workday({
                day: dayTo,
                start: WORKDAY_START,
                end: WORKDAY_END,
              }),
              calculatedStart: WORKDAY_START,
              calculatedEnd: WORKDAY_END,
            };
          });

          updatePersonalEntryTest();
          updateIssueEntryTest();

          testCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
            it(`should update work entry with limits recalculated #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
              originalEntry = testDataFactory.calendar.entry.response.work({
                calendarEntryId,
                day: dayFrom,
              });

              const untouchedEntry = testDataFactory.calendar.entry.response.work({
                day: dayTo,
                start: latestEnd - 1,
                end: latestEnd,
              });

              originalDayFrom = {
                ...testDataFactory.calendar.day.response.workday({
                  day: dayFrom,
                  start: plannedStart,
                  end: plannedEnd,
                  entries: [originalEntry],
                }),
                calculatedStart: undefined,
                calculatedEnd: undefined,
              };

              originalDayTo = {
                ...testDataFactory.calendar.day.response.workday({
                  day: dayTo,
                  start: plannedStart,
                  end: plannedEnd,
                  entries: [untouchedEntry],
                }),
                calculatedStart: undefined,
                calculatedEnd: undefined,
              };

              initialState = {
                [dayFrom]: originalDayFrom,
                [dayTo]: originalDayTo,
              };
            
              const customerResponse = testDataFactory.customer.response();
              const request = testDataFactory.calendar.entry.request.work({
                body: {
                  day: dayTo,
                  start: earliestStart,
                  end: earliestStart + 1,
                },
              });
              const action = calendarApiActions.updateCalendarEntryCompleted({
                calendarEntryId,
                day: dayTo,
                ...request,
                customer: customerResponse,
              });

              const state = calendarReducer(initialState, action);

              const { start, end, description, title, entryType } = request;
              expect(state).toEqual({
                [dayFrom]: {
                  ...originalDayFrom,
                  calculatedStart: plannedStart,
                  calculatedEnd: plannedEnd,
                  entries: [ ],
                },
                [dayTo]: {
                  ...originalDayTo,
                  calculatedStart,
                  calculatedEnd,
                  entries: [
                    {
                      calendarEntryId,
                      day: dayTo,
                      start,
                      end,
                      description,
                      title,
                      prices: undefined,
                      resolution: undefined,
                      entryType,
                      customer: customerResponse,
                    },
                    untouchedEntry,
                  ],
                },
              });
            });
          });

        });
      });
    });

    describe('On Delete calendar entry completed', () => {
      let day: string;
      let originalDay: LimitedCalendarDay;
      let calendarEntryId: Calendar.Entry.Id;
      let originalEntry: Calendar.Entry.Response;

      beforeEach(() => {
        day = testDataFactory.calendar.day.futureDay();
        calendarEntryId = testDataFactory.calendar.entry.id();
      });

      const deletePersonalEntryTest = () => {
        it('should delete a personal entry', () => { 
          originalEntry = testDataFactory.calendar.entry.response.personal({
            calendarEntryId,
            day,
          });

          initialState = {
            [day]: {
              ...originalDay,
              entries: [originalEntry],
            },
          };

          const action = calendarApiActions.deleteCalendarEntryCompleted({
            calendarEntryId,
          });

          const state = calendarReducer(initialState, action);

          expect(state).toEqual({
            [day]: {
              ...originalDay,
              entries: [],
            },
          });
        });
      };

      const deleteIssueEntryTest = () => {
        it('should delete a issue entry', () => { 
          originalEntry = testDataFactory.calendar.entry.response.issue({
            calendarEntryId,
            day,
          });

          initialState = {
            [day]: {
              ...originalDay,
              entries: [originalEntry],
            },
          };

          const action = calendarApiActions.deleteCalendarEntryCompleted({
            calendarEntryId,
          });

          const state = calendarReducer(initialState, action);

          expect(state).toEqual({
            [day]: {
              ...originalDay,
              entries: [],
            },
          });
        });
      };

      const deleteWorkEntryTest = () => {
        it('should delete a work entry', () => { 
          originalEntry = testDataFactory.calendar.entry.response.work({
            calendarEntryId,
            day,
          });

          initialState = {
            [day]: {
              ...originalDay,
              entries: [originalEntry],
            },
          };

          const action = calendarApiActions.deleteCalendarEntryCompleted({
            calendarEntryId,
          });

          const state = calendarReducer(initialState, action);

          expect(state).toEqual({
            [day]: {
              ...originalDay,
              entries: [],
            },
          });
        });
      };

      describe('from a vacation', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.vacation({
              day,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };
        });

        deletePersonalEntryTest();
        deleteIssueEntryTest();
        deleteWorkEntryTest();
      });

      describe('from a holiday', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.holiday({
              day,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };
        });

        deletePersonalEntryTest();
        deleteIssueEntryTest();
        deleteWorkEntryTest();
      });

      describe('from a weekend without planned work', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.weekend({
              day,
              start: undefined,
              end: undefined,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };
        });

        deletePersonalEntryTest();
        deleteIssueEntryTest();
        deleteWorkEntryTest();
      });

      describe('from a workday', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.workday({
              day,
              start: WORKDAY_START,
              end: WORKDAY_END,
            }),
            calculatedStart: WORKDAY_START,
            calculatedEnd: WORKDAY_END,
          };
        });

        deletePersonalEntryTest();
        deleteIssueEntryTest();

        testCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should delete work entry with limits recalculated #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            originalEntry = testDataFactory.calendar.entry.response.work({
              calendarEntryId,
              day,
            });

            const earliestEntry = testDataFactory.calendar.entry.response.work({
              day,
              start: earliestStart,
              end: earliestStart + 1,
            });

            const latestEntry = testDataFactory.calendar.entry.response.work({
              day,
              start: latestEnd - 1,
              end: latestEnd,
            });

            originalDay = {
              ...testDataFactory.calendar.day.response.workday({
                day,
                start: plannedStart,
                end: plannedEnd,
                entries: [
                  earliestEntry,
                  originalEntry,
                  latestEntry,
                ],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };

            initialState = {
              [day]: originalDay,
            };

            const action = calendarApiActions.deleteCalendarEntryCompleted({
              calendarEntryId,
            });

            const state = calendarReducer(initialState, action);

            expect(state).toEqual({
              [day]: {
                ...originalDay,
                entries: [
                  earliestEntry,
                  latestEntry,
                ],
                calculatedStart,
                calculatedEnd,
              },
            });
          });
        });
      });
    });

    describe('On Resolve calendar work entry completed', () => {
      let day: string;
      let calendarEntryId: Calendar.Entry.Id;
      let originalDay: LimitedCalendarDay;
      let originalEntry: Calendar.Entry.WorkEntryResponse;

      beforeEach(() => {
        day = testDataFactory.calendar.day.pastDay();
        calendarEntryId = testDataFactory.calendar.entry.id();
        originalEntry = testDataFactory.calendar.entry.response.work({
          calendarEntryId,
          day,
        });
        originalDay = {
          ...testDataFactory.calendar.day.response.workday({
            day,
            entries: [originalEntry],
            start: WORKDAY_START,
            end: WORKDAY_END,
          }),
          calculatedStart: WORKDAY_START,
          calculatedEnd: WORKDAY_END,
        };
        initialState = {
          [day]: originalDay,
        };
      });

      describe('should resolve work entry', () => {
        it('with no show', () => {        
          const request = testDataFactory.calendar.entry.resolution.request({
            status: CalendarEntryResolutionStatus.NoShow,
          });
          const action = calendarApiActions.resolveCalendarWorkEntryCompleted({
            day,
            calendarEntryId,
            ...request,
          });
  
          const state = calendarReducer(initialState, action);
          expect(state).toEqual({
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...originalEntry,
                  resolution: {
                    status: CalendarEntryResolutionStatus.NoShow,
                    delay: undefined,
                  },
                },
              ],
            }, 
          });
        });
  
        it('with paid', () => {     
          const delay = 5;   
          const request = testDataFactory.calendar.entry.resolution.request({
            status: CalendarEntryResolutionStatus.Paid,
            delay,
          });
          const action = calendarApiActions.resolveCalendarWorkEntryCompleted({
            day,
            calendarEntryId,
            ...request,
          });
  
          const state = calendarReducer(initialState, action);
          expect(state).toEqual({
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...originalEntry,
                  resolution: {
                    status: CalendarEntryResolutionStatus.Paid,
                    delay,
                  },
                },
              ],
            }, 
          });
        });
  
        it('with pending transfer', () => {     
          const delay = 5;   
          const request = testDataFactory.calendar.entry.resolution.request({
            status: CalendarEntryResolutionStatus.PendingTransfer,
            delay,
          });
          const action = calendarApiActions.resolveCalendarWorkEntryCompleted({
            day,
            calendarEntryId,
            ...request,
          });
  
          const state = calendarReducer(initialState, action);
          expect(state).toEqual({
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...originalEntry,
                  resolution: {
                    status: CalendarEntryResolutionStatus.PendingTransfer,
                    delay,
                  },
                },
              ],
            }, 
          });
        });
      });
    });
  });
});

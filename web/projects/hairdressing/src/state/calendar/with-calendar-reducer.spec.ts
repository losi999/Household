import { TestBed } from '@angular/core/testing';
import { calendarApiEvents } from '@hairdressing/state/calendar/calendar-events';
import { CalendarState } from '@hairdressing/state/calendar/calendar-store';
import { withCalendarReducer } from '@hairdressing/state/calendar/with-calendar-reducer';
import { dayLimitTestCases, defaultDayLimitTestCases } from '@hairdressing/testing/day-limit-test-data';
import { LimitedCalendarDay } from '@hairdressing/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarDayType, CalendarEntryResolutionStatus } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { signalStore, withState } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';

const createTestStore = (state: CalendarState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<CalendarState>(state), withCalendarReducer());
};

describe('withCalendarReducer', () => {
  let initialState: CalendarState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const validateState = (currentValue?: Partial<CalendarState>) => {
    expect(store.days(), 'days').toEqual(Object.hasOwn(currentValue ?? {}, 'days') ? currentValue.days : initialState.days);
  };

  const setup = (initial?: Partial<CalendarState>) => {
    TestBed.resetTestingModule();

    initialState = {
      days: {},
      ...initial,
    };

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('listCalendarDaysCompleted', () => {
    let day: string;
    let workEntry: Responses.CalendarEntryWork;
    let issueEntry: Responses.CalendarEntryIssue;
    let personalEntry: Responses.CalendarEntryPersonal;

    beforeEach(() => {
      day = testDataFactory.calendar.day.futureWorkday();
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

    describe('should update store', () => {
      it('with holiday', () => {
        const dayResponse = testDataFactory.calendar.day.response.holiday({
          day,
          entries: [
            workEntry,
            personalEntry,
            issueEntry,
          ],
        });

        dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
        validateState({
          days: {
            [day]: {
              ...dayResponse,
              calculatedEnd: undefined,
              calculatedStart: undefined,
            },
          },
        });
      });

      it('with vacation', () => {
        const dayResponse = testDataFactory.calendar.day.response.vacation({
          day,
          entries: [
            workEntry,
            personalEntry,
            issueEntry,
          ],
        });

        dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
        validateState({
          days: {
            [day]: {
              ...dayResponse,
              calculatedEnd: undefined,
              calculatedStart: undefined,
            },
          },
        });
      });
      
      it('with weekend without planned work', () => {
        day = testDataFactory.calendar.day.futureWeekend();
        const dayResponse = testDataFactory.calendar.day.response.regular({
          day,
          entries: [
            workEntry,
            personalEntry,
            issueEntry,
          ],
          start: undefined,
          end: undefined,
        });

        dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
        validateState({
          days: {
            [day]: {
              ...dayResponse,
              calculatedEnd: undefined,
              calculatedStart: undefined,
            },
          },
        });
      });
      
      it('with weekend with planned work', () => {
        day = testDataFactory.calendar.day.futureWeekend();
        const dayResponse = testDataFactory.calendar.day.response.regular({
          day,
          entries: [
            personalEntry,
            issueEntry,
          ],
        });

        dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
        validateState({
          days: {
            [day]: {
              ...dayResponse,
              calculatedEnd: dayResponse.end,
              calculatedStart: dayResponse.start,
            },
          },
        });
      });
      
      it('with workday with planned work', () => {
        const dayResponse = testDataFactory.calendar.day.response.regular({
          day,
          entries: [
            personalEntry,
            issueEntry,
          ],
        });

        dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
        validateState({
          days: {
            [day]: {
              ...dayResponse,
              calculatedEnd: dayResponse.end,
              calculatedStart: dayResponse.start,
            },
          },
        });
      });

      describe('with work entry', () => {
        dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should calculate day limits #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            const dayResponse = testDataFactory.calendar.day.response.regular({
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

            dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
            validateState({
              days: {
                [day]: {
                  ...dayResponse,
                  calculatedEnd,
                  calculatedStart,
                },
              },
            });
          });
        });
      });
    });
  });

  describe('updateCalendarDayCompleted', () => {
    let day: string;
    let workEntry: Responses.CalendarEntryWork;
    let issueEntry: Responses.CalendarEntryIssue;
    let personalEntry: Responses.CalendarEntryPersonal;

    beforeEach(() => {
      day = testDataFactory.calendar.day.futureWorkday();
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

    describe('should update store', () => {
      it('to vacation', () => {
        setup({
          days: {
            [day]: {
              ...testDataFactory.calendar.day.response.regular({
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
          },
        });
        const request = testDataFactory.calendar.day.request.vacation();

        dispatcher.dispatch(calendarApiEvents.updateCalendarDayCompleted({
          day,
          ...request,
        }));
        validateState({
          days: {
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
          },
        });
      });

      it('to workday', () => {
        setup({
          days: {
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
          },
        });
        const request = testDataFactory.calendar.day.request.workday();

        dispatcher.dispatch(calendarApiEvents.updateCalendarDayCompleted({
          day,
          ...request,
        }));
        validateState({
          days: {
            [day]: {
              calculatedStart: request.start,
              calculatedEnd: request.end,
              dayType: CalendarDayType.Regular,
              start: request.start,
              end: request.end,
              entries: [
                personalEntry,
                issueEntry,
              ],
              day,
            },
          },
        });
      });

      it('weekend to workday', () => {
        day = testDataFactory.calendar.day.futureWeekend();

        setup({
          days: {
            [day]: {
              ...testDataFactory.calendar.day.response.regular({
                day,
                entries: [
                  personalEntry,
                  issueEntry,
                ],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            },
          },
        });
        const request = testDataFactory.calendar.day.request.workday();

        dispatcher.dispatch(calendarApiEvents.updateCalendarDayCompleted({
          day,
          ...request,
        }));
        validateState({
          days: {
            [day]: {
              calculatedStart: request.start,
              calculatedEnd: request.end,
              dayType: CalendarDayType.Regular,
              start: request.start,
              end: request.end,
              entries: [
                personalEntry,
                issueEntry,
              ],
              day,
            },
          },
        });
      });

      describe('with work entry', () => {
        dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should calculate day limits #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            const originalDay = testDataFactory.calendar.day.response.regular({
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

            setup({
              days: {
                [day]: {
                  ...originalDay,
                  calculatedStart: undefined,
                  calculatedEnd: undefined,
                },
              },
            });

            const request = testDataFactory.calendar.day.request.workday({
              start: plannedStart,
              end: plannedEnd,
            });

            dispatcher.dispatch(calendarApiEvents.updateCalendarDayCompleted({
              day,
              ...request,
            }));
            validateState({
              days: {
                [day]: {
                  ...originalDay,
                  calculatedStart: calculatedStart,
                  calculatedEnd: calculatedEnd,
                  dayType: CalendarDayType.Regular,
                  start: request.start,
                  end: request.end,
                },
              },
            });
          });
        });
      });
    });
  });

  describe('deleteCalendarDayCompleted', () => {
    let day: string;
    let issueEntry: Responses.CalendarEntryIssue;
    let personalEntry: Responses.CalendarEntryPersonal;

    beforeEach(() => {
      day = testDataFactory.calendar.day.futureWorkday();
      issueEntry = testDataFactory.calendar.entry.response.issue({
        day,
      });
      personalEntry = testDataFactory.calendar.entry.response.personal({
        day,
      });
    });

    it('should not change the store if the day is a holiday', () => {
      const holiday = {
        ...testDataFactory.calendar.day.response.holiday({
          day,
          entries: [personalEntry],
        }),
        calculatedStart: undefined,
        calculatedEnd: undefined,
      };
      setup({
        days: {
          [day]: holiday,
        },
      });

      dispatcher.dispatch(calendarApiEvents.deleteCalendarDayCompleted({
        day,
      }));

      validateState();
    });

    describe('should update store', () => {
      it('with vacation deleted', () => {
        setup({
          days: {
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
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarDayCompleted({
          day,
        }));

        validateState({
          days: {
            [day]: {
              calculatedStart: WORKDAY_START,
              calculatedEnd: WORKDAY_END,
              dayType: CalendarDayType.Regular,
              start: undefined,
              end: undefined,
              entries: [
                issueEntry,
                personalEntry,
              ],
              day,
            },
          },
        });
      });

      it('with planned work deleted from weekend', () => {
        day = testDataFactory.calendar.day.futureWeekend();
        setup({
          days: {
            [day]: {
              ...testDataFactory.calendar.day.response.regular({
                day,
                entries: [
                  issueEntry,
                  personalEntry,
                ],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            },
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarDayCompleted({
          day,
        }));

        validateState({
          days: {
            [day]: {
              calculatedStart: undefined,
              calculatedEnd: undefined,
              dayType: CalendarDayType.Regular,
              start: undefined,
              end: undefined,
              entries: [
                issueEntry,
                personalEntry,
              ],
              day,
            },
          },
        });
      });

      it('with planned work deleted from workday', () => {
        setup({
          days: {
            [day]: {
              ...testDataFactory.calendar.day.response.regular({
                day,
                entries: [
                  issueEntry,
                  personalEntry,
                ],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            },
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarDayCompleted({
          day,
        }));

        validateState({
          days: {
            [day]: {
              calculatedStart: WORKDAY_START,
              calculatedEnd: WORKDAY_END,
              dayType: CalendarDayType.Regular,
              start: undefined,
              end: undefined,
              entries: [
                issueEntry,
                personalEntry,
              ],
              day,
            },
          },
        });
      });

      describe('with work entry', () => {
        defaultDayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should recalculate limits of workday #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            const day = testDataFactory.calendar.day.futureWorkday();
            const originalDay = testDataFactory.calendar.day.response.regular({
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

            setup({
              days: {
                [day]: {
                  ...originalDay,
                  calculatedStart: undefined,
                  calculatedEnd: undefined,
                },
              },
            });

            dispatcher.dispatch(calendarApiEvents.deleteCalendarDayCompleted({
              day,
            }));

            validateState({
              days: {
                [day]: {
                  ...originalDay,
                  calculatedStart: calculatedStart,
                  calculatedEnd: calculatedEnd,
                  dayType: CalendarDayType.Regular,
                  start: undefined,
                  end: undefined,
                },
              },
            });
          });
        });
      });
    });
  });

  describe('createCalendarEntryCompleted', () => {
    let day: string;
    let originalDay: LimitedCalendarDay;
    let calendarEntryId: Api.Calendar.Entry.Id;

    beforeEach(() => {
      day = testDataFactory.calendar.day.futureWorkday();
      calendarEntryId = testDataFactory.calendar.entry.id();
    });

    const createPersonalEntryTest = () => {
      it('with a personal entry', () => {
        const request = testDataFactory.calendar.entry.request.personal({
          day,
        });
        dispatcher.dispatch(calendarApiEvents.createCalendarEntryCompleted({
          calendarEntryId,
          customer: undefined,
          ...request,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...request,
                  calendarEntryId,
                },
              ],
            },
          },
        });
      });
    };

    const createIssueEntryTest = () => {
      it('with a issue entry', () => {
        const request = testDataFactory.calendar.entry.request.issue({
          day,
        });

        dispatcher.dispatch(calendarApiEvents.createCalendarEntryCompleted({
          calendarEntryId,
          customer: undefined,
          ...request,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...request,
                  calendarEntryId,
                },
              ],
            },
          },
        });
      });
    };

    const createWorkEntryTest = () => {
      it('with a work entry', () => {
        const customerResponse = testDataFactory.customer.response();
        const request = testDataFactory.calendar.entry.request.work({
          body: {
            day,
          },
        });
        dispatcher.dispatch(calendarApiEvents.createCalendarEntryCompleted({
          calendarEntryId,
          customer: customerResponse,
          ...request,
        }));
          
        const { start, end, description, title, entryType, additionalPrice } = request;

        validateState({
          days: {
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
                  additionalPrice,
                  prices: undefined,
                  resolution: undefined,
                  entryType,
                  customer: customerResponse,
                },
              ],
            },
          },
        });
      });
    };

    describe('should update store', () => {
      describe('on a vacation', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.vacation({
              day,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };

          setup({
            days: {
              [day]: originalDay,
            },
          });
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

          setup({
            days: {
              [day]: originalDay,
            },
          });
        });

        createPersonalEntryTest();
        createIssueEntryTest();
        createWorkEntryTest();
      });

      describe('on a weekend without planned work', () => {
        beforeEach(() => {
          day = testDataFactory.calendar.day.futureWeekend();

          originalDay = {
            ...testDataFactory.calendar.day.response.regular({
              day,
              start: undefined,
              end: undefined,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };

          setup({
            days: {
              [day]: originalDay,
            },
          });
        });

        createPersonalEntryTest();
        createIssueEntryTest();
        createWorkEntryTest();
      });

      describe('on a workday', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.regular({
              day,
              start: WORKDAY_START,
              end: WORKDAY_END,
            }),
            calculatedStart: WORKDAY_START,
            calculatedEnd: WORKDAY_END,
          };

          setup({
            days: {
              [day]: originalDay,
            },
          });
        });

        createPersonalEntryTest();
        createIssueEntryTest();

        dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`with a work entry with limits recalculated #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            originalDay = {
              ...testDataFactory.calendar.day.response.regular({
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

            setup ({
              days: {
                [day]: originalDay,
              },
            });
            const customerResponse = testDataFactory.customer.response();
            const request = testDataFactory.calendar.entry.request.work({
              body: {
                day,
                start: earliestStart,
                end: earliestStart + 1,
              },
            });

            dispatcher.dispatch(calendarApiEvents.createCalendarEntryCompleted({
              calendarEntryId,
              customer: customerResponse,
              ...request,
            }));
          
            const { start, end, description, title, entryType, additionalPrice } = request;

            validateState({
              days: {
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
                      entryType,
                      additionalPrice,
                      prices: undefined,
                      resolution: undefined,
                      customer: customerResponse,
                    },
                    ...originalDay.entries,
                  ],
                },
              },
            });
          });
        });
      });
    });
  });

  describe('updateCalendarEntryCompleted', () => {
    let calendarEntryId: Api.Calendar.Entry.Id;
      
    beforeEach(() => {
      calendarEntryId = testDataFactory.calendar.entry.id(); 
    });

    describe('on the same', () => {
      let day: string;
      let originalDay: LimitedCalendarDay;
      let originalEntry: Responses.CalendarEntry;

      beforeEach(() => {
        day = testDataFactory.calendar.day.futureWorkday();
      });

      const updatePersonalEntryTest = () => {
        it('should update personal entry', () => {
          originalEntry = testDataFactory.calendar.entry.response.personal({
            calendarEntryId,
            day,
          });

          setup({
            days: {
              [day]: {
                ...originalDay,
                entries: [originalEntry],
              },

            },
          });

          const request = testDataFactory.calendar.entry.request.personal({
            day,
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day,
            ...request,
            customer: undefined,
          }));

          validateState({
            days: {
              [day]: {
                ...originalDay,
                entries: [
                  {
                    ...request,
                    calendarEntryId,
                  },
                ],
              },
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

          setup({
            days: {
              [day]: {
                ...originalDay,
                entries: [originalEntry],
              },

            },
          });

          const request = testDataFactory.calendar.entry.request.issue({
            day,
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day,
            ...request,
            customer: undefined,
          }));

          validateState({
            days: {
              [day]: {
                ...originalDay,
                entries: [
                  {
                    ...request,
                    calendarEntryId,
                  },
                ],
              },
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

          setup({
            days: {
              [day]: {
                ...originalDay,
                entries: [originalEntry],
              },

            },
          });
            
          const customerResponse = testDataFactory.customer.response();
          const request = testDataFactory.calendar.entry.request.work({
            body: {
              day,
            },
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day,
            ...request,
            customer: customerResponse,
          }));

          const { start, end, description, title, entryType, additionalPrice } = request;

          validateState({
            days: {
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
                    additionalPrice,
                    prices: undefined,
                    resolution: undefined,
                    entryType,
                    customer: customerResponse,
                  },
                ],
              },
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
          day = testDataFactory.calendar.day.futureWeekend();

          originalDay = {
            ...testDataFactory.calendar.day.response.regular({
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
            ...testDataFactory.calendar.day.response.regular({
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

        dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
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
              ...testDataFactory.calendar.day.response.regular({
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

            setup({
              days: {
                [day]: originalDay,
              },
            });

            const customerResponse = testDataFactory.customer.response();
            const request = testDataFactory.calendar.entry.request.work({
              body: {
                day,
                start: earliestStart,
                end: earliestStart + 1,
              },
            });

            dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
              calendarEntryId,
              day,
              ...request,
              customer: customerResponse,
            }));

            const { start, end, description, title, entryType, additionalPrice } = request;

            validateState({
              days: {
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
                      additionalPrice,
                      prices: undefined,
                      resolution: undefined,
                      entryType,
                      customer: customerResponse,
                    },
                    untouchedEntry,
                  ],
                },
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
      let originalEntry: Responses.CalendarEntry;

      beforeEach(() => {
        dayFrom = testDataFactory.calendar.day.pastWorkday();
        dayTo = testDataFactory.calendar.day.futureWorkday();
      });

      const updatePersonalEntryTest = () => {
        it('should update personal entry', () => {
          originalEntry = testDataFactory.calendar.entry.response.personal({
            calendarEntryId,
            day: dayFrom,
          });

          setup({
            days: {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [originalEntry],
              },
              [dayTo]: originalDayTo,
            },
          });

          const request = testDataFactory.calendar.entry.request.personal({
            day: dayTo,
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day: dayTo,
            ...request,
            customer: undefined,
          }));

          validateState({
            days: {
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

          setup({
            days: {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [originalEntry],
              },
              [dayTo]: originalDayTo,
            },
          });

          const request = testDataFactory.calendar.entry.request.issue({
            day: dayTo,
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day: dayTo,
            ...request,
            customer: undefined,
          }));

          validateState({
            days: {
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

          setup({
            days: {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [originalEntry],
              },
              [dayTo]: originalDayTo,
            },
          });
            
          const customerResponse = testDataFactory.customer.response();
          const request = testDataFactory.calendar.entry.request.work({
            body: {
              day: dayTo,
            },
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day: dayTo,
            ...request,
            customer: customerResponse,
          }));

          const { start, end, description, title, entryType, additionalPrice } = request;

          validateState({
            days: {
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
                    additionalPrice,
                    prices: undefined,
                    resolution: undefined,
                    entryType,
                    customer: customerResponse,
                  },
                ],
              },
            },
          });
        });
      };

      describe('vacation day', () => {
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

      describe('holiday', () => {
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

      describe('weekend without planned work', () => {
        beforeEach(() => {
          dayFrom = testDataFactory.calendar.day.pastWeekend();
          dayTo = testDataFactory.calendar.day.futureWeekend();

          originalDayFrom = {
            ...testDataFactory.calendar.day.response.regular({
              day: dayFrom,
              start: undefined,
              end: undefined,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };

          originalDayTo = {
            ...testDataFactory.calendar.day.response.regular({
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

      describe('workday', () => {
        beforeEach(() => {
          originalDayFrom = {
            ...testDataFactory.calendar.day.response.regular({
              day: dayFrom,
              start: WORKDAY_START,
              end: WORKDAY_END,
            }),
            calculatedStart: WORKDAY_START,
            calculatedEnd: WORKDAY_END,
          };

          originalDayTo = {
            ...testDataFactory.calendar.day.response.regular({
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

        dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
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
              ...testDataFactory.calendar.day.response.regular({
                day: dayFrom,
                start: plannedStart,
                end: plannedEnd,
                entries: [originalEntry],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };

            originalDayTo = {
              ...testDataFactory.calendar.day.response.regular({
                day: dayTo,
                start: plannedStart,
                end: plannedEnd,
                entries: [untouchedEntry],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };

            setup({
              days: {
                [dayFrom]: originalDayFrom,
                [dayTo]: originalDayTo,
              },
            });

            const customerResponse = testDataFactory.customer.response();
            const request = testDataFactory.calendar.entry.request.work({
              body: {
                day: dayTo,
                start: earliestStart,
                end: earliestStart + 1,
              },
            });

            dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
              calendarEntryId,
              day: dayTo,
              ...request,
              customer: customerResponse,
            }));

            const { start, end, description, title, entryType, additionalPrice } = request;

            validateState({
              days: {
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
                      additionalPrice,
                      prices: undefined,
                      resolution: undefined,
                      entryType,
                      customer: customerResponse,
                    },
                    untouchedEntry,
                  ],
                },
              },
            });
          
          });
        });
      });
      
    });
  });

  describe('deleteCalendarEntryCompleted', () => {
    let day: string;
    let originalDay: LimitedCalendarDay;
    let calendarEntryId: Api.Calendar.Entry.Id;
    let originalEntry: Responses.CalendarEntry;

    beforeEach(() => {
      day = testDataFactory.calendar.day.futureWorkday();
      calendarEntryId = testDataFactory.calendar.entry.id();
    });

    const deletePersonalEntryTest = () => {
      it('should delete a personal entry', () => { 
        originalEntry = testDataFactory.calendar.entry.response.personal({
          calendarEntryId,
          day,
        });

        setup({
          days: {
            [day]: {
              ...originalDay,
              entries: [originalEntry],
            },
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarEntryCompleted({
          calendarEntryId,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [],
            },
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

        setup({
          days: {
            [day]: {
              ...originalDay,
              entries: [originalEntry],
            },
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarEntryCompleted({
          calendarEntryId,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [],
            },
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

        setup({
          days: {
            [day]: {
              ...originalDay,
              entries: [originalEntry],
            },
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarEntryCompleted({
          calendarEntryId,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [],
            },
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
        day = testDataFactory.calendar.day.futureWeekend();

        originalDay = {
          ...testDataFactory.calendar.day.response.regular({
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
          ...testDataFactory.calendar.day.response.regular({
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

      dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
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
            ...testDataFactory.calendar.day.response.regular({
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

          setup({
            days: {
              [day]: originalDay,
            },
          });

          dispatcher.dispatch(calendarApiEvents.deleteCalendarEntryCompleted({
            calendarEntryId,
          }));

          validateState({
            days: {
              [day]: {
                ...originalDay,
                entries: [
                  earliestEntry,
                  latestEntry,
                ],
                calculatedStart,
                calculatedEnd,
              },
            },
          });
        });
      });
    });
  });

  describe('resolveCalendarWorkEntryCompleted', () => {
    let day: string;
    let calendarEntryId: Api.Calendar.Entry.Id;
    let originalDay: LimitedCalendarDay;
    let originalEntry: Responses.CalendarEntryWork;

    beforeEach(() => {
      day = testDataFactory.calendar.day.pastDay();
      calendarEntryId = testDataFactory.calendar.entry.id();
      originalEntry = testDataFactory.calendar.entry.response.work({
        calendarEntryId,
        day,
      });
      originalDay = {
        ...testDataFactory.calendar.day.response.regular({
          day,
          entries: [originalEntry],
          start: WORKDAY_START,
          end: WORKDAY_END,
        }),
        calculatedStart: WORKDAY_START,
        calculatedEnd: WORKDAY_END,
      };

      setup({
        days: {
          [day]: originalDay,
        },
      });
    });

    describe('should resolve work entry', () => {
      it('with no show', () => {
        const request = testDataFactory.calendar.entry.resolution.request({
          status: CalendarEntryResolutionStatus.NoShow,
        });

        dispatcher.dispatch(calendarApiEvents.resolveCalendarWorkEntryCompleted({
          calendarEntryId,
          day,
          ...request,
        }));

        validateState({
          days: {
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
          },
        });
      });

      it('with paid', () => {   
        const delay = 5;   
        const request = testDataFactory.calendar.entry.resolution.request({
          status: CalendarEntryResolutionStatus.Paid,
          delay,
        });

        dispatcher.dispatch(calendarApiEvents.resolveCalendarWorkEntryCompleted({
          calendarEntryId,
          day,
          ...request,
        }));

        validateState({
          days: {
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
          },
        });
      });

      it('with pending transfer', () => {   
        const delay = 5;   
        const request = testDataFactory.calendar.entry.resolution.request({
          status: CalendarEntryResolutionStatus.PendingTransfer,
          delay,
        });

        dispatcher.dispatch(calendarApiEvents.resolveCalendarWorkEntryCompleted({
          calendarEntryId,
          day,
          ...request,
        }));

        validateState({
          days: {
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
          },
        });
      });
    });
  });

  describe('listCalendarDaysCompleted merging', () => {
    it('should keep the days that are not part of the response', () => {
      const storedDay = testDataFactory.calendar.day.pastDay();
      const newDay = testDataFactory.calendar.day.futureWorkday();
      const storedResponse = {
        ...testDataFactory.calendar.day.response.vacation({
          day: storedDay,
          entries: [],
        }),
        calculatedStart: undefined,
        calculatedEnd: undefined,
      };
      setup({
        days: {
          [storedDay]: storedResponse,
        },
      });
      const newResponse = testDataFactory.calendar.day.response.holiday({
        day: newDay,
        entries: [],
      });

      dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([newResponse]));

      validateState({
        days: {
          [storedDay]: storedResponse,
          [newDay]: {
            ...newResponse,
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        },
      });
    });
  });

  describe('resolveCalendarWorkEntryCompleted other entries', () => {
    it('should leave the other entries of the day untouched', () => {
      const day = testDataFactory.calendar.day.pastDay();
      const entryId = testDataFactory.calendar.entry.id();
      const resolvedEntry = testDataFactory.calendar.entry.response.work({
        calendarEntryId: entryId,
        day,
      });
      const otherEntry = testDataFactory.calendar.entry.response.work({
        day,
      });
      const originalDay = {
        ...testDataFactory.calendar.day.response.regular({
          day,
          entries: [
            resolvedEntry,
            otherEntry,
          ],
        }),
        calculatedStart: WORKDAY_START,
        calculatedEnd: WORKDAY_END,
      };
      setup({
        days: {
          [day]: originalDay,
        },
      });
      const request = testDataFactory.calendar.entry.resolution.request({
        status: CalendarEntryResolutionStatus.Paid,
        delay: 3,
      });

      dispatcher.dispatch(calendarApiEvents.resolveCalendarWorkEntryCompleted({
        calendarEntryId: entryId,
        day,
        ...request,
      }));

      validateState({
        days: {
          [day]: {
            ...originalDay,
            entries: [
              {
                ...resolvedEntry,
                resolution: {
                  status: CalendarEntryResolutionStatus.Paid,
                  delay: 3,
                },
              },
              otherEntry,
            ],
          },
        },
      });
    });
  });
});

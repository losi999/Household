import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Calendar, Customer, Price } from '@household/shared/types/types';
import { calendarDayDataFactory, calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { default as schema } from '@household/test/api/schemas/calendar-day-response-list';

const permissionMap = allowUsers('hairdresser');

describe('GET /calendar/v1/days', () => {
  let customerDocument: Customer.Document;
  let priceDocument: Price.Document;
  let day: string;
  let calendarEntryDocument: Calendar.Entry.Document;
  let calendarDayDocument: Calendar.Day.Document;

  beforeEach(() => {

    customerDocument = customerDataFactory.document();
    priceDocument = priceDataFactory.document();          
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestListCalendarDays({
          dateFrom: calendarDayDataFactory.pastDay(),
          dateTo: calendarDayDataFactory.futureDay(),
        })
        .expectUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestListCalendarDays({
              dateFrom: calendarDayDataFactory.pastDay(),
              dateTo: calendarDayDataFactory.futureDay(),
            })
            .expectForbiddenResponse();
        });
      } else {
        describe('should return', () => {
          describe('workday', () => {
            beforeEach(() => {
              day = '2025-10-20';
            });

            describe('without custom limits', () => {
              it('with a personal entry', () => {
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Personal,
                  body: {
                    day,
                  },
                });
                cy.clearCalendarDay(day)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument);
              });

              it('with an issue entry', () => {
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Issue,
                  body: {
                    day,
                  },
                });
                cy.clearCalendarDay(day)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument);
              });

              it('with a work entry', () => {
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Work,
                  body: {
                    day,
                  },
                  customer: customerDocument,
                  prices: {
                    custom: [{}],
                    listed: [
                      {
                        price: priceDocument,
                      },
                    ],
                  },
                });
                cy.clearCalendarDay(day)
                  .saveCustomerDocument(customerDocument)
                  .savePriceDocument(priceDocument)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument);
              });
            });

            describe('with custom limits', () => {
              it('with a personal entry', () => {
                calendarDayDocument = calendarDayDataFactory.document({
                  day,
                  dayType: CalendarDayType.Workday,
                });
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Personal,
                  body: {
                    day,
                  },
                });
                cy.clearCalendarDay(day)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
              });

              it('with an issue entry', () => {
                calendarDayDocument = calendarDayDataFactory.document({
                  day,
                  dayType: CalendarDayType.Workday,
                });
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Issue,
                  body: {
                    day,
                  },
                });
                cy.clearCalendarDay(day)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
              });

              it('with a work entry narrowing the limits', () => {
                calendarDayDocument = calendarDayDataFactory.document({
                  day,
                  dayType: CalendarDayType.Workday,
                  body: {},
                });
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Work,
                  body: {
                    day,
                  },
                  customer: customerDocument,
                  prices: {
                    custom: [{}],
                    listed: [
                      {
                        price: priceDocument,
                      },
                    ],
                  },
                });
                cy.clearCalendarDay(day)
                  .saveCustomerDocument(customerDocument)
                  .savePriceDocument(priceDocument)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
              });
            });
          });

          describe('weekend', () => {
            beforeEach(() => {
              day = '2025-10-19';
            });

            describe('without custom limits', () => {
              it('with a personal entry', () => {
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Personal,
                  body: {
                    day,
                  },
                });
                cy.clearCalendarDay(day)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument);
              });

              it('with an issue entry', () => {
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Issue,
                  body: {
                    day,
                  },
                });
                cy.clearCalendarDay(day)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument);
              });

              it('with a work entry', () => {
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Work,
                  body: {
                    day,
                  },
                  customer: customerDocument,
                  prices: {
                    custom: [{}],
                    listed: [
                      {
                        price: priceDocument,
                      },
                    ],
                  },
                });

                cy.clearCalendarDay(day)
                  .saveCustomerDocument(customerDocument)
                  .savePriceDocument(priceDocument)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument);
              });
            });

            describe('with custom limits', () => {
              it('with a personal entry', () => {
                calendarDayDocument = calendarDayDataFactory.document({
                  day,
                  dayType: CalendarDayType.Workday,
                });
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Personal,
                  body: {
                    day,
                  },
                });
                cy.clearCalendarDay(day)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
              });

              it('with an issue entry', () => {
                calendarDayDocument = calendarDayDataFactory.document({
                  day,
                  dayType: CalendarDayType.Workday,
                });
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Issue,
                  body: {
                    day,
                  },
                });
                cy.clearCalendarDay(day)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
              });

              it('with a work entry', () => {
                calendarDayDocument = calendarDayDataFactory.document({
                  day,
                  dayType: CalendarDayType.Workday,
                });
                calendarEntryDocument = calendarEntryDataFactory.document({
                  entryType: CalendarEntryType.Work,
                  body: {
                    day,
                  },
                  customer: customerDocument,
                  prices: {
                    custom: [{}],
                    listed: [
                      {
                        price: priceDocument,
                      },
                    ],
                  },
                });
                cy.clearCalendarDay(day)
                  .saveCustomerDocument(customerDocument)
                  .savePriceDocument(priceDocument)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
              });
            });
          });

          describe('holiday', () => {
            beforeEach(() => {
              day = '2025-10-23';
            });

            it('with a personal entry', () => {
              calendarDayDocument = calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Holiday,
              });
              calendarEntryDocument = calendarEntryDataFactory.document({
                entryType: CalendarEntryType.Personal,
                body: {
                  day,
                },
              });
              cy.clearCalendarDay(day)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
            });

            it('with an issue entry', () => {
              calendarDayDocument = calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Holiday,
              });
              calendarEntryDocument = calendarEntryDataFactory.document({
                entryType: CalendarEntryType.Issue,
                body: {
                  day,
                },
              });
              cy.clearCalendarDay(day)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
            });

            it('with a work entry', () => {
              calendarDayDocument = calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Holiday,
              });
              calendarEntryDocument = calendarEntryDataFactory.document({
                entryType: CalendarEntryType.Work,
                body: {
                  day,
                },
                customer: customerDocument,
                prices: {
                  custom: [{}],
                  listed: [
                    {
                      price: priceDocument,
                    },
                  ],
                },
              });
              cy.clearCalendarDay(day)
                .saveCustomerDocument(customerDocument)
                .savePriceDocument(priceDocument)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
            });
          });

          describe('vacation', () => {
            beforeEach(() => {
              day = '2025-10-22';
            });

            it('with a personal entry', () => {
              calendarDayDocument = calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Vacation,
              });
              calendarEntryDocument = calendarEntryDataFactory.document({
                entryType: CalendarEntryType.Personal,
                body: {
                  day,
                },
              });
              cy.clearCalendarDay(day)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
            });

            it('with an issue entry', () => {
              calendarDayDocument = calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Vacation,
              });
              calendarEntryDocument = calendarEntryDataFactory.document({
                entryType: CalendarEntryType.Issue,
                body: {
                  day,
                },
              });
              cy.clearCalendarDay(day)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
            });

            it('with a work entry', () => {
              calendarDayDocument = calendarDayDataFactory.document({
                day,
                dayType: CalendarDayType.Vacation,
              });
              calendarEntryDocument = calendarEntryDataFactory.document({
                entryType: CalendarEntryType.Work,
                body: {
                  day,
                },
                customer: customerDocument,
                prices: {
                  custom: [{}],
                  listed: [
                    {
                      price: priceDocument,
                    },
                  ],
                },
              });
              cy.clearCalendarDay(day)
                .saveCustomerDocument(customerDocument)
                .savePriceDocument(priceDocument)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarEntryDocument, calendarDayDocument);
            });
          });
        });

        describe('should return error', () => {    
          describe('if dateFrom', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestListCalendarDays({
                  dateTo: calendarDayDataFactory.futureDay(),
                } as Calendar.DateRange)
                .expectBadRequestResponse()
                .expectRequiredProperty('dateFrom', 'queryStringParameters');
            });

            it('is not a date', () => {
              cy.authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: 'not a date',
                  dateTo: calendarDayDataFactory.futureDay(),
                })
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('dateFrom', 'date', 'queryStringParameters');
            });
          }); 

          describe('if dateTo', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: calendarDayDataFactory.pastDay(),
                } as Calendar.DateRange)
                .expectBadRequestResponse()
                .expectRequiredProperty('dateTo', 'queryStringParameters');
            });

            it('is not a date', () => {
              cy.authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: calendarDayDataFactory.pastDay(),
                  dateTo: 'not a date',
                })
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('dateTo', 'date', 'queryStringParameters');
            });

            it('is earlier than dateFrom', () => {
              cy.authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: calendarDayDataFactory.futureDay(),
                  dateTo: calendarDayDataFactory.pastDay(),
                })
                .expectBadRequestResponse()
                .expectTooEarlyDateProperty('dateTo', false, 'queryStringParameters');
            });
          }); 
        });
      }
    });
  });
});

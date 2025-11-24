import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Calendar, Customer, Price } from '@household/shared/types/types';
import { calendarDayDataFactory, calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { default as schema } from '@household/test/api/schemas/calendar-day-response-list';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';

const permissionMap = allowUsers('hairdresser');

describe('GET /calendar/v1/days', () => {
  let customerDocument: Customer.Document;
  let blacklistedCustomerDocument: Customer.Document;
  let priceDocument: Price.Document;
  let day: string;
  let calendarPersonalEntryDocument: Calendar.Entry.Document;
  let calendarIssueEntryDocument: Calendar.Entry.Document;
  let calendarWorkEntryDocument: Calendar.Entry.Document;
  let calendarDayDocument: Calendar.Day.Document;

  beforeEach(() => {
    day = '2025-10-20';
              
    priceDocument = priceDataFactory.document();     
    blacklistedCustomerDocument = customerDataFactory.document();     
    customerDocument = customerDataFactory.document({
      blacklistedCustomers: [blacklistedCustomerDocument],
      jobs: [
        {
          prices: {
            listed: [
              {
                price: priceDocument,
              },
            ],
          },
        },
      ],
    });

    calendarPersonalEntryDocument = calendarEntryDataFactory.document.personal({
      day,
    });

    calendarIssueEntryDocument = calendarEntryDataFactory.document.issue({
      day,
    });

    calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
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
      resolution: { 
        status: CalendarEntryResolutionStatus.Paid,
        delay: 30,
      },
    });
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
            describe('without custom limits', () => {
              it('with a personal entry', () => {
                cy.clearCalendarDay(day)
                  .saveCalendarEntryDocument(calendarPersonalEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarPersonalEntryDocument);
              });

              it('with an issue entry', () => {
                cy.clearCalendarDay(day)
                  .saveCalendarEntryDocument(calendarIssueEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarIssueEntryDocument);
              });

              it('with a work entry', () => {
                cy.clearCalendarDay(day)
                  .saveCustomerDocuments([
                    customerDocument,
                    blacklistedCustomerDocument,
                  ])
                  .savePriceDocument(priceDocument)
                  .saveCalendarEntryDocument(calendarWorkEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarWorkEntryDocument);
              });
            });

            describe('with custom limits', () => {
              beforeEach(() => {
                calendarDayDocument = calendarDayDataFactory.document.work({
                  day,
                });
              });

              it('with a personal entry', () => {
                cy.clearCalendarDay(day)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarPersonalEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarPersonalEntryDocument, calendarDayDocument);
              });

              it('with an issue entry', () => {
                cy.clearCalendarDay(day)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarIssueEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarIssueEntryDocument, calendarDayDocument);
              });

              it('with a work entry', () => {
                cy.clearCalendarDay(day)
                  .saveCustomerDocuments([
                    customerDocument,
                    blacklistedCustomerDocument,
                  ])
                  .savePriceDocument(priceDocument)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarWorkEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarWorkEntryDocument, calendarDayDocument);
              });
            });
          });

          describe('weekend', () => {
            beforeEach(() => {
              day = '2025-10-19';

              calendarPersonalEntryDocument = calendarEntryDataFactory.document.personal({
                day,
              });

              calendarIssueEntryDocument = calendarEntryDataFactory.document.issue({
                day,
              });

              calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
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
                resolution: { 
                  status: CalendarEntryResolutionStatus.Paid,
                  delay: 30,
                },
              });
            });

            describe('without custom limits', () => {
              it('with a personal entry', () => {
                cy.clearCalendarDay(day)
                  .saveCalendarEntryDocument(calendarPersonalEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarPersonalEntryDocument);
              });

              it('with an issue entry', () => {
                cy.clearCalendarDay(day)
                  .saveCalendarEntryDocument(calendarIssueEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarIssueEntryDocument);
              });

              it('with a work entry', () => {
                cy.clearCalendarDay(day)
                  .saveCustomerDocuments([
                    customerDocument,
                    blacklistedCustomerDocument,
                  ])
                  .savePriceDocument(priceDocument)
                  .saveCalendarEntryDocument(calendarWorkEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarWorkEntryDocument);
              });
            });

            describe('with custom limits', () => {
              beforeEach(() => {
                calendarDayDocument = calendarDayDataFactory.document.work({
                  day,
                });
              });

              it('with a personal entry', () => {
                cy.clearCalendarDay(day)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarPersonalEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarPersonalEntryDocument, calendarDayDocument);
              });

              it('with an issue entry', () => {
                cy.clearCalendarDay(day)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarIssueEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarIssueEntryDocument, calendarDayDocument);
              });

              it('with a work entry', () => {
                cy.clearCalendarDay(day)
                  .saveCustomerDocuments([
                    customerDocument,
                    blacklistedCustomerDocument,
                  ])
                  .savePriceDocument(priceDocument)
                  .saveCalendarDayDocument(calendarDayDocument)
                  .saveCalendarEntryDocument(calendarWorkEntryDocument)
                  .authenticate(userType)
                  .requestListCalendarDays({
                    dateFrom: day,
                    dateTo: day,
                  })
                  .expectOkResponse()
                  .expectValidResponseSchema(schema)
                  .validateInCalendarDayResponseList(day, calendarWorkEntryDocument, calendarDayDocument);
              });
            });
          });

          describe('holiday', () => {
            beforeEach(() => {
              calendarDayDocument = calendarDayDataFactory.document.holiday({
                day,
              });
            });
            it('with a personal entry', () => {
              cy.clearCalendarDay(day)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarPersonalEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarPersonalEntryDocument, calendarDayDocument);
            });

            it('with an issue entry', () => {
              cy.clearCalendarDay(day)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarIssueEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarIssueEntryDocument, calendarDayDocument);
            });

            it('with a work entry', () => {
              cy.clearCalendarDay(day)
                .saveCustomerDocuments([
                  customerDocument,
                  blacklistedCustomerDocument,
                ])
                .savePriceDocument(priceDocument)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarWorkEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarWorkEntryDocument, calendarDayDocument);
            });
          });

          describe('vacation', () => {
            beforeEach(() => {
              calendarDayDocument = calendarDayDataFactory.document.vacation({
                day,
              });
            });

            it('with a personal entry', () => {
              cy.clearCalendarDay(day)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarPersonalEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarPersonalEntryDocument, calendarDayDocument);
            });

            it('with an issue entry', () => {
              cy.clearCalendarDay(day)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarIssueEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarIssueEntryDocument, calendarDayDocument);
            });

            it('with a work entry', () => {
              cy.clearCalendarDay(day)
                .saveCustomerDocuments([
                  customerDocument,
                  blacklistedCustomerDocument,
                ])
                .savePriceDocument(priceDocument)
                .saveCalendarDayDocument(calendarDayDocument)
                .saveCalendarEntryDocument(calendarWorkEntryDocument)
                .authenticate(userType)
                .requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day,
                })
                .expectOkResponse()
                .expectValidResponseSchema(schema)
                .validateInCalendarDayResponseList(day, calendarWorkEntryDocument, calendarDayDocument);
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

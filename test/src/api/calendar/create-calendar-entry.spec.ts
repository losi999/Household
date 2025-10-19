import { entries, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Calendar, Customer, Price } from '@household/shared/types/types';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';

const permissionMap = allowUsers('hairdresser');

describe('POST /calendar/v1/entries', () => {
  let request: Calendar.Entry.Request;
  let customerDocument: Customer.Document;
  let priceDocument: Price.Document;

  beforeEach(() => {
    customerDocument = customerDataFactory.document();
    priceDocument = priceDataFactory.document();
            
    request = calendarEntryDataFactory.personalEntryRequest();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreateCalendarEntry(request)
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
            .requestCreateCalendarEntry(request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should create calendar', () => {
          it('personal entry', () => {
            request = calendarEntryDataFactory.personalEntryRequest();
            cy.authenticate(userType)
              .requestCreateCalendarEntry(request)
              .expectCreatedResponse()
              .validateCalendarEntryDocument(request);
          });

          it('issue entry', () => {
            request = calendarEntryDataFactory.issueEntryRequest();
            cy.authenticate(userType)
              .requestCreateCalendarEntry(request)
              .expectCreatedResponse()
              .validateCalendarEntryDocument(request);
          });

          it('work entry without prices', () => {
            request = calendarEntryDataFactory.workEntryRequest({
              body: {
                customerId: getCustomerId(customerDocument),
              },
            });
            
            cy.saveCustomerDocument(customerDocument)
              .authenticate(userType)
              .requestCreateCalendarEntry(request)
              .expectCreatedResponse()
              .validateCalendarEntryDocument(request);
          });

          it('work entry with prices', () => {

            request = calendarEntryDataFactory.workEntryRequest({
              body: {
                customerId: getCustomerId(customerDocument),
              },
              prices: {
                listed: [
                  {
                    priceId: getPriceId(priceDocument),
                  },
                ],
                custom: [{}],
              },
            });
            
            cy.saveCustomerDocument(customerDocument)
              .savePriceDocument(priceDocument)
              .authenticate(userType)
              .requestCreateCalendarEntry(request)
              .expectCreatedResponse()
              .validateCalendarEntryDocument(request);
          });
        });

        describe('should return error', () => {    
          describe('if day', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    day: undefined,
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('day', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    day: <any>1,
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('day', 'string', 'body');
            });

            it('is not date format', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    day: 'not-date',
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('day', 'date', 'body');
            });
          }); 

          describe('if title', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    title: undefined,
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('title', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    title: <any>1,
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('title', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    title: '',
                  },
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('title', 1, 'body');
            });
          }); 

          describe('if description', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    description: <any>1,
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('description', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    description: '',
                  },
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('description', 1, 'body');
            });
          });
          
          describe('if entryType', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    entryType: undefined,
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('entryType', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    entryType: <any>1,
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('entryType', 'string', 'body');
            });

            it('is not a valid constant value', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    entryType: 'not-valid-const' as any,
                  },
                }))
                .expectBadRequestResponse()
                .expectNotConstantValue('entryType', 'body');
            });
          });

          describe('if start', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    start: undefined,
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('start', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    start: 1.1,
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('start', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    start: -1,
                  },
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('start', 0, false, 'body');
            });

            it('is too large', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    start: 97,
                  },
                }))
                .expectBadRequestResponse()
                .expectTooLargeNumberProperty('start', 96, false, 'body');
            });
          });

          describe('if end', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    end: undefined,
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('end', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    end: 1.1,
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('end', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    start: 20,
                    end: 10,
                  },
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('end', 0, true, 'body');
            });

            it('is too large', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    end: 97,
                  },
                }))
                .expectBadRequestResponse()
                .expectTooLargeNumberProperty('end', 96, false, 'body');
            });
          }); 
          
          describe('if customerId', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    customerId: undefined,
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('customerId', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    customerId: <any>1,
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('customerId', 'string', 'body');
            });

            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    customerId: 'not-mongo-id' as Customer.Id,
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('customerId', 'body');
            });

            it('does not belong to any customer', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    customerId: customerDataFactory.id(),
                  },
                }))
                .expectBadRequestResponse()
                .expectMessage('No customer found');
            });
          }); 

          describe('if prices', () => {
            it('is not array', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry({
                  ...calendarEntryDataFactory.workEntryRequest(),
                  prices: <any>{},
                })
                .expectBadRequestResponse()
                .expectWrongPropertyType('prices', 'array', 'body');
            });

            it('has too few items', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry({                  
                  ...calendarEntryDataFactory.workEntryRequest(),
                  prices: [],
                })
                .expectBadRequestResponse()
                .expectTooFewItemsProperty('prices', 1, 'body');
            });
          });

          describe('if prices[0]', () => {
            it('is not object', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry({                  
                  ...calendarEntryDataFactory.workEntryRequest(),
                  prices: [1] as any,
                })
                .expectBadRequestResponse()
                .expectWrongPropertyType('prices/0', 'object', 'body');
            });

            it('has additional properties', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry({                  
                  ...calendarEntryDataFactory.workEntryRequest(),
                  prices: [
                    {
                      extra: 1,
                    },
                  ] as any,
                })
                .expectBadRequestResponse()
                .expectAdditionalProperty('prices/0', 'body');
            });
          });

          describe('if prices[0].priceId', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  prices: {                  
                    listed: [
                      {
                        priceId: undefined,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('priceId', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  prices: {                  
                    listed: [
                      {
                        priceId: <any>1,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('priceId', 'string', 'body');
            });

            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  prices: {                  
                    listed: [
                      {
                        priceId: <any>'not mongo id',
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('priceId', 'body');
            });

            it('does not belong to any price', () => {
              cy.saveCustomerDocument(customerDocument)
                .savePriceDocument(priceDocument)
                .authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  body: {
                    customerId: getCustomerId(customerDocument),
                  },
                  prices: {                  
                    listed: [
                      {
                        priceId: priceDataFactory.id(),
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectMessage('Some of the prices are not found');
            });
          });

          describe('if prices[0].quantity', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  prices: {                  
                    listed: [
                      {
                        quantity: undefined,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('quantity', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  prices: {                  
                    listed: [
                      {
                        quantity: <any>1.1,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('quantity', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  prices: {                  
                    listed: [
                      {
                        quantity: 0,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('quantity', 0, true, 'body');
            });
          });

          describe('if prices[0].name', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  prices: {
                    custom: [
                      {
                        name: undefined,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  prices: {
                    custom: [
                      {
                        name: <any>1,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  prices: {
                    custom: [
                      {
                        name: '',
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 0, 'body');
            });
          });

          describe('if prices[0].amount', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  prices: {
                    custom: [
                      {
                        amount: undefined,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('amount', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestCreateCalendarEntry(calendarEntryDataFactory.workEntryRequest({
                  prices: {
                    custom: [
                      {
                        amount: <any>1.1,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('amount', 'integer', 'body');
            });
          });
        });
      }
    });
  });
});

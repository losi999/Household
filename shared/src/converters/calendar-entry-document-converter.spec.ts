import { createDocumentUpdate2, createPaymentTransactionDocument, testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { addSeconds, getCalendarEntryId } from '@household/shared/common/utils';
import { calendarEntryDocumentConverterFactory, ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';

describe('Calendar entry document converter', () => {
  let converter: ICalendarEntryDocumentConverter;
  let mockCustomerDocumentConverter: MockService<ICustomerDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(now);
    mockCustomerDocumentConverter = createMockService('createJobPriceList', 'toResponse', 'toResponseJobPriceList');
    converter = calendarEntryDocumentConverterFactory(mockCustomerDocumentConverter.service);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const expiresIn = 3600;

  describe('create', () => {
    describe('personal', () => {
      it('should return document', () => {
        const body = testDataFactory.calendar.entry.request.personal();
        const result = converter.create({
          body,
          customer: undefined,
          prices: undefined,
        }, undefined);
        expect(result).toEqual(testDataFactory.calendar.entry.document({
          ...body,
          _id: undefined,
        }));
      });
      
      it('should return expiring document', () => {
        const body = testDataFactory.calendar.entry.request.personal();
        const result = converter.create({
          body,
          customer: undefined,
          prices: undefined,
        }, expiresIn);
        expect(result).toEqual(testDataFactory.calendar.entry.document({
          ...body,
          _id: undefined,
          expiresAt: addSeconds(expiresIn, now),
        }));
      });
    });

    describe('issue', () => {
      it('should return document', () => {
        const body = testDataFactory.calendar.entry.request.issue();
        const result = converter.create({
          body,
          customer: undefined,
          prices: undefined,
        }, undefined);
        expect(result).toEqual(testDataFactory.calendar.entry.document({
          ...body,
          _id: undefined,
        }));
      });
      
      it('should return expiring document', () => {
        const body = testDataFactory.calendar.entry.request.issue();
        const result = converter.create({
          body,
          customer: undefined,
          prices: undefined,
        }, expiresIn);
        expect(result).toEqual(testDataFactory.calendar.entry.document({
          ...body,
          _id: undefined,
          expiresAt: addSeconds(expiresIn, now),
        }));
      });
    });

    describe('work', () => {
      it('should return document', () => {
        const customerDocument = testDataFactory.customer.document();
        const priceDocument = testDataFactory.price.document();
        const quantity = 1;
        mockCustomerDocumentConverter.functions.createJobPriceList.mockReturnValue([
          {
            price: priceDocument,
            quantity,
          },
        ]);

        const body = testDataFactory.calendar.entry.request.work();
        const result = converter.create({
          body,
          customer: customerDocument,
          prices: [priceDocument],
        }, undefined);
        const { customerId, ...rest } = body;
        expect(result).toEqual(testDataFactory.calendar.entry.document({
          ...rest,
          prices: [
            {
              price: priceDocument,
              quantity,
            },
          ],
          customer: customerDocument,
          _id: undefined,
        }));
        validateFunctionCall(mockCustomerDocumentConverter.functions.createJobPriceList, body.prices, [priceDocument]);
      });
      
      it('should return expiring document', () => {      
        const customerDocument = testDataFactory.customer.document();
        const priceDocument = testDataFactory.price.document();

        const quantity = 1;
        mockCustomerDocumentConverter.functions.createJobPriceList.mockReturnValue([
          {
            price: priceDocument,
            quantity,
          },
        ]);

        const body = testDataFactory.calendar.entry.request.work();
        const result = converter.create({
          body,
          customer: customerDocument,
          prices: [priceDocument],
        }, expiresIn);
        const { customerId, ...rest } = body;
        expect(result).toEqual(testDataFactory.calendar.entry.document({
          ...rest,
          prices: [
            {
              price: priceDocument,
              quantity,
            },
          ],
          customer: customerDocument,
          _id: undefined,
          expiresAt: addSeconds(expiresIn, now),
        }));
        validateFunctionCall(mockCustomerDocumentConverter.functions.createJobPriceList, body.prices, [priceDocument]);
      });
    });
  });

  describe('update', () => {
    describe('personal', () => {
      it('should update document', () => {
        const body = testDataFactory.calendar.entry.request.personal();
        const result = converter.update({
          body,
          customer: undefined,
          prices: undefined,
        }, expiresIn);
        expect(result).toEqual(createDocumentUpdate2({
          update: {
            $set: {
              ...body,
              expiresAt: addSeconds(expiresIn, now),
            },
          },
        }));
      });

      it('should unset description', () => {
        const body = testDataFactory.calendar.entry.request.personal();
        delete body.description;
        const result = converter.update({
          body,
          customer: undefined,
          prices: undefined,
        }, expiresIn);
        expect(result).toEqual(createDocumentUpdate2({
          update: {
            $set: {
              ...body,
              expiresAt: addSeconds(expiresIn, now),
            },
            $unset: {
              description: true,
            },
          },
        }));
      });
    });

    describe('issue', () => {
      it('should update document', () => {
        const body = testDataFactory.calendar.entry.request.issue();
        const result = converter.update({
          body,
          customer: undefined,
          prices: undefined,
        }, expiresIn);
        expect(result).toEqual(createDocumentUpdate2({
          update: {
            $set: {
              ...body,
              expiresAt: addSeconds(expiresIn, now),
            },
          },
        }));
      });

      it('should unset description', () => {
        const body = testDataFactory.calendar.entry.request.issue();
        delete body.description;
        const result = converter.update({
          body,
          customer: undefined,
          prices: undefined,
        }, expiresIn);
        expect(result).toEqual(createDocumentUpdate2({
          update: {
            $set: {
              ...body,
              expiresAt: addSeconds(expiresIn, now),
            },
            $unset: {
              description: true,
            },
          },
        }));
      });
    });

    describe('work', () => {
      it('should update document', () => {     
        const customerDocument = testDataFactory.customer.document();
        const priceDocument = testDataFactory.price.document();
        const quantity = 1;
        mockCustomerDocumentConverter.functions.createJobPriceList.mockReturnValue([
          {
            price: priceDocument,
            quantity,
          },
        ]);

        const body = testDataFactory.calendar.entry.request.work({
          prices: {
            listed: [{}],
          },
        });
        const result = converter.update({
          body,
          customer: customerDocument,
          prices: [priceDocument],
        }, expiresIn);
        const { customerId, ...rest } = body;
        expect(result).toEqual(createDocumentUpdate2({
          update: {
            $set: {
              ...rest,
              customer: customerDocument,
              prices: [
                {
                  price: priceDocument,
                  quantity,
                },
              ],
              expiresAt: addSeconds(expiresIn, now),
            },
          },
        }));
      });

      it('should unset description', () => {
        const customerDocument = testDataFactory.customer.document();
        const priceDocument = testDataFactory.price.document();

        const quantity = 1;
        mockCustomerDocumentConverter.functions.createJobPriceList.mockReturnValue([
          {
            price: priceDocument,
            quantity,
          },
        ]);

        const body = testDataFactory.calendar.entry.request.work({
          prices: {
            listed: [{}],
          },
        });
        delete body.description;
        const result = converter.update({
          body,
          customer: customerDocument,
          prices: [priceDocument],
        }, expiresIn);
        const { customerId, ...rest } = body;
        expect(result).toEqual(createDocumentUpdate2({
          update: {
            $set: {
              ...rest,
              customer: customerDocument,
              prices: [
                {
                  price: priceDocument,
                  quantity,
                },
              ],
              expiresAt: addSeconds(expiresIn, now),
            },
            $unset: {
              description: true,
            },
          },
        }));
      });

      it('should unset prices', () => {
        const customerDocument = testDataFactory.customer.document();

        const body = testDataFactory.calendar.entry.request.work();
        delete body.prices;
        const result = converter.update({
          body,
          customer: customerDocument,
          prices: [],
        }, expiresIn);
        const { customerId, ...rest } = body;
        expect(result).toEqual(createDocumentUpdate2({
          update: {
            $set: {
              ...rest,
              customer: customerDocument,
              expiresAt: addSeconds(expiresIn, now),
            },
            $unset: {
              prices: true,
            },
          },
        }));
      });

      it('should unset description and prices', () => {
        const customerDocument = testDataFactory.customer.document();

        const body = testDataFactory.calendar.entry.request.work();
        delete body.description;
        delete body.prices;
        const result = converter.update({
          body,
          customer: customerDocument,
          prices: [],
        }, expiresIn);
        const { customerId, ...rest } = body;
        expect(result).toEqual(createDocumentUpdate2({
          update: {
            $set: {
              ...rest,
              customer: customerDocument,
              expiresAt: addSeconds(expiresIn, now),
            },
            $unset: {
              prices: true,
              description: true,
            },
          },
        }));
      });
    });
  });

  describe('resolve', () => {
    it('should return update', () => {
      const body = testDataFactory.calendar.entry.resolution.request();
      const transaction = createPaymentTransactionDocument();
      const result = converter.resolve({
        body,
        transaction,
      }, expiresIn);
      expect(result).toEqual(createDocumentUpdate2({
        update: {
          $set: {
            resolution: {
              status: body.status,
              ...(body.status !== CalendarEntryResolutionStatus.NoShow ? {
                delay: body.delay,
              } : {}),
            },
            transaction,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
        },
      }));
    });
  });

  describe('toResponseBase', () => {
    it('should return response', () => {
      const doc = testDataFactory.calendar.entry.document();

      const { day, description, title, start, end } = doc;

      const result = converter.toResponseBase(doc);
      expect(result).toEqual(testDataFactory.calendar.entry.response.base({
        day,
        description,
        title,
        start,
        end,
        calendarEntryId: getCalendarEntryId(doc),
      }));
    });
  });

  describe('toResponse', () => {
    describe('personal', () => {
      it('should return response', () => {
        const doc = testDataFactory.calendar.entry.document({
          entryType: CalendarEntryType.Personal,
        });
          
        const { day, description, title, start, end } = doc;
          
        const result = converter.toResponse(doc);
        expect(result).toEqual(testDataFactory.calendar.entry.response.personal({
          day,
          description,
          title,
          start,
          end,
          calendarEntryId: getCalendarEntryId(doc),
        }));
      });
    });

    describe('issue', () => {
      it('should return response', () => {
        const doc = testDataFactory.calendar.entry.document({
          entryType: CalendarEntryType.Issue,
        });
          
        const { day, description, title, start, end } = doc;
          
        const result = converter.toResponse(doc);
        expect(result).toEqual(testDataFactory.calendar.entry.response.issue({
          day,
          description,
          title,
          start,
          end,
          calendarEntryId: getCalendarEntryId(doc),
        }));
      });
    });

    describe('work', () => {
      it('should return response', () => {
        const customerDocument = testDataFactory.customer.document();
        const customerResponse = testDataFactory.customer.response();
        const priceDocument = testDataFactory.price.document();
        const quantity = 1;
        const customPrice = testDataFactory.price.base();
        const priceResponse = testDataFactory.price.response();

        const doc = testDataFactory.calendar.entry.document({
          entryType: CalendarEntryType.Work,
          customer: customerDocument,
          prices: [
            {
              price: priceDocument,
              quantity,
            },
            customPrice,
          ],
        });
        mockCustomerDocumentConverter.functions.toResponse.mockReturnValue(customerResponse);
        mockCustomerDocumentConverter.functions.toResponseJobPriceList.mockReturnValue([
          {
            ...priceResponse,
            quantity,
          },
        ]);
          
        const { day, description, title, start, end } = doc;
          
        const result = converter.toResponse(doc);
        expect(result).toEqual(testDataFactory.calendar.entry.response.work({
          day,
          description,
          title,
          start,
          end,
          calendarEntryId: getCalendarEntryId(doc),
          customer: customerResponse,
          prices: [
            {
              ...priceResponse,
              quantity,
            },
          ],
        }));
        validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse, customerDocument);
        validateFunctionCall(mockCustomerDocumentConverter.functions.toResponseJobPriceList, [
          {
            price: priceDocument,
            quantity,
          },
          customPrice,
        ]);
      });
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const personalEntryDocument = testDataFactory.calendar.entry.document({
        entryType: CalendarEntryType.Personal,
      });

      const issueEntryDocument = testDataFactory.calendar.entry.document({
        entryType: CalendarEntryType.Issue,
      });

      const customerDocument = testDataFactory.customer.document();
      const customerResponse = testDataFactory.customer.response();
      const priceDocument = testDataFactory.price.document();
      const quantity = 1;
      const customPrice = testDataFactory.price.base();
      const priceResponse = testDataFactory.price.response();

      const workEntryDocument = testDataFactory.calendar.entry.document({
        entryType: CalendarEntryType.Work,
        customer: customerDocument,
        prices: [
          {
            price: priceDocument,
            quantity,
          },
          customPrice,
        ],
      });
      mockCustomerDocumentConverter.functions.toResponse.mockReturnValue(customerResponse);
      mockCustomerDocumentConverter.functions.toResponseJobPriceList.mockReturnValue([
        {
          ...priceResponse,
          quantity,
        },
      ]);

      const result = converter.toResponseList([
        personalEntryDocument,
        issueEntryDocument,
        workEntryDocument,
      ]);
      expect(result).toEqual([
        testDataFactory.calendar.entry.response.personal({
          day: personalEntryDocument.day,
          description: personalEntryDocument.description,
          title: personalEntryDocument.title,
          start: personalEntryDocument.start,
          end: personalEntryDocument.end,
          calendarEntryId: getCalendarEntryId(personalEntryDocument),
        }),
        testDataFactory.calendar.entry.response.issue({
          day: issueEntryDocument.day,
          description: issueEntryDocument.description,
          title: issueEntryDocument.title,
          start: issueEntryDocument.start,
          end: issueEntryDocument.end,
          calendarEntryId: getCalendarEntryId(issueEntryDocument),
        }),
        testDataFactory.calendar.entry.response.work({
          day: workEntryDocument.day,
          description: workEntryDocument.description,
          title: workEntryDocument.title,
          start: workEntryDocument.start,
          end: workEntryDocument.end,
          calendarEntryId: getCalendarEntryId(workEntryDocument),
          customer: customerResponse,
          prices: [
            {
              ...priceResponse,
              quantity,
            },
          ],
        }),
      ]);
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse, customerDocument);
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponseJobPriceList, [
        {
          price: priceDocument,
          quantity,
        },
        customPrice,
      ]);
    });
  });
});

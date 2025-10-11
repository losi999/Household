import { calendarEntryDataFactory, createDocumentUpdate2, customerDataFactory, priceDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateFunctionCall } from '@household/shared/common/unit-testing';
import { addSeconds, getCalendarEntryId } from '@household/shared/common/utils';
import { calendarEntryDocumentConverterFactory, ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { CalendarEntryType } from '@household/shared/enums';
import { advanceTo, clear } from 'jest-date-mock';

describe('Calendar entry document converter', () => {
  let converter: ICalendarEntryDocumentConverter;
  let mockCustomerDocumentConverter: Mock<ICustomerDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    mockCustomerDocumentConverter = createMockService('createJobPriceList', 'toResponse', 'toResponseJobPriceList');
    converter = calendarEntryDocumentConverterFactory(mockCustomerDocumentConverter.service);
  });

  afterEach(() => {
    clear();
  });

  const expiresIn = 3600;

  describe('create', () => {
    describe('personal', () => {
      it('should return document', () => {
        const body = calendarEntryDataFactory.personalRequest();
        const result = converter.create({
          body,
          customer: undefined,
          prices: undefined,
        }, undefined);
        expect(result).toEqual(calendarEntryDataFactory.document({
          ...body,
          _id: undefined,
        }));
      });
      
      it('should return expiring document', () => {
        const body = calendarEntryDataFactory.personalRequest();
        const result = converter.create({
          body,
          customer: undefined,
          prices: undefined,
        }, expiresIn);
        expect(result).toEqual(calendarEntryDataFactory.document({
          ...body,
          _id: undefined,
          expiresAt: addSeconds(expiresIn, now),
        }));
      });
    });

    describe('issue', () => {
      it('should return document', () => {
        const body = calendarEntryDataFactory.issueRequest();
        const result = converter.create({
          body,
          customer: undefined,
          prices: undefined,
        }, undefined);
        expect(result).toEqual(calendarEntryDataFactory.document({
          ...body,
          _id: undefined,
        }));
      });
      
      it('should return expiring document', () => {
        const body = calendarEntryDataFactory.issueRequest();
        const result = converter.create({
          body,
          customer: undefined,
          prices: undefined,
        }, expiresIn);
        expect(result).toEqual(calendarEntryDataFactory.document({
          ...body,
          _id: undefined,
          expiresAt: addSeconds(expiresIn, now),
        }));
      });
    });

    describe('work', () => {
      it('should return document', () => {
        const customerDocument = customerDataFactory.document();
        const priceDocument = priceDataFactory.document();

        const jobPriceDocument = customerDataFactory.jobPriceDocument();
        mockCustomerDocumentConverter.functions.createJobPriceList.mockReturnValue([jobPriceDocument]);

        const body = calendarEntryDataFactory.workRequest();
        const result = converter.create({
          body,
          customer: customerDocument,
          prices: [priceDocument],
        }, undefined);
        const { customerId, ...rest } = body;
        expect(result).toEqual(calendarEntryDataFactory.document({
          ...rest,
          isPaid: false,
          prices: [jobPriceDocument],
          customer: customerDocument,
          _id: undefined,
        }));
        validateFunctionCall(mockCustomerDocumentConverter.functions.createJobPriceList, body.prices, [priceDocument]);
      });
      
      it('should return expiring document', () => {      
        const customerDocument = customerDataFactory.document();
        const priceDocument = priceDataFactory.document();

        const jobPriceDocument = customerDataFactory.jobPriceDocument();
        mockCustomerDocumentConverter.functions.createJobPriceList.mockReturnValue([jobPriceDocument]);

        const body = calendarEntryDataFactory.workRequest();
        const result = converter.create({
          body,
          customer: customerDocument,
          prices: [priceDocument],
        }, expiresIn);
        const { customerId, ...rest } = body;
        expect(result).toEqual(calendarEntryDataFactory.document({
          ...rest,
          isPaid: false,
          prices: [jobPriceDocument],
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
        const body = calendarEntryDataFactory.personalRequest();
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
        const body = calendarEntryDataFactory.personalRequest();
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
        const body = calendarEntryDataFactory.issueRequest();
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
        const body = calendarEntryDataFactory.issueRequest();
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
        const customerDocument = customerDataFactory.document();
        const priceDocument = priceDataFactory.document();

        const jobPriceDocument = customerDataFactory.jobPriceDocument();
        mockCustomerDocumentConverter.functions.createJobPriceList.mockReturnValue([jobPriceDocument]);

        const body = calendarEntryDataFactory.workRequest();
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
              prices: [jobPriceDocument],
              expiresAt: addSeconds(expiresIn, now),
            },
          },
        }));
      });

      it('should unset description', () => {
        const customerDocument = customerDataFactory.document();
        const priceDocument = priceDataFactory.document();

        const jobPriceDocument = customerDataFactory.jobPriceDocument();
        mockCustomerDocumentConverter.functions.createJobPriceList.mockReturnValue([jobPriceDocument]);

        const body = calendarEntryDataFactory.workRequest();
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
              prices: [jobPriceDocument],
              expiresAt: addSeconds(expiresIn, now),
            },
            $unset: {
              description: true,
            },
          },
        }));
      });

      it('should unset prices', () => {
        const customerDocument = customerDataFactory.document();

        const body = calendarEntryDataFactory.workRequest();
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
        const customerDocument = customerDataFactory.document();

        const body = calendarEntryDataFactory.workRequest();
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

  describe('updatePaid', () => {
    it('should return update', () => {
      const result = converter.updatePaid();
      expect(result).toEqual(createDocumentUpdate2({
        update: {
          $set: {
            isPaid: true,
          },
        },
      }));
    });
  });

  describe('toResponseBase', () => {
    it('should return response', () => {
      const doc = calendarEntryDataFactory.document();

      const { day, description, title, start, end } = doc;

      const result = converter.toResponseBase(doc);
      expect(result).toEqual(calendarEntryDataFactory.responseBase({
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
        const doc = calendarEntryDataFactory.document({
          entryType: CalendarEntryType.Personal,
        });
          
        const { day, description, title, start, end } = doc;
          
        const result = converter.toResponse(doc);
        expect(result).toEqual(calendarEntryDataFactory.personalResponse({
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
        const doc = calendarEntryDataFactory.document({
          entryType: CalendarEntryType.Issue,
        });
          
        const { day, description, title, start, end } = doc;
          
        const result = converter.toResponse(doc);
        expect(result).toEqual(calendarEntryDataFactory.issueResponse({
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
        const customerDocument = customerDataFactory.document();
        const customerResponse = customerDataFactory.response();
        const jobPriceDocument = customerDataFactory.jobPriceDocument();
        const jobPriceResponse = customerDataFactory.jobPriceResponse();

        const doc = calendarEntryDataFactory.document({
          entryType: CalendarEntryType.Work,
          customer: customerDocument,
          prices: [jobPriceDocument],
        });
        mockCustomerDocumentConverter.functions.toResponse.mockReturnValue(customerResponse);
        mockCustomerDocumentConverter.functions.toResponseJobPriceList.mockReturnValue([jobPriceResponse]);
          
        const { day, description, title, start, end, isPaid } = doc;
          
        const result = converter.toResponse(doc);
        expect(result).toEqual(calendarEntryDataFactory.workResponse({
          day,
          description,
          title,
          start,
          end,
          isPaid,
          calendarEntryId: getCalendarEntryId(doc),
          customer: customerResponse,
          prices: [jobPriceResponse],
        }));
        validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse, customerDocument);
        validateFunctionCall(mockCustomerDocumentConverter.functions.toResponseJobPriceList, [jobPriceDocument]);
      });
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const personalEntryDocument = calendarEntryDataFactory.document({
        entryType: CalendarEntryType.Personal,
      });

      const issueEntryDocument = calendarEntryDataFactory.document({
        entryType: CalendarEntryType.Issue,
      });

      const customerDocument = customerDataFactory.document();
      const customerResponse = customerDataFactory.response();
      const jobPriceDocument = customerDataFactory.jobPriceDocument();
      const jobPriceResponse = customerDataFactory.jobPriceResponse();

      const workEntryDocument = calendarEntryDataFactory.document({
        entryType: CalendarEntryType.Work,
        customer: customerDocument,
        prices: [jobPriceDocument],
      });
      mockCustomerDocumentConverter.functions.toResponse.mockReturnValue(customerResponse);
      mockCustomerDocumentConverter.functions.toResponseJobPriceList.mockReturnValue([jobPriceResponse]);

      const result = converter.toResponseList([
        personalEntryDocument,
        issueEntryDocument,
        workEntryDocument,
      ]);
      expect(result).toEqual([
        calendarEntryDataFactory.personalResponse({
          day: personalEntryDocument.day,
          description: personalEntryDocument.description,
          title: personalEntryDocument.title,
          start: personalEntryDocument.start,
          end: personalEntryDocument.end,
          calendarEntryId: getCalendarEntryId(personalEntryDocument),
        }),
        calendarEntryDataFactory.issueResponse({
          day: issueEntryDocument.day,
          description: issueEntryDocument.description,
          title: issueEntryDocument.title,
          start: issueEntryDocument.start,
          end: issueEntryDocument.end,
          calendarEntryId: getCalendarEntryId(issueEntryDocument),
        }),
        calendarEntryDataFactory.workResponse({
          day: workEntryDocument.day,
          description: workEntryDocument.description,
          title: workEntryDocument.title,
          start: workEntryDocument.start,
          end: workEntryDocument.end,
          isPaid: workEntryDocument.isPaid,
          calendarEntryId: getCalendarEntryId(workEntryDocument),
          customer: customerResponse,
          prices: [jobPriceResponse],
        }),
      ]);
    });
  });
});

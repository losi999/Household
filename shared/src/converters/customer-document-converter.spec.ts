import { createDocumentUpdate2, testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { addSeconds, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { customerDocumentConverterFactory, ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';

describe('Customer document converter', () => {
  let converter: ICustomerDocumentConverter;
  let mockPriceDocumentConverter: MockService<IPriceDocumentConverter>;
  const now = new Date();
  const expiresIn = 3600;

  beforeEach(() => {
    mockPriceDocumentConverter = createMockService('toResponse');
    vi.useFakeTimers().setSystemTime(now);
    converter = customerDocumentConverterFactory(mockPriceDocumentConverter.service);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createJobPriceList', () => {
    it('should return document', () => {
      const priceBase = testDataFactory.price.base();
      const priceDocument = testDataFactory.price.document();
      const quantity = 1;

      const result = converter.createJobPriceList([
        {
          priceId: getPriceId(priceDocument),
          quantity,
        },
        priceBase,
      ], [priceDocument]);
      expect(result).toEqual([
        {
          price: priceDocument,
          quantity,
        },
        priceBase,
      ]);
    });
  });

  describe('create', () => {
    it('should return document', () => {
      const body = testDataFactory.customer.request();

      const result = converter.create(body, undefined);
      expect(result).toEqual({
        ...testDataFactory.customer.document({
          body,
        }),
        _id: undefined,
      });
    });

    it('should return expiring document', () => {
      const body = testDataFactory.customer.request();

      const result = converter.create(body, expiresIn);
      expect(result).toEqual({
        ...testDataFactory.customer.document({
          body,
        }),
        _id: undefined,
        expiresAt: addSeconds(expiresIn, now),
      });
    });
  });

  describe('update', () => {
    it('should update document', () => {
      const body = testDataFactory.customer.request();

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

    it('should unset description', () => {
      const body = testDataFactory.customer.request({});
      delete body.description;
      const result = converter.update(body, expiresIn);
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

  describe('addBlacklistedCustomer', () => {
    const customer = testDataFactory.customer.document();

    it('should return update', () => {
      const result = converter.addBlacklistedCustomer(customer);
      expect(result).toEqual(createDocumentUpdate2({
        update: {
          $addToSet: {
            blacklistedCustomers: customer,
          },
        },
      }));
    });
  });

  describe('removeBlacklistedCustomer', () => {
    const customerId = testDataFactory.customer.id();
    it('should return update', () => {
      const result = converter.removeBlacklistedCustomer(customerId);
      expect(result).toEqual(createDocumentUpdate2({
        update: {
          $pull: {
            blacklistedCustomers: customerId,
          },
        },
      }));
    });
  });

  describe('addJob', () => {
    const priceDocument = testDataFactory.price.document();
    const priceId = getPriceId(priceDocument);
    const quantity = 1;
    const priceName = 'price name';
    const amount = 3000;
    const job = testDataFactory.customer.job.request({
      prices: {
        custom: [
          {
            name: priceName,
            amount,
          },
        ],
        listed: [
          {
            priceId,
            quantity,
          },
        ],
      },
    });

    it('should return update', () => {
      const result = converter.addJob(job, [priceDocument]);
      expect(result).toEqual(createDocumentUpdate2({
        update: {
          $push: {
            jobs: {
              ...job,
              prices: [
                {
                  name: priceName,
                  amount,
                },
                {
                  price: priceDocument,
                  quantity,
                },
              ],
            },
          },
        },
      }));
    });
  });

  describe('updateJob', () => {
    const priceDocument = testDataFactory.price.document();
    const priceId = getPriceId(priceDocument);
    const quantity = 1;
    const priceName = 'price name';
    const amount = 3000;
    const job = testDataFactory.customer.job.request({
      prices: {
        custom: [
          {
            name: priceName,
            amount,
          },
        ],
        listed: [
          {
            priceId,
            quantity,
          },
        ],
      },
    });

    it('should return update', () => {
      const result = converter.updateJob(job.name, job, [priceDocument]);
      expect(result).toEqual(createDocumentUpdate2({
        update: {
          $set: {
            'jobs.$[job]': {
              ...job,
              prices: [
                {
                  name: priceName,
                  amount,
                },
                {
                  price: priceDocument,
                  quantity,
                },
              ],
            },
          },
        },
        arrayFilters: [
          {
            'job.name': job.name,
          },
        ],
      }));
    });
  });

  describe('deleteJob', () => {
    it('should return update', () => {
      const jobName = 'job name';
      const result = converter.deleteJob(jobName);
      expect(result).toEqual(createDocumentUpdate2({
        update: {
          $pull: {
            jobs: {
              name: jobName,
            },
          },
        },
      }));
    });
  });

  describe('toResponseJobPriceList', () => {
    it('should return response', () => {
      const quantity = 1;
      const priceBase = testDataFactory.price.base();
      const priceResponse = testDataFactory.price.response();
      mockPriceDocumentConverter.functions.toResponse.mockReturnValue(priceResponse);

      const result = converter.toResponseJobPriceList([
        {
          price: testDataFactory.price.document(),
          quantity,
        },
        priceBase,
      ]);
      expect(result).toEqual([
        {
          quantity,
          ...priceResponse,
        },
        priceBase,
      ]);
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const priceBase = testDataFactory.price.base();
      const quantity = 1;
      const blacklistedCustomer = testDataFactory.customer.document();
      const doc = testDataFactory.customer.document({
        jobs: [
          {
            body: {
              name: 'B',
            },
            prices: {
              custom: [priceBase],
            },
          },
          {
            body: {
              name: 'A',
            },
            prices: {
              listed: [
                {
                  quantity,
                },
              ],
            },
          },
        ],
        blacklistedCustomers: [blacklistedCustomer],
      });
      const jobB = doc.jobs[0];
      const jobA = doc.jobs[1];
      const priceResponse = testDataFactory.price.response();
      mockPriceDocumentConverter.functions.toResponse.mockReturnValue(priceResponse);

      const { description, isGroup, name, rating } = doc;

      const result = converter.toResponse(doc);
      expect(result).toEqual(testDataFactory.customer.response({
        description,
        name,
        isGroup,
        rating,
        customerId: getCustomerId(doc),
        blacklistedCustomers: [
          {
            customerId: getCustomerId(blacklistedCustomer),
            name: blacklistedCustomer.name,
            rating: blacklistedCustomer.rating,
            description: blacklistedCustomer.description,
            isGroup: blacklistedCustomer.isGroup,
          },
        ],
        jobs: [
          {
            name: jobA.name,
            description: jobA.description,
            duration: jobA.duration,
            prices: [
              {
                ...priceResponse,
                quantity,
              },
            ],
          },
          {
            name: jobB.name,
            description: jobB.description,
            duration: jobB.duration,
            prices: [
              {
                ...priceBase,
                quantity: undefined,
                unitOfMeasurement: undefined,
                priceId: undefined,
              },
            ],
          },
        ],
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response', () => {
      const priceBase = testDataFactory.price.base();   
      const quantity = 1;   
      const blacklistedCustomer = testDataFactory.customer.document();
      const doc = testDataFactory.customer.document({
        jobs: [
          {
            body: {
              name: 'B',
            },
            prices: {
              custom: [priceBase],
            },
          },
          {
            body: {
              name: 'A',
            },
            prices: {
              listed: [
                {
                  quantity,
                },
              ],
            },
          },
        ],
        blacklistedCustomers: [blacklistedCustomer],
      });
      const jobB = doc.jobs[0];
      const jobA = doc.jobs[1];
      const priceResponse = testDataFactory.price.response();
      mockPriceDocumentConverter.functions.toResponse.mockReturnValue(priceResponse);

      const { description, isGroup, name, rating } = doc;

      const result = converter.toResponseList([doc]);
      expect(result).toEqual([
        testDataFactory.customer.response({
          description,
          name,
          isGroup,
          rating,
          customerId: getCustomerId(doc),
          blacklistedCustomers: [
            {
              customerId: getCustomerId(blacklistedCustomer),
              name: blacklistedCustomer.name,
              rating: blacklistedCustomer.rating,
              description: blacklistedCustomer.description,
              isGroup: blacklistedCustomer.isGroup,
            },
          ],
          jobs: [
            {
              name: jobA.name,
              description: jobA.description,
              duration: jobA.duration,
              prices: [
                {
                  ...priceResponse,
                  quantity,
                },
              ],
            },
            {
              name: jobB.name,
              description: jobB.description,
              duration: jobB.duration,
              prices: [
                {
                  ...priceBase,
                  quantity: undefined,
                  unitOfMeasurement: undefined,
                  priceId: undefined,
                },
              ],
            },
          ],
        }),
      ]);
    });
  });
});

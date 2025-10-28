import { createDocumentUpdate2, customerDataFactory, testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock } from '@household/shared/common/unit-testing';
import { addSeconds, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { customerDocumentConverterFactory, ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { advanceTo, clear } from 'jest-date-mock';

describe('Customer document converter', () => {
  let converter: ICustomerDocumentConverter;
  let mockPriceDocumentConverter: Mock<IPriceDocumentConverter>;
  const now = new Date();
  const expiresIn = 3600;

  beforeEach(() => {
    mockPriceDocumentConverter = createMockService('toResponse');
    advanceTo(now);
    converter = customerDocumentConverterFactory(mockPriceDocumentConverter.service);
  });

  afterEach(() => {
    clear();
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
      const body = customerDataFactory.request();

      const result = converter.create(body, undefined);
      expect(result).toEqual(customerDataFactory.document({
        ...body,
        _id: undefined,
        jobs: [],
      }));
    });

    it('should return expiring document', () => {
      const body = customerDataFactory.request();

      const result = converter.create(body, expiresIn);
      expect(result).toEqual(customerDataFactory.document({
        ...body,
        _id: undefined,
        jobs: [],
        expiresAt: addSeconds(expiresIn, now),
      }));
    });
  });

  describe('update', () => {
    it('should update document', () => {
      const body = customerDataFactory.request();

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
      const body = customerDataFactory.request({});
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
    const customer = customerDataFactory.document();

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
    const customerId = customerDataFactory.id();
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
    const job = customerDataFactory.jobRequest({
      prices: [
        {
          priceId,
          quantity,
        },
        {
          name: priceName,
          amount,
        },
      ],
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
                  price: priceDocument,
                  quantity,
                },
                {
                  name: priceName,
                  amount,
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
    const job = customerDataFactory.jobRequest({
      prices: [
        {
          priceId,
          quantity,
        },
        {
          name: priceName,
          amount,
        },
      ],
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
                  price: priceDocument,
                  quantity,
                },
                {
                  name: priceName,
                  amount,
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
        customerDataFactory.jobPriceResponse({
          quantity,
          ...priceResponse,
        }),
        customerDataFactory.jobPriceResponse({
          ...priceBase,
        }),
      ]);
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const priceBase = testDataFactory.price.base();
      const priceDocument = testDataFactory.price.document();
      const jobB = customerDataFactory.jobDocument({
        name: 'B',
        prices: [priceBase],
      });
      const quantity = 1;
      const jobA = customerDataFactory.jobDocument({
        name: 'A',
        prices: [
          {
            price: priceDocument,
            quantity,
          },
        ],
      });
      const blacklistedCustomer = customerDataFactory.document();
      const doc = customerDataFactory.document({
        jobs: [
          jobB,
          jobA,
        ],
        blacklistedCustomers: [blacklistedCustomer],
      });
      const priceResponse = testDataFactory.price.response();
      mockPriceDocumentConverter.functions.toResponse.mockReturnValue(priceResponse);

      const { description, isGroup, name, rating } = doc;

      const result = converter.toResponse(doc);
      expect(result).toEqual(customerDataFactory.response({
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
      const priceDocument = testDataFactory.price.document();
      const jobB = customerDataFactory.jobDocument({
        name: 'B',
        prices: [priceBase],
      });
      const quantity = 1;
      const jobA = customerDataFactory.jobDocument({
        name: 'A',
        prices: [
          {
            price: priceDocument,
            quantity,
          },
        ],
      });
      const blacklistedCustomer = customerDataFactory.document();
      const doc = customerDataFactory.document({
        jobs: [
          jobB,
          jobA,
        ],
        blacklistedCustomers: [blacklistedCustomer],
      });
      const priceResponse = testDataFactory.price.response();
      mockPriceDocumentConverter.functions.toResponse.mockReturnValue(priceResponse);

      const { description, isGroup, name, rating } = doc;

      const result = converter.toResponseList([doc]);
      expect(result).toEqual([
        customerDataFactory.response({
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
                },
              ],
            },
          ],
        }),
      ]);
    });
  });
});

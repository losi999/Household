import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { getPriceId } from '@household/shared/common/utils';
import { addSeconds, getCustomerId } from '@household/shared/common/utils';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { DocumentUpdate } from '@household/shared/types/common';
import { Customer, Price } from '@household/shared/types/types';

export interface ICustomerDocumentConverter {
  createJobPriceList(prices: Customer.Job.Request['prices'], priceDocuments: Price.Document[]): Customer.Job.Document['prices'];
  create(body: Customer.Request, expiresIn: number, generateId?: boolean): Customer.Document;
  update(body: Customer.Request, expiresIn: number): DocumentUpdate<Customer.Document>;
  addBlacklistedCustomer(customer: Customer.Document): DocumentUpdate<Customer.Document>;
  removeBlacklistedCustomer(customerId: Customer.Id): DocumentUpdate<Customer.Document>;
  addJob(job: Customer.Job.Request, priceDocuments: Price.Document[]): DocumentUpdate<Customer.Document>;
  updateJob(jobName: string, job: Customer.Job.Request, priceDocuments: Price.Document[]): DocumentUpdate<Customer.Document>;
  deleteJob(name: Customer.Job.Name['name']): DocumentUpdate<Customer.Document>;
  toResponseBase(doc: Customer.Document): Customer.ResponseBase;
  toResponse(doc: Customer.Document): Customer.Response;
  toResponseList(docs: Customer.Document[]): Customer.Response[];
  toResponseJobPriceList(docs: Customer.Job.Document['prices']): Customer.Job.Response['prices'];
}

export const customerDocumentConverterFactory = (priceDocumentConverter: IPriceDocumentConverter): ICustomerDocumentConverter => {
  const instance: ICustomerDocumentConverter = {
    createJobPriceList: (prices, priceDocuments) => {
      return prices?.map((req) => {
        return {
          price: priceDocuments.find(p => getPriceId(p) === req.priceId),
          quantity: req.quantity,
        };
      });
    },
    create: (body, expiresIn, generateId) => {
      return {
        ...body,
        description: body.description?.trim(),
        isArchived: false,
        jobs: [],
        blacklistedCustomers: [],
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: (body, expiresIn) => {
      return {
        update: {
          $set: {
            ...body,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
          ...(!body.description ? {
            $unset: {
              description: true,
            },
          } : {}),
        },
      };
    },
    addBlacklistedCustomer: (customer) => {
      return {
        update: {
          $addToSet: {
            blacklistedCustomers: customer,
          },
        },
      };
    },
    removeBlacklistedCustomer: (customerId) => {
      return {
        update: {
          $pull: {
            blacklistedCustomers: customerId,
          },
        },
      };
    },
    addJob: ({ description, duration, name, prices, additionalPrice }, priceDocuments) => {
      const job: Customer.Job.Document = {
        name,
        duration,
        description,
        additionalPrice,
        prices: instance.createJobPriceList(prices, priceDocuments),
      };

      return {
        update: {
          $push: {
            jobs: job,
          },
        },
      };
    },
    updateJob: (jobName, { description, duration, name, prices, additionalPrice }, priceDocuments) => {
      const job: Customer.Job.Document = {
        name,
        duration,
        description,
        additionalPrice,
        prices: instance.createJobPriceList(prices, priceDocuments),
      };

      return {
        update: {
          $set: {
            'jobs.$[job]': job,
          },
          ...(!additionalPrice ? {
            $unset: {
              additionalPrice: true,
            },
          } : {}),
        },
        arrayFilters: [
          {
            'job.name': jobName,
          },
        ],
      };
    },
    deleteJob: (name) => { 
      return {
        update: {
          $pull: {
            jobs: {
              name,
            },
          },
        },
      };
    },
    toResponseBase: ({ name, description, isGroup, rating, _id }) => {
      return {
        customerId: getCustomerId(_id),
        name,
        isGroup,
        rating,
        description,
      };
    },
    toResponse: (customer) => {
      return {
        ...instance.toResponseBase(customer),
        isArchived: customer.isArchived ?? false,
        jobs: customer.jobs?.map(({ name, description, duration, prices, additionalPrice }) => {
          return {
            name,
            description, 
            duration,
            additionalPrice,
            prices: instance.toResponseJobPriceList(prices),
          };
        }).toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
          sensitivity: 'base',
        })),      
        blacklistedCustomers: customer.blacklistedCustomers.map(c => instance.toResponseBase(c)),
      };
    },
    toResponseList: (docs) => docs?.map(d => instance.toResponse(d)),
    toResponseJobPriceList: (docs) => {
      return docs?.map((p) => {
        return {
          quantity: p.quantity,
          ...priceDocumentConverter.toResponse(p.price),
        };
      });
    },
  };

  return instance;
};

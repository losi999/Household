import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { getPriceId } from '@household/shared/common/utils';
import { addSeconds, getCustomerId } from '@household/shared/common/utils';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { Api } from '@household/shared/types/api';
import { DocumentUpdate } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export interface ICustomerDocumentConverter {
  createJobPriceList(prices: Requests.CustomerJob['prices'], priceDocuments: Documents.Price[]): Documents.CustomerJob['prices'];
  create(body: Requests.Customer, expiresIn: number, generateId?: boolean): Documents.Customer;
  update(body: Requests.Customer, expiresIn: number): DocumentUpdate<Documents.Customer>;
  addBlacklistedCustomer(customer: Documents.Customer): DocumentUpdate<Documents.Customer>;
  removeBlacklistedCustomer(customerId: Api.Customer.Id): DocumentUpdate<Documents.Customer>;
  addJob(job: Requests.CustomerJob, priceDocuments: Documents.Price[]): DocumentUpdate<Documents.Customer>;
  updateJob(jobName: string, job: Requests.CustomerJob, priceDocuments: Documents.Price[]): DocumentUpdate<Documents.Customer>;
  deleteJob(name: Api.Customer.Job.Name['name']): DocumentUpdate<Documents.Customer>;
  toResponseBase(doc: Documents.Customer): Responses.CustomerLean;
  toResponse(doc: Documents.Customer): Responses.Customer;
  toResponseList(docs: Documents.Customer[]): Responses.Customer[];
  toResponseJobPriceList(docs: Documents.CustomerJob['prices']): Responses.CustomerJob['prices'];
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
      const job: Documents.CustomerJob = {
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
      const job: Documents.CustomerJob = {
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
            title: customer.isGroup ? name : `${customer.name}: ${name}`,
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

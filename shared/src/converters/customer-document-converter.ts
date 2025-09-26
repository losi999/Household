import { isPriceBase } from '@household/shared/common/type-guards';
import { generateMongoId, getPriceId } from '@household/shared/common/utils';
import { addSeconds, getCustomerId } from '@household/shared/common/utils';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { DocumentUpdate } from '@household/shared/types/common';
import { Customer, Price } from '@household/shared/types/types';

export interface ICustomerDocumentConverter {
  createJobPriceList(prices: Customer.Job.Request['prices'], priceDocuments: Price.Document[]): Customer.Job.Document['prices'];
  create(body: Customer.Request, expiresIn: number, generateId?: boolean): Customer.Document;
  update(body: Customer.Request, expiresIn: number): DocumentUpdate<Customer.Document>;
  addJob(job: Customer.Job.Request, priceDocuments: Price.Document[]): DocumentUpdate<Customer.Document>;
  updateJob(jobName: string, job: Customer.Job.Request, priceDocuments: Price.Document[]): DocumentUpdate<Customer.Document>;
  deleteJob(name: Customer.Job.Name['name']): DocumentUpdate<Customer.Document>;
  toResponse(doc: Customer.Document): Customer.Response;
  toResponseList(docs: Customer.Document[]): Customer.Response[];
  toResponseJobPriceList(docs: Customer.Job.Document['prices']): Customer.Job.Response['prices'];
}

export const customerDocumentConverterFactory = (priceDocumentConverter: IPriceDocumentConverter): ICustomerDocumentConverter => {
  const instance: ICustomerDocumentConverter = {
    createJobPriceList: (prices, priceDocuments) => {
      return prices?.map((req) => {
        if (isPriceBase(req)) {
          return {
            name: req.name,
            amount: req.amount,
          };
        }

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
        jobs: [],
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
    addJob: ({ description, duration, name, prices }, priceDocuments) => {
      return {
        update: {
          $push: {
            jobs: {
              name,
              duration,
              description,
              prices: instance.createJobPriceList(prices, priceDocuments),
            },
          },
        },
      };
    },
    updateJob: (jobName, { description, duration, name, prices }, priceDocuments) => {
      return {
        update: {
          $set: {
            'jobs.$[job]': {
              name,
              duration,
              description,
              prices: instance.createJobPriceList(prices, priceDocuments),
            },
          },
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
    toResponse: ({ name, description, jobs, isGroup, rating, _id }) => {
      return {
        name,
        isGroup,
        rating,
        description,
        jobs: jobs?.map(({ name, description, duration, prices }) => {
          return {
            name,
            description, 
            duration,
            prices: instance.toResponseJobPriceList(prices),
          };
        }).toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
          sensitivity: 'base',
        })),
        customerId: getCustomerId(_id),
        createdAt: undefined,
        updatedAt: undefined,
        _id: undefined,
        expiresAt: undefined,
      };
    },
    toResponseList: docs => docs?.map(d => instance.toResponse(d)),
    toResponseJobPriceList: (docs) => {
      return docs?.map((p) => {
        if (isPriceBase(p)) {
          return {
            amount: p.amount,
            name: p.name,
            priceId: undefined,
            quantity: undefined,
            unitOfMeasurement: undefined,
          };
        }

        return {
          quantity: p.quantity,
          ...priceDocumentConverter.toResponse(p.price),
        };
      });
    },
  };

  return instance;
};

import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getCustomerId } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';

export interface ICustomerDocumentConverter {
  create(body: Customer.Request, expiresIn: number, generateId?: boolean): Customer.Document;
  update(body: Customer.Request, expiresIn: number): DocumentUpdate<Customer.Document>;
  addJob(job: Customer.Job): DocumentUpdate<Customer.Document>;
  updateJob(jobName: string, job: Customer.Job): DocumentUpdate<Customer.Document>;
  deleteJob(name: Customer.JobName['name']): DocumentUpdate<Customer.Document>;
  toResponse(doc: Customer.Document): Customer.Response;
  toResponseList(docs: Customer.Document[]): Customer.Response[];
}

export const customerDocumentConverterFactory = (): ICustomerDocumentConverter => {
  const instance: ICustomerDocumentConverter = {
    create: ({ name, description }, expiresIn, generateId) => {
      return {
        name,
        description: description?.trim(),
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
    addJob: (job) => {
      return {
        update: {
          $push: {
            jobs: job,
          },
        },
      };
    },
    updateJob: (jobName, job) => {
      return {
        update: {
          $set: {
            'jobs.$[job]': job,
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
    toResponse: ({ name, description, jobs, _id }) => {
      return {
        name,
        description,
        jobs,
        customerId: getCustomerId(_id),
        createdAt: undefined,
        updatedAt: undefined,
        _id: undefined,
        expiresAt: undefined,
      };
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};

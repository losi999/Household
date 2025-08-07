import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Customer } from '@household/shared/types/types';

export interface IUpdateCustomerJobService {
  (ctx: {
    body: Customer.Job
  } & Customer.CustomerId & Customer.JobName): Promise<void>;
}

export const updateCustomerJobServiceFactory = (
  customerService: ICustomerService,
  customerDocumentConverter: ICustomerDocumentConverter): IUpdateCustomerJobService => {
  return async ({ body, customerId, name }) => {
    const customer = await customerService.findCustomerById(customerId).catch(httpErrors.customer.getById({
      customerId,
    }));

    httpErrors.customer.notFound({
      customerId,
      customer,
    });

    httpErrors.customer.duplicateJobName({
      job: body,
      customer,
      jobName: name,
    });

    const update = customerDocumentConverter.updateJob(name, body); 

    await customerService.updateCustomer(customerId, update).catch(httpErrors.customer.update({
      customerId,
      update,
    }));
  };
};

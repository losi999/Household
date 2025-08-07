import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Customer } from '@household/shared/types/types';

export interface ICreateCustomerJobService {
  (ctx: {
    body: Customer.Job; 
  } & Customer.CustomerId): Promise<void>;
}

export const createCustomerJobServiceFactory = (
  customerService: ICustomerService,
  customerDocumentConverter: ICustomerDocumentConverter): ICreateCustomerJobService => {
  return async ({ body, customerId }) => {
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
    });

    const update = customerDocumentConverter.addJob(body); 

    await customerService.updateCustomer(customerId, update).catch(httpErrors.customer.update({
      customerId,
      update,
    }));
  };
};

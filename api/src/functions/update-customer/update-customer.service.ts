import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Customer } from '@household/shared/types/types';

export interface IUpdateCustomerService {
  (ctx: {
    body: Customer.Request;
    customerId: Customer.Id;
    expiresIn: number;
  }): Promise<unknown>;
}

export const updateCustomerServiceFactory = (
  customerService: ICustomerService,
  customerDocumentConverter: ICustomerDocumentConverter,
): IUpdateCustomerService => {
  return async ({ body, customerId, expiresIn }) => {
    const queried = await customerService.findCustomerById(customerId).catch(httpErrors.customer.getById({
      customerId,
    }));

    httpErrors.customer.notFound({
      customer: queried,
      customerId,
    });

    const update = customerDocumentConverter.update(body, expiresIn);

    return customerService.updateCustomer(customerId, update).catch(httpErrors.customer.update({
      customerId,
      update,
    }));
  };
};

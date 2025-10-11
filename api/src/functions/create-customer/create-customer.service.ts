import { httpErrors } from '@household/api/common/error-handlers';
import { getCustomerId } from '@household/shared/common/utils';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Customer } from '@household/shared/types/types';

export interface ICreateCustomerService {
  (ctx: {
    body: Customer.Request;
    expiresIn: number;
  }): Promise<Customer.Id>;
}

export const createCustomerServiceFactory = (
  customerService: ICustomerService,
  customerDocumentConverter: ICustomerDocumentConverter): ICreateCustomerService => {
  return async ({ body, expiresIn }) => {
    const document = customerDocumentConverter.create(body, expiresIn);

    const saved = await customerService.saveCustomer(document).catch(httpErrors.customer.save(document));

    return getCustomerId(saved);
  };
};

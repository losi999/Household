import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Responses } from '@household/shared/types/responses';

export interface IListCustomersService {
  (): Promise<Responses.Customer[]>;
}

export const listCustomersServiceFactory = (
  customerService: ICustomerService,
  customerDocumentConverter: ICustomerDocumentConverter,
): IListCustomersService => {
  return async () => {   
    const customers = await customerService.listCustomers().catch(httpErrors.customer.list());

    return customerDocumentConverter.toResponseList(customers);
  };
};

import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Customer } from '@household/shared/types/types';

export interface IListCustomersService {
  (): Promise<Customer.Response[]>;
}

export const listCustomersServiceFactory = (
  customerService: ICustomerService,
  customerDocumentConverter: ICustomerDocumentConverter,
): IListCustomersService => {
  return async () => {    
    const documents = await customerService.listCustomers().catch(httpErrors.recipient.list());

    return customerDocumentConverter.toResponseList(documents);
  };
};

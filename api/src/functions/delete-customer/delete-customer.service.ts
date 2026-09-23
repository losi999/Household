import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Api } from '@household/shared/types/api';

export interface IDeleteCustomerService {
  (ctx: Api.Customer.CustomerId): Promise<unknown>;
}

export const deleteCustomerServiceFactory = (
  customerService: ICustomerService): IDeleteCustomerService => {
  return ({ customerId }) => {
    return customerService.deleteCustomer(customerId).catch(httpErrors.customer.delete({
      customerId,
    }));
  };
};

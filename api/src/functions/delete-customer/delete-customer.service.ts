import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Customer } from '@household/shared/types/types';

export interface IDeleteCustomerService {
  (ctx: {
    customerId: Customer.Id;
  }): Promise<unknown>;
}

export const deleteCustomerServiceFactory = (
  customerService: ICustomerService): IDeleteCustomerService => {
  return ({ customerId }) => {
    return customerService.deleteCustomer(customerId).catch(httpErrors.customer.delete({
      customerId,
    }));
  };
};

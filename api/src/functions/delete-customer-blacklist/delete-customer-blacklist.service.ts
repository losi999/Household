import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Customer } from '@household/shared/types/types';

export interface IDeleteCustomerBlacklistService {
  (ctx: Customer.Id[]): Promise<void>;
}

export const deleteCustomerBlacklistServiceFactory = (
  customerService: ICustomerService,
  customerDocumentConverter: ICustomerDocumentConverter): IDeleteCustomerBlacklistService => {
  return async ([
    customerIdA,
    customerIdB,
  ]) => {
    httpErrors.customer.selfBlacklisted({
      customerIdA,
      customerIdB,
    });

    const [
      customerA,
      customerB,
    ] = await Promise.all([
      customerService.findCustomerById(customerIdA).catch(httpErrors.customer.getById({
        customerId: customerIdA,
      })),
      customerService.findCustomerById(customerIdB).catch(httpErrors.customer.getById({
        customerId: customerIdB,
      })),
    ]);

    httpErrors.customer.notFound({
      customerId: customerIdA,
      customer: customerA,
    });

    httpErrors.customer.notFound({
      customerId: customerIdB,
      customer: customerB,
    });

    const updateA = customerDocumentConverter.removeBlacklistedCustomer(customerIdB);
    const updateB = customerDocumentConverter.removeBlacklistedCustomer(customerIdA);

    await customerService.updateCustomers([
      {
        customerId: customerIdA,
        update: updateA,
      },
      {
        customerId: customerIdB,
        update: updateB,
      },
    ]).catch(httpErrors.customer.updateMultiple([
      {
        customerId: customerIdA,
        update: updateA,
      },
      {
        customerId: customerIdB,
        update: updateB,
      },
    ]));
  };
};

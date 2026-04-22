import { customerService } from '@household/shared/dependencies/services/customer-service';
import { ICustomerService } from '@household/shared/services/customer-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<ICustomerService, 'saveCustomer' | 'saveCustomers' | 'findCustomerById' | 'getCustomerById'>>({
  saveCustomer: async ({ logServiceCall }, use) => {
    const saveCustomer: ICustomerService['saveCustomer'] = async (customer) => {
      const result = await customerService.saveCustomer(customer);
      await logServiceCall('saveCustomer', {
        customer,
      }, result);
      return result;
    };

    await use(saveCustomer);
  },
  saveCustomers: async ({ logServiceCall }, use) => {
    const saveCustomers: ICustomerService['saveCustomers'] = async (...customers) => {
      const result = await customerService.saveCustomers(...customers);
      await logServiceCall('saveCustomers', {
        customers,
      }, result);
      return result;
    };

    await use(saveCustomers);
  },
  findCustomerById: async ({ logServiceCall }, use) => {
    const findCustomerById: ICustomerService['findCustomerById'] = async (customerId) => {
      const result = await customerService.findCustomerById(customerId);
      await logServiceCall('findCustomerById', {
        customerId,
      }, result);
      return result;
    };

    await use(findCustomerById);
  },
  getCustomerById: async ({ logServiceCall }, use) => {
    const getCustomerById: ICustomerService['getCustomerById'] = async (customerId) => {
      const result = await customerService.getCustomerById(customerId);
      await logServiceCall('getCustomerById', {
        customerId,
      }, result);
      return result;
    };

    await use(getCustomerById);
  },
});

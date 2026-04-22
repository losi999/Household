import { customerService } from '@household/shared/dependencies/services/customer-service';
import { ICustomerService } from '@household/shared/services/customer-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<ICustomerService, 'saveCustomer' | 'saveCustomers' | 'findCustomerById' | 'getCustomerById'>>({
  saveCustomer: async ({ logDbCall }, use) => {
    const saveCustomer: ICustomerService['saveCustomer'] = async (customer) => {
      const result = await customerService.saveCustomer(customer);
      await logDbCall('saveCustomer', {
        customer,
      }, result);
      return result;
    };

    await use(saveCustomer);
  },
  saveCustomers: async ({ logDbCall }, use) => {
    const saveCustomers: ICustomerService['saveCustomers'] = async (...customers) => {
      const result = await customerService.saveCustomers(...customers);
      await logDbCall('saveCustomers', {
        customers,
      }, result);
      return result;
    };

    await use(saveCustomers);
  },
  findCustomerById: async ({ logDbCall }, use) => {
    const findCustomerById: ICustomerService['findCustomerById'] = async (customerId) => {
      const result = await customerService.findCustomerById(customerId);
      await logDbCall('findCustomerById', {
        customerId,
      }, result);
      return result;
    };

    await use(findCustomerById);
  },
  getCustomerById: async ({ logDbCall }, use) => {
    const getCustomerById: ICustomerService['getCustomerById'] = async (customerId) => {
      const result = await customerService.getCustomerById(customerId);
      await logDbCall('getCustomerById', {
        customerId,
      }, result);
      return result;
    };

    await use(getCustomerById);
  },
});

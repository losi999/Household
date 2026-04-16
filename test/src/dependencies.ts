import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { categoryServiceFactory } from '@household/shared/services/category-service';
import { projectServiceFactory } from '@household/shared/services/project-service';
import { recipientServiceFactory } from '@household/shared/services/recipient-service';
import { accountServiceFactory } from '@household/shared/services/account-service';
import { calendarDayServiceFactory } from '@household/shared/services/calendar-day-service';
import { calendarEntryServiceFactory } from '@household/shared/services/calendar-entry-service';
import { customerServiceFactory } from '@household/shared/services/customer-service';
import { fileServiceFactory } from '@household/shared/services/file-service';
import { priceServiceFactory } from '@household/shared/services/price-service';
import { productServiceFactory } from '@household/shared/services/product-service';
import { settingServiceFactory } from '@household/shared/services/setting-service';
import { transactionServiceFactory } from '@household/shared/services/transaction-service';

const mongoDbService = await mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING.replace('{{ENV}}', process.env.ENV));

export const projectService = projectServiceFactory(mongoDbService);
export const recipientService = recipientServiceFactory(mongoDbService);
export const customerService = customerServiceFactory(mongoDbService);
export const accountService = accountServiceFactory(mongoDbService);
export const categoryService = categoryServiceFactory(mongoDbService);
export const transactionService = transactionServiceFactory(mongoDbService);
export const productService = productServiceFactory(mongoDbService);
export const settingService = settingServiceFactory(mongoDbService);
export const fileService = fileServiceFactory(mongoDbService);
export const priceService = priceServiceFactory(mongoDbService);
export const calendarDayService = calendarDayServiceFactory(mongoDbService);
export const calendarEntryService = calendarEntryServiceFactory(mongoDbService);

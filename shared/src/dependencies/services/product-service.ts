import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { productServiceFactory } from '@household/shared/services/product-service';

export const productService = productServiceFactory(mongodbService);

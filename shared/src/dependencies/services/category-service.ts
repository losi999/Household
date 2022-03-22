import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { categoryServiceFactory } from '@household/shared/services/category-service';

export const categoryService = categoryServiceFactory(mongodbService);
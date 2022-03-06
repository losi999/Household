import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Category } from '@household/shared/types/types';
import data from '@household/moneywallet-importer/data/Category.json'
import { Types } from 'mongoose';

export const categoryImporter = (mongodbService: IMongodbService) => {
  return async () => {
    const legacyIds = data.filter(x => !!x.Name).reduce<{ [legacyId: string]: Types.ObjectId }>((accumulator, currentValue) => {

      return {
        ...accumulator,
        [currentValue.CategoryID.toLowerCase()]: new Types.ObjectId()
      }
    }, {});

    const categories = data.filter(x => !!x.Name).map<Category.Document>((c) => {
      return {
        _id: legacyIds[c.CategoryID.toLowerCase()],
        name: c.Name,
        fullName: c.FullName,
        parentCategory: legacyIds[c.ParentCategoryCategoryID?.toLowerCase()] as any,
        expiresAt: undefined,
        parentCategoryId: undefined,
      };
    });

    await mongodbService.categories.insertMany(categories);

    return legacyIds;
  };
};

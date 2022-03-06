import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Project } from '@household/shared/types/types';
import data from '@household/moneywallet-importer/data/Project.json'
import { Types } from 'mongoose';

export const projectImporter = (mongodbService: IMongodbService) => {
  return async () => {
    const legacyIds: { [legacyId: string]: Types.ObjectId } = {}

    const projects = data.filter(x => !!x.Name).map<Project.Document>((p) => {
      const id = new Types.ObjectId();

      legacyIds[p.ProjectID.toLowerCase()] = id;

      return {
        _id: id,
        name: p.Name,
        description: p.Description,
        expiresAt: undefined,
      };
    });

    await mongodbService.projects.insertMany(projects);

    return legacyIds;
  };
};

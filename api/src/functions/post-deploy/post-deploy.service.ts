import { IInfrastructureService } from '@household/shared/services/infrastructure-service';
import { IMongodbService } from '@household/shared/services/mongodb-service';

export interface IPostDeployService {
  (ctx: {
    stackName: string;
  }): Promise<void>;
}

export const postDeployServiceFactory = (mongodbService: IMongodbService, infrastructureService: IInfrastructureService): IPostDeployService =>
  async ({ stackName }) => {
    await mongodbService.syncIndexes();
    await infrastructureService.executePostDeployFunctions(stackName);
  };

import { IInfrastructureService } from '@household/shared/services/infrastructure-service';
import { IMongodbService } from '@household/shared/services/mongodb-service';

export interface IPostDeployService {
  (ctx: {
    stackName: string;
  }): Promise<unknown>;
}

export const postDeployServiceFactory = (mongodbService: IMongodbService, infrastructureService: IInfrastructureService): IPostDeployService =>
  async ({ stackName }) => {
    await mongodbService.syncIndexes();
    return infrastructureService.executePostDeployFunctions(stackName);
  };

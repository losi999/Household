import { cloudFormation } from '@household/shared/dependencies/aws/cloudformation';
import { lambda } from '@household/shared/dependencies/aws/lambda';
import { infrastructureServiceFactory } from '@household/shared/services/infrastructure-service';

export const infrastructureService = infrastructureServiceFactory(cloudFormation, lambda);

import type { CloudFormation } from '@aws-sdk/client-cloudformation';
import type { Lambda } from '@aws-sdk/client-lambda';

export interface IInfrastructureService {
  executePostDeployFunctions(stackName: string): Promise<void>;
}

export const infrastructureServiceFactory = (cloudFormation: CloudFormation, lambda: Lambda): IInfrastructureService => {
  const instance: IInfrastructureService = {
    executePostDeployFunctions: async (stackName) => {
      const infraStack = (await cloudFormation.describeStacks({
        StackName: stackName,
      })).Stacks[0];
      const steps = infraStack.Outputs.filter(output => output.OutputKey.startsWith('PostDeploy') && !!output.OutputValue);

      console.log('Post deploy functions to invoke', steps);

      await Promise.all(steps.map(s => lambda.invoke({
        FunctionName: s.OutputValue,
      })));
    },
  };

  return instance;
};

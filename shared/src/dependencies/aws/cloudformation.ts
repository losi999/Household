import { config, CloudFormation } from 'aws-sdk';

config.logger = console;
export const cloudFormation = new CloudFormation();

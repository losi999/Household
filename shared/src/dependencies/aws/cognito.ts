import { CognitoIdentityServiceProvider, config } from 'aws-sdk';

config.logger = console;
export const cognito = new CognitoIdentityServiceProvider();

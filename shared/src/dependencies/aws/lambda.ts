import { config, Lambda } from 'aws-sdk';

config.logger = console;
export const lambda = new Lambda();

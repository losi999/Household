import webpack from '@cypress/webpack-preprocessor';
import { accountService, categoryService, projectService, recipientService } from '@household/test/api/dependencies';

const setTasksFromService = <T>(on: Cypress.PluginEvents, service: T, ...functions: (keyof T)[]) => {
  on('task', functions.reduce((accumulator, currentValue) => {
    return {
      ...accumulator,
      [currentValue]: service[currentValue],
    };
  }, {}));
};

export default (on: Cypress.PluginEvents) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const options = {
    // send in the options from your webpack.config.js, so it works the same
    // as your app's code
    webpackOptions: require('../../webpack.config'),
    watchOptions: {},
  };
  on('file:preprocessor', webpack(options));
  setTasksFromService(on, projectService, 'getProjectById', 'saveProject');
  setTasksFromService(on, recipientService, 'getRecipientById', 'saveRecipient');
  setTasksFromService(on, accountService, 'getAccountById', 'saveAccount');
  setTasksFromService(on, categoryService, 'getCategoryById', 'saveCategory');
};

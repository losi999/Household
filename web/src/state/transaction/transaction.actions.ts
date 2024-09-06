import { Account, Common, Project, Transaction } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

export const transactionApiActions = createActionGroup({
  source: 'Transaction API',
  events: {
    'List transactions initiated': props<Account.AccountId & Common.Pagination<number>>(),
    'List transactions completed': props<Common.Pagination<number> & {transactions: Transaction.Response[]}>(),
    // 'Create project initiated': props<Project.Request>(),
    // 'Create project completed': props<Project.ProjectId & Project.Request>(),
    // 'Merge projects initiated': props<{
    //   sourceProjectIds: Project.Id[];
    //   targetProjectId: Project.Id;
    // }>(),
    // 'Merge projects completed': props<{sourceProjectIds: Project.Id[]}>(),
    // 'Merge projects failed': props<{sourceProjectIds: Project.Id[]}>(),
    // 'Update project initiated': props<Project.ProjectId & Project.Request>(),
    // 'Update project completed': props<Project.ProjectId & Project.Request>(),
    // 'Delete project initiated': props<Project.ProjectId>(),
    // 'Delete project completed': props<Project.ProjectId>(),
    // 'Delete project failed': props<Project.ProjectId>(),
  },
});

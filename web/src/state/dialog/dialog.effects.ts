import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, exhaustMap, mergeMap, switchMap, tap } from 'rxjs';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { DialogService } from '@household/web/services/dialog.service';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { userApiActions } from '@household/web/state/user/user.actions';
import { dispatchIfConfirmed } from '@household/web/operators/dispatch-if-confirmed';
import { fileApiActions } from '@household/web/state/file/file.actions';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { productApiActions } from '@household/web/state/product/product.actions';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { Store } from '@ngrx/store';
import { selectCustomerById } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { CalendarEntryType } from '@household/shared/enums';
import { calendarActions, calendarApiActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { isListedPrice } from '@household/shared/common/type-guards';
import { createWorkEntryTitle } from '@household/shared/common/utils';

@Injectable()
export class DialogEffects { 
  constructor(private actions: Actions, private dialogService: DialogService, private store: Store) {}

  closeAll = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.closeAll),
      exhaustMap(() => {
        this.dialogService.closeAll();
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  createProject = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.createProject),
      exhaustMap(() => {
        this.dialogService.openCreateProjectDialog();
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  updateProject = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.updateProject),
      exhaustMap(({ type, ...project }) => {
        this.dialogService.openEditProjectDialog(project);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  deleteProject = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.deleteProject),
      exhaustMap(({ type, ...project }) => {
        return this.dialogService.openDeleteProjectDialog(project).pipe(dispatchIfConfirmed(projectApiActions.deleteProjectInitiated({
          projectId: project.projectId,
        })));
      }),
    );
  });

  mergeProjects = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.mergeProjects),
      exhaustMap(({ type, ...project }) => {
        this.dialogService.openMergeProjectsDialog(project);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  createRecipient = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.createRecipient),
      exhaustMap(() => {
        this.dialogService.openCreateRecipientDialog();
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  updateRecipient = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.updateRecipient),
      exhaustMap(({ type, ...recipient }) => {
        this.dialogService.openEditRecipientDialog(recipient);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  deleteRecipient = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.deleteRecipient),
      exhaustMap(({ type, ...recipient }) => {
        return this.dialogService.openDeleteRecipientDialog(recipient).pipe(dispatchIfConfirmed(recipientApiActions.deleteRecipientInitiated({
          recipientId: recipient.recipientId,
        })));
      }),
    );
  });

  mergeRecipients = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.mergeRecipients),
      exhaustMap(({ type, ...recipient }) => {
        this.dialogService.openMergeRecipientsDialog(recipient);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  createCategory = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.createCategory),
      exhaustMap(() => {
        this.dialogService.openCreateCategoryDialog();
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  updateCategory = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.updateCategory),
      exhaustMap(({ type, ...category }) => {
        this.dialogService.openEditCategoryDialog(category);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  deleteCategory = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.deleteCategory),
      exhaustMap(({ type, ...category }) => {
        return this.dialogService.openDeleteCategoryDialog(category).pipe(dispatchIfConfirmed(categoryApiActions.deleteCategoryInitiated({
          categoryId: category.categoryId,
        })));
      }),
    );
  });

  mergeCategories = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.mergeCategories),
      exhaustMap(({ type, ...category }) => {
        this.dialogService.openMergeCategoriesDialog(category);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  createProduct = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.createProduct),
      exhaustMap(({ categoryId }) => {
        this.dialogService.openCreateProductDialog(categoryId);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  updateProduct = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.updateProduct),
      exhaustMap(({ product, categoryId }) => {
        this.dialogService.openEditProductDialog(product, categoryId);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  deleteProduct = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.deleteProduct),
      exhaustMap(({ product, categoryId }) => {
        return this.dialogService.openDeleteProductDialog(product).pipe(dispatchIfConfirmed(productApiActions.deleteProductInitiated({
          productId: product.productId,
          categoryId,
        })));
      }),
    );
  });

  mergeProducts = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.mergeProducts),
      exhaustMap(({ product, categoryId }) => {
        this.dialogService.openMergeProductsDialog(product, categoryId);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  createAccount = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.createAccount),
      exhaustMap(() => {
        this.dialogService.openCreateAccountDialog();
        return EMPTY;

      }),
    );
  }, {
    dispatch: false,
  });

  updateAccount = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.updateAccount),
      exhaustMap(({ type, ...account }) => {
        this.dialogService.openEditAccountDialog(account);
        return EMPTY;

      }),
    );
  }, {
    dispatch: false,
  });

  deleteAccount = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.deleteAccount),
      exhaustMap(({ type, ...account }) => {
        return this.dialogService.openDeleteAccountDialog(account).pipe(dispatchIfConfirmed(accountApiActions.deleteAccountInitiated({
          accountId: account.accountId,
        })));
      }),
    );
  });

  deleteFile = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.deleteFile),
      exhaustMap(({ type, ...file }) => {
        return this.dialogService.openDeleteFileDialog(file).pipe(dispatchIfConfirmed(fileApiActions.deleteFileInitiated({
          fileId: file.fileId,
        })));
      }),
    );
  });

  importFile = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.importFile),
      exhaustMap(() => {
        this.dialogService.openImportFileDialog();
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  deleteUser = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.deleteUser),
      exhaustMap(({ email }) => {
        return this.dialogService.openDeleteUserDialog({
          email,
        }).pipe(
          dispatchIfConfirmed(userApiActions.deleteUserInitiated({
            email,
          })),
        );
      }),
    );
  });

  deleteDraftTransactions = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.deleteDraftTransactions),
      exhaustMap(({ transactionIds }) => {
        return this.dialogService.openDeleteDraftTransactionsDialog(transactionIds).pipe(
          dispatchIfConfirmed(...transactionIds.map(transactionId => transactionApiActions.deleteTransactionInitiated({
            transactionId,
          }))),
        );
      }),
    );
  });

  deleteTransaction = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.deleteTransaction),
      exhaustMap(({ transactionId, navigationAction }) => {
        return this.dialogService.openDeleteTransactionDialog().pipe(
          dispatchIfConfirmed(transactionApiActions.deleteTransactionInitiated({
            transactionId,
          }),
          navigationAction),
        );
      }),
    );
  });

  createCalendarEntry = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.createCalendarEntry),
      exhaustMap(({ entryType }) => {
        this.dialogService.openCreateCalendarEntryDialog(entryType);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  updateCalendarEntry = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.updateCalendarEntry),
      exhaustMap(({ type, ...entry }) => {
        this.dialogService.openEditCalendarEntryDialog(entry);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  deleteCalendarEntry = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.deleteCalendarEntry),
      exhaustMap(({ calendarEntryId, title }) => {
        return this.dialogService.openDeleteCalendarEntryDialog(title).pipe(dispatchIfConfirmed(
          calendarApiActions.deleteCalendarEntryInitiated({
            calendarEntryId,
          }),
        ),
        tap(() => {
          this.dialogService.closeAll();
        }));
      }),
    );
  });

  openCalendarEntry = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.openCalendarEntry),
      exhaustMap(({ type, ...entry }) => {
        this.dialogService.openCalendarEntryDetailsDialog(entry);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  openEntryPayingDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarActions.openPayingDialog),
      exhaustMap(({ type, ...calendarEntry }) => {
        this.dialogService.openCalendarEntryPayingDialog(calendarEntry);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  openCashPayment = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.openCashPayment),
      exhaustMap(({ type, ...calendarEntry }) => {
        this.dialogService.openCashPaymentDialog(calendarEntry);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  createCalendarEntryWithProposal = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.createCalendarEntryWithProposal),
      exhaustMap(({ customerJob, day, timeInterval }) => {
        this.dialogService.openCalendarEntryDialogWithProposal(day, customerJob, timeInterval);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });

  confirmCalendarEntryProposal = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.confirmCalendarEntryProposal),
      exhaustMap(({ day, timeInterval, customerJob: { customer, ...job } }) => {
        const title = createWorkEntryTitle(customer, job);
        return this.dialogService.openConfirmCalendarEntryProposalDialog(title, day, timeInterval).pipe(dispatchIfConfirmed(
          calendarApiActions.createCalendarEntryInitiated({
            entryType: CalendarEntryType.Work,
            day,
            title,
            start: timeInterval.start,
            end: timeInterval.end,
            description: job.description,
            prices: job.prices.map((p) => {
              if (isListedPrice(p)) {
                return {
                  priceId: p.priceId,
                  quantity: p.quantity,
                };
              }
              
              return {
                name: p.name,
                amount: p.amount,
              };
            }),
            customerId: customer.customerId,
          }),
        ));
      }),
    );
  });

  setWorkDay = createEffect(() => {
    return this.actions.pipe(
      ofType(dialogActions.setWorkDay),
      exhaustMap(({ type, ...day }) => {
        this.dialogService.openSetWorkDayDialog(day);
        return EMPTY;
      }),
    );
  }, {
    dispatch: false,
  });
}

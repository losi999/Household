import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, exhaustMap, map } from 'rxjs';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { DialogService } from '@household/web/app/shared/dialog.service';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { productApiActions } from '@household/web/state/product/product.actions';
import { accountApiActions } from '@household/web/state/account/account.actions';

@Injectable()
export class DialogEffects {
  constructor(private actions: Actions, private dialogService: DialogService) {}

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
        return this.dialogService.openDeleteProjectDialog(project).afterClosed()
          .pipe(
            map((shouldDelete) => {
              if (shouldDelete) {
                return projectApiActions.deleteProjectInitiated({
                  projectId: project.projectId,
                });
              }
            }),
          );
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
        return this.dialogService.openDeleteRecipientDialog(recipient).afterClosed()
          .pipe(
            map((shouldDelete) => {
              if (shouldDelete) {
                return recipientApiActions.deleteRecipientInitiated({
                  recipientId: recipient.recipientId,
                });
              }
            }),
          );
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
        return this.dialogService.openDeleteCategoryDialog(category).afterClosed()
          .pipe(
            map((shouldDelete) => {
              if (shouldDelete) {
                return categoryApiActions.deleteCategoryInitiated({
                  categoryId: category.categoryId,
                });
              }
            }),
          );
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
        return this.dialogService.openDeleteProductDialog(product).afterClosed()
          .pipe(
            map((shouldDelete) => {
              if (shouldDelete) {
                return productApiActions.deleteProductInitiated({
                  productId: product.productId,
                  categoryId,
                });
              }
            }),
          );
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
        return this.dialogService.openDeleteAccountDialog(account).afterClosed()
          .pipe(
            map((shouldDelete) => {
              if (shouldDelete) {
                return accountApiActions.deleteAccountInitiated({
                  accountId: account.accountId,
                });
              }
            }),
          );
      }),
    );
  });
}

import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Account, Category, File, Product, Project, Recipient, Transaction, User } from '@household/shared/types/types';
import { AccountFormComponent, AccountFormData } from '@household/web/app/account/account-form/account-form.component';
import { CategoryFormComponent, CategoryFormData } from '@household/web/app/category/category-form/category-form.component';
import { CategoryMergeDialogComponent, CategoryMergeDialogData } from '@household/web/app/category/category-merge-dialog/category-merge-dialog.component';
import { ImportFileUploadFormComponent } from '@household/web/app/import/import-file-upload-form/import-file-upload-form.component';
import { ProductFormComponent, ProductFormData } from '@household/web/app/product/product-form/product-form.component';
import { ProductMergeDialogComponent, ProductMergeDialogData } from '@household/web/app/product/product-merge-dialog/product-merge-dialog.component';
import { ProjectFormComponent, ProjectFormData } from '@household/web/app/project/project-form/project-form.component';
import { ProjectMergeDialogComponent, ProjectMergeDialogData } from '@household/web/app/project/project-merge-dialog/project-merge-dialog.component';
import { RecipientFormComponent, RecipientFormData } from '@household/web/app/recipient/recipient-form/recipient-form.component';
import { RecipientMergeDialogComponent, RecipientMergeDialogData } from '@household/web/app/recipient/recipient-merge-dialog/recipient-merge-dialog.component';
import { ConfirmationDialogComponent } from '@household/web/app/shared/confirmation-dialog/confirmation-dialog.component';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { fileApiActions } from '@household/web/state/file/file.actions';
import { hairdressingActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { productApiActions } from '@household/web/state/product/product.actions';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { userApiActions } from '@household/web/state/user/user.actions';
import { Action, Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class DialogService {

  constructor(private dialog: MatDialog, private store: Store) { }

  private openConfirmationDialog(title: string, content: string, action: Action) {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title,
        content,
      },
    }).afterClosed()
      .subscribe((shouldDelete) => {
        if (shouldDelete) {
          this.store.dispatch(action);
        }
      });
  }

  openCreateProjectDialog(): void {
    this.dialog.open<ProjectFormComponent, ProjectFormData, void>(ProjectFormComponent);
  }

  openEditProjectDialog(project: Project.Response): void {
    this.dialog.open<ProjectFormComponent, ProjectFormData, void>(ProjectFormComponent, {
      data: project,
    });
  }

  openDeleteProjectDialog(project: Project.Response): void {
    this.openConfirmationDialog('Törölni akarod ezt a projektet?', project.name, projectApiActions.deleteProjectInitiated({
      projectId: project.projectId,
    }));
  }

  openMergeProjectsDialog(project: Project.Response) {
    this.dialog.open<ProjectMergeDialogComponent, ProjectMergeDialogData, void>(ProjectMergeDialogComponent, {
      data: project.projectId,
    });
  }

  openCreateRecipientDialog(): void {
    this.dialog.open<RecipientFormComponent, RecipientFormData, void>(RecipientFormComponent);
  }

  openEditRecipientDialog(recipient: Recipient.Response): void {
    this.dialog.open<RecipientFormComponent, RecipientFormData, void>(RecipientFormComponent, {
      data: recipient,
    });
  }

  openDeleteRecipientDialog(recipient: Recipient.Response): void {
    this.openConfirmationDialog('Törölni akarod ezt a partnert?', recipient.name, recipientApiActions.deleteRecipientInitiated({
      recipientId: recipient.recipientId,
    }));
  }

  openMergeRecipientsDialog(recipient: Recipient.Response) {
    this.dialog.open<RecipientMergeDialogComponent, RecipientMergeDialogData, void>(RecipientMergeDialogComponent, {
      data: recipient.recipientId,
    });
  }

  openCreateCategoryDialog(): void {
    this.dialog.open<CategoryFormComponent, CategoryFormData, void>(CategoryFormComponent, {
      data: undefined,
    });
  }

  openEditCategoryDialog(category: Category.Response): void {
    this.dialog.open<CategoryFormComponent, CategoryFormData, void>(CategoryFormComponent, {
      data: category,
    });
  }

  openDeleteCategoryDialog(category: Category.Response): void {
    this.openConfirmationDialog('Törölni akarod ezt a kategóriát?', category.name, categoryApiActions.deleteCategoryInitiated({
      categoryId: category.categoryId,
    }));
  }

  openMergeCategoriesDialog(category: Category.Response) {
    this.dialog.open<CategoryMergeDialogComponent, CategoryMergeDialogData, void>(CategoryMergeDialogComponent, {
      data: category.categoryId,
    });
  }

  openCreateProductDialog(categoryId?: Category.Id) {
    this.dialog.open<ProductFormComponent, ProductFormData, void>(ProductFormComponent, {
      data: {
        product: undefined,
        categoryId,
      },
    });
  }

  openEditProductDialog(product: Product.Response, categoryId: Category.Id) {
    this.dialog.open<ProductFormComponent, ProductFormData, void>(ProductFormComponent, {
      data: {
        product,
        categoryId,
      },
    });
  }

  openDeleteProductDialog(product: Product.Response, categoryId: Category.Id): void {
    this.openConfirmationDialog('Törölni akarod ezt a terméket?', product.fullName, productApiActions.deleteProductInitiated({
      productId: product.productId,
      categoryId,
    }));
  }

  openMergeProductsDialog(product: Product.Response, categoryId: Category.Id) {
    this.dialog.open<ProductMergeDialogComponent, ProductMergeDialogData, void>(ProductMergeDialogComponent, {
      data: {
        categoryId,
        targetProductId: product.productId,
      },
    });
  }

  openCreateAccountDialog(): void {
    this.dialog.open<AccountFormComponent, AccountFormData, void>(AccountFormComponent);
  }

  openEditAccountDialog(account: Account.Response): void {
    this.dialog.open<AccountFormComponent, AccountFormData, void>(AccountFormComponent, {
      data: account,
    });
  }

  openDeleteAccountDialog(account: Account.Response): void {
    this.openConfirmationDialog('Törölni akarod ezt a számlát?', account.name, accountApiActions.deleteAccountInitiated({
      accountId: account.accountId,
    }));
  }

  openDeleteTransactionDialog(): MatDialogRef<ConfirmationDialogComponent, boolean> {
    // this.openConfirmationDialog('Törölni akarod ezt a tranzakciót?', undefined, projectApiActions.deleteProjectInitiated({
    //   projectId: project.projectId,
    // }));

    return this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: {
        title: 'Törölni akarod ezt a tranzakciót?',
      },
    });
  }

  openImportFileDialog(): void {
    this.dialog.open<ImportFileUploadFormComponent, void, void>(ImportFileUploadFormComponent);
  }

  openDeleteFileDialog(file: File.Response): void {
    this.openConfirmationDialog('Törölni akarod ezt a számlát?', file.fileId, fileApiActions.deleteFileInitiated({
      fileId: file.fileId,
    }));
  }

  openDeleteUserDialog({ email }: User.Email): void {
    this.openConfirmationDialog('Törölni akarod ezt a felhasználót?', email, userApiActions.deleteUserInitiated({
      email,
    }));
  }

  openDeleteIncomeDialog(data: Transaction.TransactionId & {day: Date}): void {
    this.openConfirmationDialog('Törölni akarod a bevételt?', new Intl.DateTimeFormat('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(data.day), hairdressingActions.deleteIncomeInitiated({
      transactionId: data.transactionId,
    }));
  }
}

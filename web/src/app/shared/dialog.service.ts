import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Account, Category, Product, Project, Recipient } from '@household/shared/types/types';
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

@Injectable({
  providedIn: 'root',
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  openCreateProjectDialog(): void {
    this.dialog.open<ProjectFormComponent, ProjectFormData, void>(ProjectFormComponent);
  }

  openEditProjectDialog(project: Project.Response): void {
    this.dialog.open<ProjectFormComponent, ProjectFormData, void>(ProjectFormComponent, {
      data: project,
    });
  }

  openDeleteProjectDialog(project: Project.Response): MatDialogRef<ConfirmationDialogComponent, boolean> {
    return this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Törölni akarod ezt a projektet?',
        content: project.name,
      },
    });
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

  openDeleteRecipientDialog(recipient: Recipient.Response): MatDialogRef<ConfirmationDialogComponent, boolean> {
    return this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Törölni akarod ezt a partnert?',
        content: recipient.name,
      },
    });
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

  openDeleteCategoryDialog(category: Category.Response): MatDialogRef<ConfirmationDialogComponent, boolean> {
    return this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Törölni akarod ezt a kategóriát?',
        content: category.name,
      },
    });
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

  openDeleteProductDialog(product: Product.Response): MatDialogRef<ConfirmationDialogComponent, boolean> {
    return this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Törölni akarod ezt a terméket?',
        content: product.fullName,
      },
    });
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

  openDeleteAccountDialog(account: Account.Response): MatDialogRef<ConfirmationDialogComponent, boolean> {
    return this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Törölni akarod ezt a számlát?',
        content: account.name,
      },
    });
  }

  openDeleteTransactionDialog(): MatDialogRef<ConfirmationDialogComponent, boolean> {
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
}

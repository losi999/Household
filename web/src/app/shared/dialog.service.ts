import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Account, Category, Product, Project, Recipient } from '@household/shared/types/types';
import { AccountFormComponent, AccountFormData } from 'src/app/account/account-form/account-form.component';
import { CategoryFormComponent, CategoryFormData } from 'src/app/category/category-form/category-form.component';
import { CategoryMergeDialogComponent, CategoryMergeDialogData } from 'src/app/category/category-merge-dialog/category-merge-dialog.component';
import { ProductFormComponent, ProductFormData } from 'src/app/product/product-form/product-form.component';
import { ProductMergeDialogComponent, ProductMergeDialogData } from 'src/app/product/product-merge-dialog/product-merge-dialog.component';
import { ProjectFormComponent, ProjectFormData } from 'src/app/project/project-form/project-form.component';
import { ProjectMergeDialogComponent, ProjectMergeDialogData } from 'src/app/project/project-merge-dialog/project-merge-dialog.component';
import { RecipientFormComponent, RecipientFormData } from 'src/app/recipient/recipient-form/recipient-form.component';
import { RecipientMergeDialogComponent, RecipientMergeDialogData } from 'src/app/recipient/recipient-merge-dialog/recipient-merge-dialog.component';
import { ReportFilterDialogComponent, ReportFilterDialogData } from 'src/app/report/report-filter-dialog/report-filter-dialog.component';
import { ProductFlatTree } from 'src/app/report/report-home/report-home.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

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

  openEditProductDialog(product: Product.Response) {
    this.dialog.open<ProductFormComponent, ProductFormData, void>(ProductFormComponent, {
      data: {
        product,
        categoryId: undefined,
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

  openAccountFilterDialog(accounts: Account.Response[], selectedItems: Account.Id[]): MatDialogRef<ReportFilterDialogComponent, Account.Id[]> {
    return this.dialog.open<ReportFilterDialogComponent, ReportFilterDialogData>(ReportFilterDialogComponent, {
      data: {
        items: accounts,
        title: 'Számlák',
        displayPropertyName: 'name',
        keyPropertyName: 'accountId',
        selectedItems,
      },
    });
  }

  openProductFilterDialog(products: ProductFlatTree[], selectedItems: Product.Id[]): MatDialogRef<ReportFilterDialogComponent, Product.Id[]> {
    return this.dialog.open<ReportFilterDialogComponent, ReportFilterDialogData>(ReportFilterDialogComponent, {
      data: {
        items: products,
        title: 'Termékek',
        displayPropertyName: 'value',
        keyPropertyName: 'key',
        parentPropertyName: 'parent',
        selectedItems,
      },
    });
  }

  openCategoryFilterDialog(categories: Category.Response[], selectedItems: Category.Id[]): MatDialogRef<ReportFilterDialogComponent, Category.Id[]> {
    return this.dialog.open<ReportFilterDialogComponent, ReportFilterDialogData>(ReportFilterDialogComponent, {
      data: {
        items: categories,
        title: 'Kategóriák',
        displayPropertyName: 'fullName',
        keyPropertyName: 'categoryId',
        parentPropertyName: 'parentCategory',
        selectedItems,
      },
    });
  }

  openProjectFilterDialog(projects: Project.Response[], selectedItems: Project.Id[]): MatDialogRef<ReportFilterDialogComponent, Project.Id[]> {
    return this.dialog.open<ReportFilterDialogComponent, ReportFilterDialogData>(ReportFilterDialogComponent, {
      data: {
        items: projects,
        title: 'Projektek',
        displayPropertyName: 'name',
        keyPropertyName: 'projectId',
        selectedItems,
      },
    });
  }

  openRecipientFilterDialog(recipients: Recipient.Response[], selectedItems: Recipient.Id[]): MatDialogRef<ReportFilterDialogComponent, Recipient.Id[]> {
    return this.dialog.open<ReportFilterDialogComponent, ReportFilterDialogData>(ReportFilterDialogComponent, {
      data: {
        items: recipients,
        title: 'Partnerek',
        displayPropertyName: 'name',
        keyPropertyName: 'recipientId',
        selectedItems,
      },
    });
  }
}

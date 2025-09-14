import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEntryType } from '@household/shared/enums';
import { Account, Calendar, Category, Customer, File, Price, Product, Project, Recipient, Transaction, User } from '@household/shared/types/types';
import { AccountFormComponent, AccountFormData } from '@household/web/app/account/account-form/account-form.component';
import { CategoryFormComponent, CategoryFormData } from '@household/web/app/category/category-form/category-form.component';
import { CategoryMergeDialogComponent, CategoryMergeDialogData } from '@household/web/app/category/category-merge-dialog/category-merge-dialog.component';
import { CustomerFormComponent, CustomerFormData } from '@household/web/app/customer/customer-form/customer-form.component';
import { CustomerJobDialogComponent, CustomerJobDialogData } from '@household/web/app/customer/customer-job-dialog/customer-job-dialog.component';
import { HairdressingCalendarEntryDialogComponent, HairdressingCalendarEntryDialogData } from '@household/web/app/hairdressing/hairdressing-calendar-entry-dialog/hairdressing-calendar-entry-dialog.component';
import { HairdressingCalendarWorkEntryDateTimeDialogComponent, HairdressingCalendarWorkEntryDateTimeDialogData } from '@household/web/app/hairdressing/hairdressing-calendar-work-entry-date-time-dialog/hairdressing-calendar-work-entry-date-time-dialog.component';
import { HairdressingCalendarWorkdayDialogComponent, HairdressingCalendarWorkdayDialogData } from '@household/web/app/hairdressing/hairdressing-calendar-workday-dialog/hairdressing-calendar-workday-dialog.component';
import { HairdressingPriceFormComponent, HairdressingPriceFormData } from '@household/web/app/hairdressing/hairdressing-price-form/hairdressing-price-form.component';
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

  private openConfirmationDialog(title: string, content?: string) {
    return this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title,
        content,
      },
    }).afterClosed();
  }

  closeAll() {
    this.dialog.closeAll();
  }

  openCreateProjectDialog(): void {
    this.dialog.open<ProjectFormComponent, ProjectFormData, void>(ProjectFormComponent);
  }

  openEditProjectDialog(project: Project.Response): void {
    this.dialog.open<ProjectFormComponent, ProjectFormData, void>(ProjectFormComponent, {
      data: project,
    });
  }

  openDeleteProjectDialog(project: Project.Response) {
    return this.openConfirmationDialog('Törölni akarod ezt a projektet?', project.name);
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

  openDeleteRecipientDialog(recipient: Recipient.Response) {
    return this.openConfirmationDialog('Törölni akarod ezt a partnert?', recipient.name);
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

  openDeleteCategoryDialog(category: Category.Response) {
    return this.openConfirmationDialog('Törölni akarod ezt a kategóriát?', category.name);
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

  openDeleteProductDialog(product: Product.Response) {
    return this.openConfirmationDialog('Törölni akarod ezt a terméket?', product.fullName);
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

  openDeleteAccountDialog(account: Account.Response) {
    return this.openConfirmationDialog('Törölni akarod ezt a számlát?', account.name);
  }

  openCreateCustomerDialog(): void {
    this.dialog.open<CustomerFormComponent, CustomerFormData, void>(CustomerFormComponent);
  }

  openEditCustomerDialog(customer: Customer.Response): void {
    this.dialog.open<CustomerFormComponent, CustomerFormData, void>(CustomerFormComponent, {
      data: customer,
    });
  }

  openCreateCustomerJobDialog(customerId: Customer.Id): void {
    this.dialog.open<CustomerJobDialogComponent, CustomerJobDialogData, void>(CustomerJobDialogComponent, {
      data: {
        customerId,
      },
      width: '900px',
      maxHeight: '90vh',
    });
  }

  openEditCustomerJobDialog(customerId: Customer.Id, job: Customer.Job.Response): void {
    this.dialog.open<CustomerJobDialogComponent, CustomerJobDialogData, void>(CustomerJobDialogComponent, {
      data: {
        customerId,
        job,
      },
      width: '900px',
      maxHeight: '90vh',
    });
  }

  openDeleteCustomerJobDialog({ name }: Customer.Job.Name) {
    return this.openConfirmationDialog('Törölni akarod ezt a munkát?', name);
  }

  openCreatePriceDialog(): void {
    this.dialog.open<HairdressingPriceFormComponent, HairdressingPriceFormData, void>(HairdressingPriceFormComponent);
  }

  openEditPriceDialog(price: Price.Response): void {
    this.dialog.open<HairdressingPriceFormComponent, HairdressingPriceFormData, void>(HairdressingPriceFormComponent, {
      data: price,
    });
  }

  openDeletePriceDialog(price: Price.Response) {
    return this.openConfirmationDialog('Törölni akarod ezt a tételt az árlistából?', price.name);
  }

  openImportFileDialog(): void {
    this.dialog.open<ImportFileUploadFormComponent, void, void>(ImportFileUploadFormComponent);
  }

  openDeleteFileDialog(file: File.Response) {
    return this.openConfirmationDialog('Törölni akarod ezt a számlát?', file.fileId);
  }

  openDeleteUserDialog({ email }: User.Email) {
    return this.openConfirmationDialog('Törölni akarod ezt a felhasználót?', email);
  }

  openDeleteDraftTransactionsDialog(transactionIds: Transaction.Id[]) {
    return this.openConfirmationDialog(`Törölni akarsz ${transactionIds.length} tranzakciót?`);
  }

  openDeleteTransactionDialog() {
    return this.openConfirmationDialog('Törölni akarod ezt a tranzakciót?');
  }

  openCreateCalendarEntryDialog(entryType: CalendarEntryType.Issue | CalendarEntryType.Personal) {
    this.dialog.open<HairdressingCalendarEntryDialogComponent, HairdressingCalendarEntryDialogData, void>(HairdressingCalendarEntryDialogComponent, {
      data: {
        entryType,
      },
      width: '900px',
    });
  }

  openEditCalendarEntryDialog(day: Calendar.DayProp['day'], entry: Calendar.Entry.Response) {
    this.dialog.open<HairdressingCalendarEntryDialogComponent, HairdressingCalendarEntryDialogData, void>(HairdressingCalendarEntryDialogComponent, {
      data: {
        day,
        ...entry,
      },
      width: '900px',
    });
  }

  openDeleteCalendarEntryDialog(title: Calendar.Entry.Response['title']) {
    return this.openConfirmationDialog('Törölni akarod ezt a bejegyzést a naptárból?', title);
  }

  openCalendarWorkEntryDateTimeDialog(data: HairdressingCalendarWorkEntryDateTimeDialogData) {
    this.dialog.open<HairdressingCalendarWorkEntryDateTimeDialogComponent, HairdressingCalendarWorkEntryDateTimeDialogData, void>(HairdressingCalendarWorkEntryDateTimeDialogComponent, {
      data,
      width: '900px',
    });
  }

  openSetVacationDayDialog(day: string) {
    return this.openConfirmationDialog('Szabadságnak akarod ezt a napot jelölni?', new Date(day).toLocaleString('hu', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }));
  }

  openSetWorkDayDialog(day: Exclude<Calendar.Day.Response, Calendar.Day.HolidayResponse>) {
    return this.dialog.open<HairdressingCalendarWorkdayDialogComponent, HairdressingCalendarWorkdayDialogData, void>(HairdressingCalendarWorkdayDialogComponent, {
      data: day,
      width: '900px',
    });
  }
}

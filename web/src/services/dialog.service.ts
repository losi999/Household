import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEntryType } from '@household/shared/enums';
import { Account, Calendar, Category, Customer, File, Product, Project, Recipient, Transaction, User } from '@household/shared/types/types';
import { AccountFormComponent, AccountFormData } from '@household/web/app/account/account-form/account-form.component';
import { CategoryFormComponent, CategoryFormData } from '@household/web/app/category/category-form/category-form.component';
import { CategoryMergeDialogComponent, CategoryMergeDialogData } from '@household/web/app/category/category-merge-dialog/category-merge-dialog.component';
import { CustomerDialogComponent, CustomerDialogData } from '@household/web/app/hairdressing/customer/customer-dialog/customer-dialog.component';
import { CustomerJobDialogComponent, CustomerJobDialogData } from '@household/web/app/hairdressing/customer/customer-job-dialog/customer-job-dialog.component';
import { CalendarEntryDetailsDialogComponent, CalendarEntryDetailsDialogData } from '@household/web/app/hairdressing/calendar/calendar-entry-details-dialog/calendar-entry-details-dialog.component';
import { CalendarEntryEditDialogComponent, CalendarEntryEditDialogData } from '@household/web/app/hairdressing/calendar/calendar-entry-edit-dialog/calendar-entry-edit-dialog.component';
import { CalendarWorkdayDialogComponent, CalendarWorkdayDialogData } from '@household/web/app/hairdressing/calendar/calendar-workday-dialog/calendar-workday-dialog.component';
import { ImportFileUploadFormComponent } from '@household/web/app/import/import-file-upload-form/import-file-upload-form.component';
import { ProductFormComponent, ProductFormData } from '@household/web/app/product/product-form/product-form.component';
import { ProductMergeDialogComponent, ProductMergeDialogData } from '@household/web/app/product/product-merge-dialog/product-merge-dialog.component';
import { ProjectFormComponent, ProjectFormData } from '@household/web/app/project/project-form/project-form.component';
import { ProjectMergeDialogComponent, ProjectMergeDialogData } from '@household/web/app/project/project-merge-dialog/project-merge-dialog.component';
import { RecipientFormComponent, RecipientFormData } from '@household/web/app/recipient/recipient-form/recipient-form.component';
import { RecipientMergeDialogComponent, RecipientMergeDialogData } from '@household/web/app/recipient/recipient-merge-dialog/recipient-merge-dialog.component';
import { ConfirmationDialogComponent } from '@household/web/app/shared/confirmation-dialog/confirmation-dialog.component';
import { CustomerAddToBlacklistDialogComponent, CustomerAddToBlacklistDialogData } from '@household/web/app/hairdressing/customer/customer-add-to-blacklist-dialog/customer-add-to-blacklist-dialog.component';
import { createWorkEntryTitle, timeSlotToTimeString } from '@household/shared/common/utils';
import { CustomerJob } from '@household/web/types/common';
import { CalendarCashPaymentDialogComponent, CalendarCashPaymentDialogData } from '@household/web/app/hairdressing/calendar/calendar-cash-payment-dialog/calendar-cash-payment-dialog.component';
import { CalendarEntryPayingDialogComponent } from '@household/web/app/hairdressing/calendar/calendar-entry-paying-dialog/calendar-entry-paying-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  private openConfirmationDialog_(title: string, content?: string) {
    return this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title,
        content,
      },
      disableClose: true,
    }).afterClosed();
  }

  closeAll() {
    this.dialog.closeAll();
  }

  openConfirmationDialog(data: {title: string; 
    content?: string}) {
    return this.dialog.open(ConfirmationDialogComponent, {
      data,
      disableClose: true,
    }).afterClosed();
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
    return this.openConfirmationDialog_('Törölni akarod ezt a projektet?', project.name);
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
    return this.openConfirmationDialog_('Törölni akarod ezt a partnert?', recipient.name);
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
    return this.openConfirmationDialog_('Törölni akarod ezt a kategóriát?', category.name);
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
    return this.openConfirmationDialog_('Törölni akarod ezt a terméket?', product.fullName);
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
    return this.openConfirmationDialog_('Törölni akarod ezt a számlát?', account.name);
  }

  openCreateCustomerDialog(): void {
    this.dialog.open<CustomerDialogComponent, CustomerDialogData, void>(CustomerDialogComponent, {
      disableClose: true,
    });
  }

  openEditCustomerDialog(customer: Customer.Response): void {
    this.dialog.open<CustomerDialogComponent, CustomerDialogData, void>(CustomerDialogComponent, {
      data: customer,
      disableClose: true,
    });
  }

  openCreateCustomerJobDialog(customerId: Customer.Id): void {
    this.dialog.open<CustomerJobDialogComponent, CustomerJobDialogData, void>(CustomerJobDialogComponent, {
      data: {
        customerId,
      },
      width: '900px',
      maxHeight: '90vh',
      disableClose: true,
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
      disableClose: true,
    });
  }

  openDeleteCustomerJobDialog({ name }: Customer.Job.Name) {
    return this.openConfirmationDialog_('Törölni akarod ezt a munkát?', name);
  }

  openAddCustomerToBlacklistDialog(customer: Customer.Response) {
    return this.dialog.open<CustomerAddToBlacklistDialogComponent, CustomerAddToBlacklistDialogData, void>(CustomerAddToBlacklistDialogComponent, {
      data: {
        customer,
        excludedCustomerIds: [
          customer.customerId,
          ...customer.blacklistedCustomers.map(c => c.customerId),
        ],
      },
      disableClose: true,
    });
  }

  openDeleteCustomerFromBlacklistDialog([
    customerA,
    customerB]: Customer.Response[
  ]) {
    return this.openConfirmationDialog_('Törölni akarod a tiltást közöttük?', `${customerA.name} és ${customerB.name}`);
  }

  openImportFileDialog(): void {
    this.dialog.open<ImportFileUploadFormComponent, void, void>(ImportFileUploadFormComponent);
  }

  openDeleteFileDialog(file: File.Response) {
    return this.openConfirmationDialog_('Törölni akarod ezt a fájlt?', file.fileId);
  }

  openDeleteUserDialog({ email }: User.Email) {
    return this.openConfirmationDialog_('Törölni akarod ezt a felhasználót?', email);
  }

  openDeleteDraftTransactionsDialog(transactionIds: Transaction.Id[]) {
    return this.openConfirmationDialog_(`Törölni akarsz ${transactionIds.length} tranzakciót?`);
  }

  openDeleteTransactionDialog() {
    return this.openConfirmationDialog_('Törölni akarod ezt a tranzakciót?');
  }

  openCreateCalendarEntryDialog(entryType: CalendarEntryType) {
    this.dialog.open<CalendarEntryEditDialogComponent, CalendarEntryEditDialogData, void>(CalendarEntryEditDialogComponent, {
      data: {
        entryType,
      },
      width: '900px',
      disableClose: true,
    });
  }

  openEditCalendarEntryDialog(entry: Calendar.Entry.Response) {
    this.dialog.open<CalendarEntryEditDialogComponent, CalendarEntryEditDialogData, void>(CalendarEntryEditDialogComponent, {
      data: entry,
      width: '900px',
      disableClose: true,
    });
  }

  openCalendarEntryDetailsDialog(entry: Calendar.Entry.Response) {
    this.dialog.open<CalendarEntryDetailsDialogComponent, CalendarEntryDetailsDialogData, void>(CalendarEntryDetailsDialogComponent, {
      data: entry,
      width: '900px',
    });
  }

  openDeleteCalendarEntryDialog(title: Calendar.Entry.Response['title']) {
    return this.openConfirmationDialog_('Törölni akarod ezt a bejegyzést a naptárból?', title);
  }

  openConfirmCalendarEntryProposalDialog(title: string, day: string, timeInterval: Calendar.TimeInterval) {
    return this.openConfirmationDialog_('Rögzíted ezt a munkát erre az időpontra?', `${title} ${new Date(day).toLocaleString('hu', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })} ${timeSlotToTimeString(timeInterval.start)}-${timeSlotToTimeString(timeInterval.end)}`);
  }

  openCalendarEntryDialogWithProposal(day: string, { customer, ...job }: CustomerJob, timeInterval: Calendar.TimeInterval) {
    this.dialog.open<CalendarEntryEditDialogComponent, CalendarEntryEditDialogData, void>(CalendarEntryEditDialogComponent, {
      data: {
        entryType: CalendarEntryType.Work,
        customer,
        day,
        description: job.description,
        title: createWorkEntryTitle(customer, job),
        prices: job.prices,
        start: timeInterval.start,
        end: timeInterval.start + job.duration,
      },
      width: '900px',
      disableClose: true,
    });
  }

  openCalendarEntryPayingDialog(calendarEntry: Calendar.Entry.WorkEntryResponse) {
    this.dialog.open(CalendarEntryPayingDialogComponent, {
      data: calendarEntry,
      width: '900px',
      maxHeight: '90vh',
      disableClose: true,
    });
  }

  openCashPaymentDialog(calendarEntry: Calendar.Entry.WorkEntryResponse) {
    this.dialog.open<CalendarCashPaymentDialogComponent, CalendarCashPaymentDialogData, any>(CalendarCashPaymentDialogComponent, {
      data: calendarEntry,
      disableClose: true,
    });
  }

  openSetWorkDayDialog(day: Exclude<Calendar.Day.Response, Calendar.Day.HolidayResponse>) {
    return this.dialog.open<CalendarWorkdayDialogComponent, CalendarWorkdayDialogData, void>(CalendarWorkdayDialogComponent, {
      data: day,
      width: '900px',
      disableClose: true,
    });
  }
}

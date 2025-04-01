import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportHomeComponent } from './import-home/import-home.component';
import { ImportRoutingModule } from '@household/web/app/import/import-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ImportFileUploadFormComponent } from './import-file-upload-form/import-file-upload-form.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { ImportFileListComponent } from './import-file-list/import-file-list.component';
import { ImportFileListItemComponent } from './import-file-list-item/import-file-list-item.component';
import { MatListModule } from '@angular/material/list';
import { ImportTransactionsHomeComponent } from './import-transactions-home/import-transactions-home.component';
import { ImportTransactionsListComponent } from './import-transactions-list/import-transactions-list.component';
import { ImportTransactionsListItemComponent } from './import-transactions-list-item/import-transactions-list-item.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { TransactionModule } from '@household/web/app/transaction/transaction.module';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    ImportHomeComponent,
    ImportFileUploadFormComponent,
    ImportFileListComponent,
    ImportFileListItemComponent,
    ImportTransactionsHomeComponent,
    ImportTransactionsListComponent,
    ImportTransactionsListItemComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToolbarComponent,
    MatButtonModule,
    MatIconModule,
    ImportRoutingModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    NgxSkeletonLoaderModule,
    TransactionModule,
    MatMenuModule,
  ],
})
export class ImportModule { }

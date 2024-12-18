import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipientHomeComponent } from './recipient-home/recipient-home.component';
import { RecipientListComponent } from './recipient-list/recipient-list.component';
import { RecipientListItemComponent } from './recipient-list-item/recipient-list-item.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RecipientRoutingModule } from '@household/web/app/recipient/recipient-routing.module';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RecipientFormComponent } from './recipient-form/recipient-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RecipientMergeDialogComponent } from './recipient-merge-dialog/recipient-merge-dialog.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
  declarations: [
    RecipientHomeComponent,
    RecipientListComponent,
    RecipientListItemComponent,
    RecipientFormComponent,
    RecipientMergeDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    RecipientRoutingModule,
    MatListModule,
    MatBottomSheetModule,
    MatDialogModule,
    ToolbarComponent,
    ClearableInputComponent,
    NgxSkeletonLoaderModule,
  ],
})
export class RecipientModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipientHomeComponent } from './recipient-home/recipient-home.component';
import { RecipientListComponent } from './recipient-list/recipient-list.component';
import { RecipientListItemComponent } from './recipient-list-item/recipient-list-item.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RecipientRoutingModule } from 'src/app/recipient/recipient-routing.module';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RecipientFormComponent } from './recipient-form/recipient-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    RecipientHomeComponent,
    RecipientListComponent,
    RecipientListItemComponent,
    RecipientFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    RecipientRoutingModule,
    MatListModule,
    MatBottomSheetModule,
    MatDialogModule,
  ],
})
export class RecipientModule { }

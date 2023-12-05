import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRoutingModule } from 'src/app/report/report-routing.module';
import { ReportHomeComponent } from 'src/app/report/report-home/report-home.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectAllListComponent } from 'src/app/shared/select-all-list/select-all-list.component';
import { MatButtonModule } from '@angular/material/button';
import { ToolbarComponent } from 'src/app/shared/toolbar/toolbar.component';
import { DatetimeInputComponent } from 'src/app/shared/datetime-input/datetime-input.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { ReportFilterDialogComponent } from 'src/app/report/report-filter-dialog/report-filter-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReportListComponent } from 'src/app/report/report-list/report-list.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    ReportHomeComponent,
    ReportFilterDialogComponent,
    ReportListComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportRoutingModule,
    MatExpansionModule,
    MatButtonModule,
    SelectAllListComponent,
    ToolbarComponent,
    DatetimeInputComponent,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDialogModule,
    MatTreeModule,
    MatDividerModule,
    MatChipsModule,
    CdkDropList,
    CdkDrag,
  ],
})
export class ReportModule { }

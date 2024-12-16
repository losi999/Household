import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRoutingModule } from '@household/web/app/report/report-routing.module';
import { ReportHomeComponent } from '@household/web/app/report/report-home/report-home.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { ReportListComponent } from '@household/web/app/report/report-list/report-list.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatChipsModule } from '@angular/material/chips';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ReportCatalogItemFilterComponent } from './report-catalog-item-filter/report-catalog-item-filter.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportDateRangeFilterComponent } from './report-date-range-filter/report-date-range-filter.component';
import { MatListModule } from '@angular/material/list';
import { ReportListTreeBuilderPipe } from '@household/web/app/report/report-list-tree-builder.pipe';

@NgModule({
  declarations: [
    ReportHomeComponent,
    ReportListComponent,
    ReportCatalogItemFilterComponent,
    ReportDateRangeFilterComponent,
    ReportListTreeBuilderPipe,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ReportRoutingModule,
    MatExpansionModule,
    MatButtonModule,
    ToolbarComponent,
    MatIconModule,
    MatTreeModule,
    MatChipsModule,
    CdkDropList,
    CdkDrag,
    MatCheckboxModule,
    ClearableInputComponent,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
  ],
})
export class ReportModule { }

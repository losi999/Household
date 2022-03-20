import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteFilterPipe } from 'src/app/shared/pipes/autocomplete-filter.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { ClearableInputComponent } from './clearable-input/clearable-input.component';
import { AmountInputComponent } from './amount-input/amount-input.component';
import { DatetimeInputComponent } from './datetime-input/datetime-input.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AutocompleteInputComponent } from './autocomplete-input/autocomplete-input.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { CatalogSubmenuComponent } from './catalog-submenu/catalog-submenu.component';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProgressIndicatorComponent } from './progress-indicator/progress-indicator.component';

@NgModule({
  declarations: [
    AutocompleteFilterPipe,
    ClearableInputComponent,
    AmountInputComponent,
    DatetimeInputComponent,
    AutocompleteInputComponent,
    ConfirmationDialogComponent,
    MainMenuComponent,
    ToolbarComponent,
    CatalogSubmenuComponent,
    ProgressIndicatorComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatDialogModule,
    MatMenuModule,
    MatToolbarModule,
    MatListModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    ClearableInputComponent,
    AmountInputComponent,
    DatetimeInputComponent,
    AutocompleteInputComponent,
    ConfirmationDialogComponent,
    MainMenuComponent,
    ToolbarComponent,
    CatalogSubmenuComponent,
    ProgressIndicatorComponent,
  ]
})
export class SharedModule { }

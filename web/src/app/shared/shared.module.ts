import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
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

@NgModule({
  declarations: [
    AutocompleteComponent,
    AutocompleteFilterPipe,
    ClearableInputComponent,
    AmountInputComponent,
    DatetimeInputComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDatepickerModule,
  ],
  exports: [
    AutocompleteComponent,
    ClearableInputComponent,
    AmountInputComponent,
    DatetimeInputComponent,
  ]
})
export class SharedModule { }

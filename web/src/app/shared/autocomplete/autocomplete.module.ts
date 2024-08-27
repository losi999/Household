import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteInputComponent } from '@household/web/app/shared/autocomplete/autocomplete-input/autocomplete-input.component';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';

@NgModule({
  declarations: [
    AutocompleteFilterPipe,
    AutocompleteInputComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    ClearableInputComponent,
  ],
  exports: [AutocompleteInputComponent],
})
export class AutocompleteModule { }

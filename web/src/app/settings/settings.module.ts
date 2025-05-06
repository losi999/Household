import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsHomeComponent } from './settings-home/settings-home.component';
import { SettingsRoutingModule } from '@household/web/app/settings/settings-routing.module';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { AccountAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/account-autocomplete-input/account-autocomplete-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/category-autocomplete-input/category-autocomplete-input.component';

@NgModule({
  declarations: [SettingsHomeComponent],
  imports: [
    ToolbarComponent,
    CommonModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
    AccountAutocompleteInputComponent,
    CategoryAutocompleteInputComponent,
  ],
})
export class SettingsModule { }

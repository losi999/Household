import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsHomeComponent } from './settings-home/settings-home.component';
import { SettingsRoutingModule } from '@household/web/app/settings/settings-routing.module';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { AccountAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/account-autocomplete-input/account-autocomplete-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/category-autocomplete-input/category-autocomplete-input.component';
import { SettingsHairdressingComponent } from './settings-hairdressing/settings-hairdressing.component';
import { SettingsUsersComponent } from './settings-users/settings-users.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IsEditorDirective } from '@household/web/app/shared/is-editor.directive';
import { IsHairdresserDirective } from '@household/web/app/shared/is-hairdresser.directive';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SettingsUsersListComponent } from './settings-users-list/settings-users-list.component';
import { SettingsUsersListItemComponent } from './settings-users-list-item/settings-users-list-item.component';

@NgModule({
  declarations: [
    SettingsHomeComponent,
    SettingsHairdressingComponent,
    SettingsUsersComponent,
    SettingsUsersListComponent,
    SettingsUsersListItemComponent,
  ],
  imports: [
    ToolbarComponent,
    CommonModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
    AccountAutocompleteInputComponent,
    CategoryAutocompleteInputComponent,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    IsEditorDirective,
    IsHairdresserDirective,
  ],
})
export class SettingsModule { }

import { Component, signal } from '@angular/core';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { authEvents } from '@household/shared-ui';
import { UserType } from '@household/shared/enums';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  selector: 'hairdressing-login',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    Toolbar,
    FormField,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  private authEvents = injectDispatch(authEvents);

  loginModel = signal({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, {
      message: 'Kötelező',
    });
    required(schemaPath.password, {
      message: 'Kötelező',
    });
    email(schemaPath.email, {
      message: 'Érvényes email cím szükséges',
    });
    minLength(schemaPath.password, 6, {
      message: 'Legalább 6 karakter szükséges',
    });
  });

  onSubmit(): void {    
    if (this.loginForm().valid()) {
      this.authEvents.logInInitiated({
        email: this.loginForm.email().value(),
        password: this.loginForm.password().value(),
        requiredUserType: UserType.Hairdresser,
      });
    }
  }
}

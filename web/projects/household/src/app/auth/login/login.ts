import { Component, signal } from '@angular/core';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { authEvents } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    Toolbar,
    FormField,
  ],
  selector: 'household-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
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
      });
    }
  }
}

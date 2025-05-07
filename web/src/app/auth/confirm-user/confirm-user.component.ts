import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { authActions } from '@household/web/state/auth/auth.actions';
import { navigationActions } from '@household/web/state/navigation/navigation.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-confirm-user',
  standalone: false,
  templateUrl: './confirm-user.component.html',
  styleUrl: './confirm-user.component.scss',
})
export class ConfirmUserComponent implements OnInit {
  passwordVisible: boolean;
  form: FormGroup<{
    password: FormControl<string>
  }>;
  email: string;
  temporaryPassword: string;

  constructor (private activatedRoute: ActivatedRoute, private store: Store) {}

  ngOnInit(): void {
    this.email = this.activatedRoute.snapshot.queryParamMap.get('email');
    this.temporaryPassword = this.activatedRoute.snapshot.queryParamMap.get('temporaryPassword');

    if (!this.email || !this.temporaryPassword) {
      this.store.dispatch(navigationActions.loggedOutHomepage());
    }

    this.form = new FormGroup({
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  toggleVisibility(event: MouseEvent) {
    this.passwordVisible = !this.passwordVisible;
    event.stopPropagation();
  }

  submit() {
    if (this.form.valid) {
      this.store.dispatch(authActions.confirmUserInitiated({
        email: this.email,
        password: this.form.value.password,
        temporaryPassword: this.temporaryPassword,
      }));
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '@household/web/services/auth.service';

@Component({
  selector: 'household-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  form: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if(this.form.valid) {
      this.authService.login({
        email: this.form.value.email,
        password: this.form.value.password,
      }).subscribe({
        error: () => {
          alert('Hibás felhasználónév vagy jelszó');
        },
      });
    }
  }

}

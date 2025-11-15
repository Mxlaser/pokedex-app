import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { uniqueUsernameValidator } from '../../shared/validators/unique-username.validator';
import { HttpClient } from '@angular/common/http';
import { matchPassword } from '../../shared/validators/match-password';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  auth = inject(AuthService);
  router = inject(Router);

  form = this.fb.group(
    {
      username: [
        '',
        {
          validators: [Validators.required, Validators.minLength(3)],
          asyncValidators: [uniqueUsernameValidator(this.http)]
        }
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: [matchPassword('password', 'confirmPassword')] }
  );

  loading = false;
  error: string | null = null;

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    const { username, password } = this.form.value as any;
    this.auth.register(username, password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (e) => {
        this.error =
          e?.message === 'USERNAME_TAKEN'
            ? 'Nom d’utilisateur déjà pris.'
            : 'Erreur.';
        this.loading = false;
      }
    });
  }
}

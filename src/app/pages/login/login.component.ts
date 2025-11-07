import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  loading = false;
  error: string | null = null;

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = null;
    const { username, password } = this.form.value as any;
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (e) => { this.error = 'Identifiants invalides'; this.loading = false; }
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="login-icon">inventory_2</mat-icon>
            Product Management System
          </mat-card-title>
          <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
            <mat-form-field appearance="outline" class="form-field-full">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="admin@example.com"
                id="login-email"
                autocomplete="email" />
              @if (email.invalid && email.touched) {
                <mat-error>
                  @if (email.errors?.['required']) { Email is required. }
                  @else if (email.errors?.['email']) { Enter a valid email address. }
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field-full">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                id="login-password"
                autocomplete="current-password" />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (password.invalid && password.touched) {
                <mat-error>Password is required.</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              id="login-submit"
              class="login-btn"
              [disabled]="isLoading">
              @if (isLoading) {
                <mat-spinner diameter="20" color="accent" />
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #3f51b5 0%, #303f9f 100%);
      padding: 16px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 16px;
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25) !important;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.25rem !important;
      font-weight: 600 !important;
    }

    .login-icon {
      color: #3f51b5;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    mat-card-content {
      margin-top: 24px;
    }

    .form-field-full {
      width: 100%;
      margin-bottom: 4px;
    }

    .login-btn {
      width: 100%;
      height: 44px;
      margin-top: 8px;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  hidePassword = true;
  isLoading = false;

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  get email() { return this.loginForm.controls.email; }
  get password() { return this.loginForm.controls.password; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.getRawValue();

    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.toast.showSuccess('Login successful. Welcome!');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        // error interceptor handles toast display
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}

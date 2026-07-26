import { Component, inject, OnInit, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsersService } from '../users.service';
import { ToastService } from '../../../shared/services/toast.service';
import { applyServerErrors } from '../../../shared/utils/form-errors.util';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCardModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">{{ isEditMode ? 'Edit User' : 'Add User' }}</h1>
    </div>

    <div class="content-card form-container" style="padding: 24px;">
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" novalidate>

        <!-- Name -->
        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Name</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput formControlName="name" id="user-name" placeholder="John Doe" autocomplete="name" />
          @if (name.invalid && name.touched) {
            <mat-error>
              @if (name.errors?.['required']) { Name is required. }
              @else if (name.errors?.['serverError']) { {{ name.errors?.['serverError'] }} }
            </mat-error>
          }
        </mat-form-field>

        <!-- Email -->
        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Email</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input matInput type="email" formControlName="email" id="user-email" autocomplete="off" />
          @if (email.invalid && email.touched) {
            <mat-error>
              @if (email.errors?.['required']) { Email is required. }
              @else if (email.errors?.['email']) { Enter a valid email address. }
              @else if (email.errors?.['serverError']) { {{ email.errors?.['serverError'] }} }
            </mat-error>
          }
        </mat-form-field>

        <!-- Password -->
        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>{{ isEditMode ? 'New Password (leave blank to keep)' : 'Password' }}</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input matInput type="password" formControlName="password" id="user-password" autocomplete="new-password" />
          @if (password.invalid && password.touched) {
            <mat-error>
              @if (password.errors?.['required']) { Password is required. }
              @else if (password.errors?.['minlength']) {
                Password must be at least {{ password.errors?.['minlength']?.requiredLength }} characters.
              }
              @else if (password.errors?.['serverError']) { {{ password.errors?.['serverError'] }} }
            </mat-error>
          }
        </mat-form-field>

        <div class="form-actions">
          <button mat-stroked-button type="button" (click)="goBack()" id="btn-cancel">
            Cancel
          </button>
          <button mat-flat-button color="primary" type="submit" id="btn-save" [disabled]="isLoading">
            @if (isLoading) { <mat-spinner diameter="18" color="accent" /> }
            @else { {{ isEditMode ? 'Update' : 'Create' }} }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class UserFormComponent implements OnInit {
  @Input() id?: string;

  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  isLoading = false;
  isEditMode = false;

  readonly userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get name() { return this.userForm.controls.name; }
  get email() { return this.userForm.controls.email; }
  get password() { return this.userForm.controls.password; }

  ngOnInit(): void {
    if (this.id) {
      this.isEditMode = true;
      // Password is optional on edit
      this.password.clearValidators();
      this.password.updateValueAndValidity();
      this.loadUser(this.id);
    }
  }

  private loadUser(id: string): void {
    this.isLoading = true;
    this.usersService.getById(id).subscribe({
      next: (res) => {
        this.userForm.patchValue({ name: res.data.name, email: res.data.email });
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { name, email, password } = this.userForm.getRawValue();

    const operation = this.isEditMode
      ? this.usersService.update(this.id!, {
        name: name!,
        email: email!,
        ...(password ? { password } : {}),
      })
      : this.usersService.create({ name: name!, email: email!, password: password! });

    operation.subscribe({
      next: () => {
        this.toast.showSuccess(`User ${this.isEditMode ? 'updated' : 'created'} successfully.`);
        this.goBack();
      },
      error: (err) => {
        this.isLoading = false;
        applyServerErrors(this.userForm, err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}

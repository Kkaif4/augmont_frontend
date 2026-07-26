import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoriesService } from '../categories.service';
import { ToastService } from '../../../shared/services/toast.service';
import { applyServerErrors } from '../../../shared/utils/form-errors.util';
import { ApiError } from '../../../core/interceptors/error.interceptor';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">{{ isEditMode ? 'Edit Category' : 'Add Category' }}</h1>
    </div>

    <div class="content-card form-container" style="padding: 24px;">
      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" novalidate>

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Category Name</mat-label>
          <mat-icon matPrefix>category</mat-icon>
          <input matInput formControlName="name" id="category-name" placeholder="e.g. Electronics" />
          @if (name.invalid && name.touched) {
            <mat-error>
              @if (name.errors?.['required']) { Category name is required. }
              @else if (name.errors?.['serverError']) { {{ name.errors?.['serverError'] }} }
            </mat-error>
          }
        </mat-form-field>

        <div class="form-actions">
          <button mat-stroked-button type="button" (click)="goBack()" id="btn-cancel">Cancel</button>
          <button mat-flat-button color="primary" type="submit" id="btn-save" [disabled]="isLoading">
            @if (isLoading) { <mat-spinner diameter="18" color="accent" /> }
            @else { {{ isEditMode ? 'Update' : 'Create' }} }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CategoryFormComponent implements OnInit {
  @Input() id?: string;

  private readonly fb = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  isLoading = false;
  isEditMode = false;

  readonly categoryForm = this.fb.group({
    name: ['', Validators.required],
  });

  get name() { return this.categoryForm.controls.name; }

  ngOnInit(): void {
    if (this.id) {
      this.isEditMode = true;
      this.loadCategory(this.id);
    }
  }

  private loadCategory(id: string): void {
    this.isLoading = true;
    this.categoriesService.getById(id).subscribe({
      next: (res) => {
        this.categoryForm.patchValue({ name: res.data.name });
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const payload = { name: this.name.value! };

    const operation = this.isEditMode
      ? this.categoriesService.update(this.id!, payload)
      : this.categoriesService.create(payload);

    operation.subscribe({
      next: () => {
        this.toast.showSuccess(`Category ${this.isEditMode ? 'updated' : 'created'} successfully.`);
        this.goBack();
      },
      error: (err: ApiError) => {
        this.isLoading = false;
        applyServerErrors(this.categoryForm, err);
        if (err.status === 409 && !err.fieldErrors.length) {
          this.name.setErrors({ serverError: 'A category with this name already exists.' });
          this.name.markAsTouched();
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/categories']);
  }
}

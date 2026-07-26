import { Component, inject, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductsService } from '../products.service';
import { CategoriesService } from '../../categories/categories.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Category } from '../../../core/models/category.model';
import { environment } from '../../../../environments/environment';
import { applyServerErrors } from '../../../shared/utils/form-errors.util';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">{{ isEditMode ? 'Edit Product' : 'Add Product' }}</h1>
    </div>

    <div class="content-card form-container" style="padding: 24px;">
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" novalidate>

        <!-- Name -->
        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Product Name</mat-label>
          <mat-icon matPrefix>inventory</mat-icon>
          <input matInput formControlName="name" id="product-name" />
          @if (name.invalid && name.touched) {
            <mat-error>
              @if (name.errors?.['required']) { Product name is required. }
              @else if (name.errors?.['serverError']) { {{ name.errors?.['serverError'] }} }
            </mat-error>
          }
        </mat-form-field>

        <!-- Price -->
        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Price (₹)</mat-label>
          <mat-icon matPrefix>currency_rupee</mat-icon>
          <input matInput type="number" formControlName="price" id="product-price" min="0.01" step="0.01" />
          @if (price.invalid && price.touched) {
            <mat-error>
              @if (price.errors?.['required']) { Price is required. }
              @else if (price.errors?.['min']) { Price must be greater than zero. }
              @else if (price.errors?.['serverError']) { {{ price.errors?.['serverError'] }} }
            </mat-error>
          }
        </mat-form-field>

        <!-- Category -->
        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Category</mat-label>
          <mat-icon matPrefix>category</mat-icon>
          <mat-select formControlName="categoryId" id="product-category">
            @for (cat of categories; track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
          @if (categoryId.invalid && categoryId.touched) {
            <mat-error>
              @if (categoryId.errors?.['required']) { Category is required. }
              @else if (categoryId.errors?.['serverError']) { {{ categoryId.errors?.['serverError'] }} }
            </mat-error>
          }
        </mat-form-field>

        <!-- Image Upload -->
        <div class="image-upload-section">
          <label class="image-label">Product Image (optional)</label>
          <div class="image-preview-row">
            @if (imagePreview) {
              <img [src]="imagePreview" alt="Preview" class="product-thumb" style="width:80px;height:80px;" />
            }
            <button mat-stroked-button type="button" (click)="fileInput.click()" id="btn-pick-image">
              <mat-icon>add_photo_alternate</mat-icon>
              {{ imagePreview ? 'Change Image' : 'Select Image' }}
            </button>
            <input #fileInput type="file" accept="image/*" (change)="onFileSelect($event)" style="display:none" />
            @if (fileError) {
              <span style="color: #c62828; font-size: 0.8rem;">{{ fileError }}</span>
            }
          </div>
        </div>

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
  styles: [`
    .image-upload-section { margin-bottom: 16px; }
    .image-label { display: block; font-size: 0.85rem; color: #757575; margin-bottom: 8px; }
    .image-preview-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  `],
})
export class ProductFormComponent implements OnInit {
  @Input() id?: string;

  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = false;
  isEditMode = false;
  categories: Category[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  fileError: string | null = null;

  readonly productForm = this.fb.group({
    name: ['', Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    categoryId: [null as string | null, Validators.required],
  });

  get name() { return this.productForm.controls.name; }
  get price() { return this.productForm.controls.price; }
  get categoryId() { return this.productForm.controls.categoryId; }

  ngOnInit(): void {
    this.loadCategories();
    if (this.id) {
      this.isEditMode = true;
      this.loadProduct(this.id);
    }
  }

  private loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (res) => {
        this.categories = res.data ?? [];
        this.cdr.markForCheck();
      },
    });
  }

  resolveImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    return `${environment.uploadsUrl}/${cleanPath}`;
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this.productsService.getById(id).subscribe({
      next: (res) => {
        const p = res.data;
        const selectedCatId = p.categoryId || p.category?.id || null;
        this.productForm.patchValue({
          name: p.name,
          price: p.price,
          categoryId: selectedCatId,
        });
        if (p.imageUrl) {
          this.imagePreview = this.resolveImageUrl(p.imageUrl);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (file.size > 5 * 1024 * 1024) {
      this.fileError = 'Image must be smaller than 5 MB.';
      return;
    }

    this.fileError = null;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(this.selectedFile);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { name, price, categoryId } = this.productForm.getRawValue();

    const formData = new FormData();
    formData.append('name', name!);
    formData.append('price', price!.toString());
    formData.append('categoryId', categoryId!);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const operation = this.isEditMode
      ? this.productsService.update(this.id!, formData)
      : this.productsService.create(formData);

    operation.subscribe({
      next: () => {
        this.toast.showSuccess(`Product ${this.isEditMode ? 'updated' : 'created'} successfully.`);
        this.goBack();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.markForCheck();
        applyServerErrors(this.productForm, err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}

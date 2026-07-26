import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProductsService } from '../products.service';
import { CategoriesService } from '../../categories/categories.service';
import { Product, SortOrder } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { Pagination } from '../../../core/models/api-response.model';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { BulkUploadDialogComponent } from '../../../shared/components/bulk-upload-dialog/bulk-upload-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    RouterLink, CurrencyPipe,
    FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatProgressBarModule, MatPaginatorModule,
    MatSelectModule, MatFormFieldModule, MatDialogModule,
    SearchBarComponent,
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">Products</h1>
      <div class="page-actions">
        <app-search-bar placeholder="Search products…" (searchChange)="onSearch($event)" />

        <mat-form-field appearance="outline" style="min-width: 160px;">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="selectedCategoryId" (ngModelChange)="onCategoryChange()">
            <mat-option value="">All</mat-option>
            @for (cat of categories; track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="min-width: 160px;">
          <mat-label>Sort by Price</mat-label>
          <mat-select [(ngModel)]="sortOrder" (ngModelChange)="onSortChange()">
            <mat-option value="">Default</mat-option>
            <mat-option value="asc">Price: Low to High</mat-option>
            <mat-option value="desc">Price: High to Low</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-stroked-button color="primary" (click)="openBulkUpload()" id="btn-bulk-upload">
          <mat-icon>upload_file</mat-icon> Bulk Upload
        </button>

        <button mat-flat-button color="primary" routerLink="/products/new" id="btn-add-product">
          <mat-icon>add</mat-icon> Add Product
        </button>
      </div>
    </div>

    <div class="content-card">
      @if (isLoading) {
        <mat-progress-bar mode="indeterminate" />
      }

      <div class="table-container">
        <table mat-table [dataSource]="products">

          <ng-container matColumnDef="image">
            <th mat-header-cell *matHeaderCellDef>Image</th>
            <td mat-cell *matCellDef="let p">
              @if (p.imageUrl) {
                <img [src]="resolveImageUrl(p.imageUrl)" alt="{{ p.name }}" class="product-thumb" />
              } @else {
                <input #rowFileInput type="file" accept="image/jpeg,image/png,image/webp" style="display:none" (change)="onRowImageSelected($event, p)" />
                <button mat-stroked-button color="primary" type="button" class="upload-img-btn" (click)="rowFileInput.click()" matTooltip="Upload Image">
                  <mat-icon class="btn-icon">add_a_photo</mat-icon>
                  Upload
                </button>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let p">{{ p.name }}</td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Price</th>
            <td mat-cell *matCellDef="let p">{{ p.price | currency:'INR':'symbol':'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let p">{{ p.category?.name ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button color="primary" [routerLink]="['/products', p.id]"
                matTooltip="Edit" [attr.aria-label]="'Edit ' + p.name">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteProduct(p)"
                matTooltip="Delete" [attr.aria-label]="'Delete ' + p.name">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="displayedColumns.length">
              <div class="empty-state">
                <mat-icon>inventory_2</mat-icon>
                <p>No products found.</p>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <mat-paginator
        [length]="pagination.total"
        [pageSize]="pagination.limit"
        [pageSizeOptions]="[10, 25, 50]"
        (page)="onPageChange($event)"
        aria-label="Select page">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .upload-img-btn {
      font-size: 0.75rem;
      padding: 0 8px;
      height: 32px;
      line-height: 32px;
    }
    .btn-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      margin-right: 4px;
    }
  `]
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  categories: Category[] = [];
  isLoading = false;

  searchQuery = '';
  selectedCategoryId = '';
  sortOrder: '' | SortOrder = '';

  pagination: Pagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

  readonly displayedColumns = ['image', 'name', 'price', 'category', 'actions'];

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  resolveImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    return `${environment.uploadsUrl}/${cleanPath}`;
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.pagination.page = 1;
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.pagination.page = 1;
    this.loadProducts();
  }

  onSortChange(): void {
    this.pagination.page = 1;
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.pagination.page = event.pageIndex + 1;
    this.pagination.limit = event.pageSize;
    this.loadProducts();
  }

  openBulkUpload(): void {
    this.dialog.open(BulkUploadDialogComponent, { width: '550px' })
      .afterClosed()
      .subscribe((uploaded) => {
        if (uploaded) {
          this.loadProducts();
        }
      });
  }

  onRowImageSelected(event: Event, product: Product): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    this.isLoading = true;
    this.productsService.uploadImage(product.id, file).subscribe({
      next: (res) => {
        this.toast.showSuccess(`Image uploaded for "${product.name}".`);
        product.imageUrl = res.data.imageUrl;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (res) => {
        this.categories = res.data ?? [];
        this.cdr.markForCheck();
      },
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productsService.getAll({
      page: this.pagination.page,
      limit: this.pagination.limit,
      search: this.searchQuery || undefined,
      category: this.selectedCategoryId || undefined,
      sort: this.sortOrder ? 'price' : undefined,
      order: this.sortOrder || undefined,
    }).subscribe({
      next: (res) => {
        this.products = res.data ?? [];
        const rawMeta = res.meta || res.pagination;
        if (rawMeta) {
          const page = rawMeta.page ?? rawMeta.currentPage ?? 1;
          const limit = rawMeta.limit ?? rawMeta.pageSize ?? 10;
          const total = rawMeta.total ?? rawMeta.totalRecords ?? 0;
          const totalPages = (rawMeta.totalPages ?? Math.ceil(total / limit)) || 1;
          this.pagination = { page, limit, total, totalPages };
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

  deleteProduct(p: Product): void {
    const data: ConfirmDialogData = {
      title: 'Delete Product',
      message: `Are you sure you want to delete "${p.name}"?`,
      confirmLabel: 'Delete',
    };

    this.dialog.open(ConfirmDialogComponent, { data, width: '400px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.productsService.delete(p.id).subscribe({
          next: () => {
            this.toast.showSuccess('Product deleted successfully.');
            this.loadProducts();
          },
        });
      });
  }
}

import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CategoriesService } from '../categories.service';
import { Category } from '../../../core/models/category.model';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatTableModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatProgressBarModule,
    SearchBarComponent,
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">Categories</h1>
      <div class="page-actions">
        <app-search-bar placeholder="Search categories…" (searchChange)="onSearch($event)" />
        <button mat-flat-button color="primary" routerLink="/categories/new" id="btn-add-category">
          <mat-icon>add</mat-icon> Add Category
        </button>
      </div>
    </div>

    <div class="content-card">
      @if (isLoading) {
        <mat-progress-bar mode="indeterminate" />
      }

      <div class="table-container">
        <table mat-table [dataSource]="categories">

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let cat">{{ cat.name }}</td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let cat">{{ cat.createdAt | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let cat">
              <button mat-icon-button color="primary" [routerLink]="['/categories', cat.id]"
                matTooltip="Edit" [attr.aria-label]="'Edit ' + cat.name">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteCategory(cat)"
                matTooltip="Delete" [attr.aria-label]="'Delete ' + cat.name">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="displayedColumns.length">
              <div class="empty-state">
                <mat-icon>category</mat-icon>
                <p>No categories found.</p>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `,
})
export class CategoryListComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  isLoading = false;
  readonly displayedColumns = ['name', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.loadCategories();
  }

  onSearch(query: string): void {
    this.loadCategories(query);
  }

  loadCategories(search?: string): void {
    this.isLoading = true;
    this.categoriesService.getAll(search).subscribe({
      next: (res) => {
        this.categories = res.data ?? [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  deleteCategory(cat: Category): void {
    const data: ConfirmDialogData = {
      title: 'Delete Category',
      message: `Are you sure you want to delete "${cat.name}"?`,
      confirmLabel: 'Delete',
    };

    this.dialog.open(ConfirmDialogComponent, { data, width: '400px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.categoriesService.delete(cat.id).subscribe({
          next: () => {
            this.toast.showSuccess('Category deleted successfully.');
            this.loadCategories();
          },
        });
      });
  }
}

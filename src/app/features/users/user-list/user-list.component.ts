import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UsersService } from '../users.service';
import { User } from '../../../core/models/user.model';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatTableModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatProgressBarModule,
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">Users</h1>
      <div class="page-actions">
        <button mat-flat-button color="primary" routerLink="/users/new" id="btn-add-user">
          <mat-icon>add</mat-icon> Add User
        </button>
      </div>
    </div>

    <div class="content-card">
      @if (isLoading) {
        <mat-progress-bar mode="indeterminate" />
      }

      <div class="table-container">
        <table mat-table [dataSource]="users">

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let user">{{ user.name }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let user">{{ user.createdAt | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let user">
              <button mat-icon-button color="primary" [routerLink]="['/users', user.id]"
                matTooltip="Edit" [attr.aria-label]="'Edit user ' + user.email">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteUser(user)"
                matTooltip="Delete" [attr.aria-label]="'Delete user ' + user.email">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="displayedColumns.length">
              <div class="empty-state">
                <mat-icon>people_outline</mat-icon>
                <p>No users found.</p>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `,
})
export class UserListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  users: User[] = [];
  isLoading = false;
  readonly displayedColumns = ['name', 'email', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.usersService.getAll().subscribe({
      next: (res) => {
        this.users = res.data ?? [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  deleteUser(user: User): void {
    const data: ConfirmDialogData = {
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.name}" (${user.email})? This action cannot be undone.`,
      confirmLabel: 'Delete',
    };

    this.dialog.open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.usersService.delete(user.id).subscribe({
          next: () => {
            this.toast.showSuccess(`User "${user.name}" deleted successfully.`);
            this.loadUsers();
          },
        });
      });
  }
}

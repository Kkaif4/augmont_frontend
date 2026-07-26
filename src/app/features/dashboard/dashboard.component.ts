import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface QuickLink {
  label: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
    </div>

    <div class="dashboard-grid">
      @for (link of quickLinks; track link.route) {
        <mat-card class="quick-card" [routerLink]="link.route">
          <mat-card-content>
            <div class="card-icon" [style.background]="link.color">
              <mat-icon>{{ link.icon }}</mat-icon>
            </div>
            <div class="card-info">
              <div class="card-label">{{ link.label }}</div>
              <div class="card-desc">{{ link.description }}</div>
            </div>
            <mat-icon class="card-arrow">chevron_right</mat-icon>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .quick-card {
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.15s;
      border-radius: 10px !important;
    }

    .quick-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
      transform: translateY(-2px);
    }

    mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
    }

    .card-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-icon mat-icon {
      color: white;
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .card-info {
      flex: 1;
    }

    .card-label {
      font-size: 1rem;
      font-weight: 500;
      color: #212121;
      margin-bottom: 4px;
    }

    .card-desc {
      font-size: 0.8rem;
      color: #757575;
    }

    .card-arrow {
      color: #bdbdbd;
    }
  `],
})
export class DashboardComponent {
  readonly quickLinks: QuickLink[] = [
    { label: 'Users', description: 'Manage system users', icon: 'people', route: '/users', color: '#3f51b5' },
    { label: 'Categories', description: 'Organize product categories', icon: 'category', route: '/categories', color: '#009688' },
    { label: 'Products', description: 'View, create & bulk upload products', icon: 'inventory', route: '/products', color: '#ff5722' },
    { label: 'Reports', description: 'Download CSV / XLSX reports', icon: 'assessment', route: '/reports', color: '#8bc34a' },
  ];
}

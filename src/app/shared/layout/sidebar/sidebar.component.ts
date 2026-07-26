import { Component } from '@angular/core';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLinkActive, RouterLink, MatIconModule],
  template: `
    <nav class="app-sidebar">
      <div class="sidebar-logo">
        <mat-icon style="vertical-align: middle; margin-right: 8px;">inventory_2</mat-icon>
        PMS
      </div>
      <div class="sidebar-nav">
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="active">
            <mat-icon>{{ item.icon }}</mat-icon>
            {{ item.label }}
          </a>
        }
      </div>
    </nav>
  `,
  styles: [`
    :host { display: contents; }
  `],
})
export class SidebarComponent {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard',   icon: 'dashboard',      route: '/dashboard' },
    { label: 'Users',       icon: 'people',         route: '/users' },
    { label: 'Categories',  icon: 'category',       route: '/categories' },
    { label: 'Products',    icon: 'inventory',      route: '/products' },
    { label: 'Reports',     icon: 'assessment',     route: '/reports' },
  ];
}

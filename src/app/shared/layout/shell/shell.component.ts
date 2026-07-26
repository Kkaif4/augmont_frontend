import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, LoadingSpinnerComponent],
  template: `
    <div class="app-shell">
      <app-sidebar class="app-sidebar" />
      <div class="app-main">
        <app-header class="app-header" />
        <main class="app-content">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-loading-spinner />
  `,
})
export class ShellComponent {}

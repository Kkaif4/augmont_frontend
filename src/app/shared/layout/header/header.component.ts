import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <header class="app-header">
      <span class="header-title">Product Management System</span>
      <span class="spacer"></span>
      <button
        mat-icon-button
        color="inherit"
        matTooltip="Logout"
        (click)="logout()"
        aria-label="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </header>
  `,
  styles: [`
    :host { display: contents; }
    .app-header {
      display: flex;
      align-items: center;
      padding: 0 16px;
      height: 64px;
      background: #3f51b5;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 100;
    }
    .header-title {
      font-size: 1.1rem;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
    .spacer { flex: 1; }
    button { color: white !important; }
  `],
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}

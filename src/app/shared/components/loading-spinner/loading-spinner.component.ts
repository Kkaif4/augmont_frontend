import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [AsyncPipe, MatProgressSpinnerModule],
  template: `
    @if (loadingService.isLoading$ | async) {
      <div class="spinner-overlay">
        <mat-spinner diameter="48" />
      </div>
    }
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      pointer-events: none;
    }
  `],
})
export class LoadingSpinnerComponent {
  readonly loadingService = inject(LoadingService);
}

import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ReportsService } from './reports.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, MatDividerModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Reports</h1>
    </div>

    <div class="reports-grid">

      <mat-card class="report-card">
        <mat-card-content>
          <div class="report-icon csv-icon">
            <mat-icon>description</mat-icon>
          </div>
          <div class="report-info">
            <div class="report-title">Products CSV</div>
            <div class="report-desc">Download all products as a comma-separated file</div>
          </div>
          <button
            mat-flat-button color="primary"
            [disabled]="loadingCsv"
            (click)="downloadCsv()"
            id="btn-download-csv">
            @if (loadingCsv) {
              <mat-spinner diameter="18" color="accent" />
            } @else {
              <ng-container>
                <mat-icon>download</mat-icon> Download CSV
              </ng-container>
            }
          </button>
        </mat-card-content>
      </mat-card>

      <mat-card class="report-card">
        <mat-card-content>
          <div class="report-icon xlsx-icon">
            <mat-icon>table_chart</mat-icon>
          </div>
          <div class="report-info">
            <div class="report-title">Products XLSX</div>
            <div class="report-desc">Download all products as an Excel spreadsheet</div>
          </div>
          <button
            mat-flat-button color="accent"
            [disabled]="loadingXlsx"
            (click)="downloadXlsx()"
            id="btn-download-xlsx">
            @if (loadingXlsx) {
              <mat-spinner diameter="18" />
            } @else {
              <ng-container>
                <mat-icon>download</mat-icon> Download XLSX
              </ng-container>
            }
          </button>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
    }

    .report-card {
      border-radius: 10px !important;
    }

    mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px !important;
      flex-wrap: wrap;
    }

    .report-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .csv-icon {
      background: #e3f2fd;
    }
    .csv-icon mat-icon { color: #1565c0; font-size: 26px; width: 26px; height: 26px; }

    .xlsx-icon {
      background: #e8f5e9;
    }
    .xlsx-icon mat-icon { color: #2e7d32; font-size: 26px; width: 26px; height: 26px; }

    .report-info {
      flex: 1;
    }
    .report-title {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 4px;
    }
    .report-desc {
      font-size: 0.8rem;
      color: #757575;
    }
  `],
})
export class ReportsComponent {
  private readonly reportsService = inject(ReportsService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  loadingCsv = false;
  loadingXlsx = false;

  downloadCsv(): void {
    this.loadingCsv = true;
    this.reportsService.downloadCsv().subscribe({
      next: (blob) => {
        this.reportsService.triggerDownload(blob, `products-${Date.now()}.csv`);
        this.toast.showSuccess('CSV downloaded successfully.');
        this.loadingCsv = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingCsv = false;
        this.cdr.markForCheck();
      },
    });
  }

  downloadXlsx(): void {
    this.loadingXlsx = true;
    this.reportsService.downloadXlsx().subscribe({
      next: (blob) => {
        this.reportsService.triggerDownload(blob, `products-${Date.now()}.xlsx`);
        this.toast.showSuccess('XLSX downloaded successfully.');
        this.loadingXlsx = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingXlsx = false;
        this.cdr.markForCheck();
      },
    });
  }
}

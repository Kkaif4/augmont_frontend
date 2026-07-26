import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BulkUploadService, BulkUploadResult } from '../../../features/bulk-upload/bulk-upload.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-bulk-upload-dialog',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatDividerModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title style="display: flex; align-items: center; justify-content: space-between;">
      <span>Bulk Upload Products</span>
      <button mat-icon-button mat-dialog-close type="button"><mat-icon>close</mat-icon></button>
    </h2>

    <mat-dialog-content>
      <!-- Instructions -->
      <div class="upload-info">
        <mat-icon class="upload-info-icon">info_outline</mat-icon>
        <div>
          <p style="margin: 0 0 8px; font-weight: 500;">CSV Format</p>
          <p style="margin: 0; color: #757575; font-size: 0.875rem;">
            File must be a <strong>.csv</strong> with columns:<br/>
            <code>name, price, categoryName</code>
          </p>
        </div>
      </div>

      <mat-divider style="margin: 16px 0;" />

      <!-- Drop / Select Area -->
      <div
        class="drop-zone"
        [class.has-file]="selectedFile"
        (click)="fileInput.click()"
        (dragover)="$event.preventDefault()"
        (drop)="onDrop($event)"
        role="button"
        tabindex="0"
        (keydown.enter)="fileInput.click()"
        aria-label="Select CSV file">
        <input #fileInput type="file" accept=".csv" (change)="onFileSelect($event)" style="display:none" id="bulk-file-input" />
        @if (selectedFile) {
          <mat-icon class="drop-icon" color="primary">check_circle</mat-icon>
          <p class="drop-text">{{ selectedFile.name }}</p>
          <p class="drop-sub">Click to change file</p>
        } @else {
          <mat-icon class="drop-icon">upload_file</mat-icon>
          <p class="drop-text">Click or drag a CSV file here</p>
          <p class="drop-sub">Only .csv files are accepted</p>
        }
      </div>

      @if (isLoading) {
        <mat-progress-bar mode="indeterminate" style="margin-top: 16px;" />
        <p style="text-align: center; color: #757575; margin-top: 8px;">Uploading…</p>
      }

      <!-- Results -->
      @if (result) {
        <mat-divider style="margin: 16px 0;" />
        <div class="result-section">
          <div class="result-row success-row">
            <mat-icon color="accent">check_circle</mat-icon>
            <span><strong>{{ result.inserted }}</strong> products inserted successfully</span>
          </div>
          @if (result.errors.length) {
            <div class="result-row error-row">
              <mat-icon color="warn">error_outline</mat-icon>
              <span><strong>{{ result.errors.length }}</strong> rows had errors:</span>
            </div>
            <ul class="error-list">
              @for (err of result.errors; track $index) {
                <li>{{ err }}</li>
              }
            </ul>
          }
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close type="button">Cancel</button>
      <button
        mat-flat-button color="primary"
        [disabled]="!selectedFile || isLoading"
        (click)="onUpload()"
        id="btn-upload-csv">
        <mat-icon>cloud_upload</mat-icon>
        Upload
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .upload-info { display: flex; align-items: flex-start; gap: 12px; }
    .upload-info-icon { color: #3f51b5; flex-shrink: 0; }
    .drop-zone {
      border: 2px dashed #bdbdbd;
      border-radius: 10px;
      padding: 30px 16px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .drop-zone:hover, .drop-zone.has-file {
      border-color: #3f51b5;
      background: rgba(63,81,181,0.04);
    }
    .drop-icon { font-size: 40px; width: 40px; height: 40px; color: #9e9e9e; margin-bottom: 8px; }
    .drop-text { margin: 0; font-weight: 500; }
    .drop-sub { margin: 4px 0 0; color: #9e9e9e; font-size: 0.8rem; }
    .result-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .error-list { margin: 0 0 0 24px; padding: 0; font-size: 0.875rem; color: #c62828; }
    .error-list li { margin-bottom: 4px; }
  `],
})
export class BulkUploadDialogComponent {
  private readonly bulkUploadService: BulkUploadService = inject(BulkUploadService);
  private readonly toast: ToastService = inject(ToastService);
  private readonly dialogRef: MatDialogRef<BulkUploadDialogComponent> = inject(MatDialogRef<BulkUploadDialogComponent>);

  selectedFile: File | null = null;
  isLoading = false;
  result: BulkUploadResult | null = null;

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.setFile(input.files[0]);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file?.name.endsWith('.csv')) {
      this.setFile(file);
    } else {
      this.toast.showError('Only .csv files are accepted.');
    }
  }

  private setFile(file: File): void {
    if (!file.name.endsWith('.csv')) {
      this.toast.showError('Only .csv files are accepted.');
      return;
    }
    this.selectedFile = file;
    this.result = null;
  }

  onUpload(): void {
    if (!this.selectedFile) return;
    this.isLoading = true;
    this.result = null;

    this.bulkUploadService.uploadCsv(this.selectedFile).subscribe({
      next: (res) => {
        this.result = res.data;
        this.isLoading = false;
        this.toast.showSuccess(`Upload complete: ${res.data.inserted} products inserted.`);
        if (res.data.inserted > 0 && !res.data.errors.length) {
          this.dialogRef.close(true);
        }
      },
      error: () => { this.isLoading = false; },
    });
  }
}

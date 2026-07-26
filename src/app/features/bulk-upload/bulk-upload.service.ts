import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BulkUploadResult {
  inserted: number;
  errors: string[];
}

@Injectable({ providedIn: 'root' })
export class BulkUploadService {
  private readonly http = inject(HttpClient);

  uploadCsv(file: File): Observable<{ success: boolean; message: string; data: BulkUploadResult }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; message: string; data: BulkUploadResult }>(
      `${environment.apiUrl}/uploads/products/csv`,
      formData
    );
  }
}

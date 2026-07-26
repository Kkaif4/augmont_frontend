import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);

  downloadCsv(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/reports/products/csv`, { responseType: 'blob' });
  }

  downloadXlsx(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/reports/products/xlsx`, { responseType: 'blob' });
  }

  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

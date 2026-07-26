import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: FieldError[] = []
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      const { message, fieldErrors } = extractError(httpError);

      if (httpError.status === 401) {
        localStorage.removeItem('token');
        router.navigate(['/login']);
        toast.showError('Session expired. Please log in again.');
      } else if (httpError.status === 422) {
        const detail = fieldErrors.length
          ? fieldErrors.map((e) => `${e.message}`).join(' · ')
          : message;
        toast.showError(detail);
      } else if (httpError.status === 409) {
        toast.showError(message);
      } else if (httpError.status === 403) {
        toast.showError('You do not have permission to perform this action.');
      } else if (httpError.status === 404) {
        toast.showError('The requested resource was not found.');
      } else if (httpError.status >= 500) {
        toast.showError('A server error occurred. Please try again later.');
      } else if (httpError.status === 0) {
        toast.showError('Unable to reach the server. Check your connection.');
      } else {
        toast.showError(message);
      }

      return throwError(() => new ApiError(message, httpError.status, fieldErrors));
    })
  );
};

function extractError(error: HttpErrorResponse): { message: string; fieldErrors: FieldError[] } {
  const body = error?.error;
  const message: string =
    body?.message ?? error?.message ?? 'An unexpected error occurred.';
  const fieldErrors: FieldError[] = Array.isArray(body?.errors) ? body.errors : [];
  return { message, fieldErrors };
}

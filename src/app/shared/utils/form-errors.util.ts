import { FormGroup } from '@angular/forms';
import { ApiError, FieldError } from '../../core/interceptors/error.interceptor';

export function applyServerErrors(form: FormGroup, error: unknown): void {
  if (!(error instanceof ApiError)) return;

  error.fieldErrors.forEach((fe: FieldError) => {
    const control = form.get(fe.field);
    if (control) {
      control.setErrors({ serverError: fe.message });
      control.markAsTouched();
    }
  });
}

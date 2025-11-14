import { AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { map, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export function uniqueUsernameValidator(http: HttpClient): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const val = (control.value ?? '').trim();
    if (!val) return of(null);
    return http.get<any[]>('http://localhost:3000/users', { params: { username: val } }).pipe(
      map(list => (list.length ? { usernameTaken: true } : null)),
      catchError(() => of(null))
    );
  };
}

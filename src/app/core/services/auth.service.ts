import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, switchMap, throwError } from 'rxjs';
import { User } from '../../core/models/user';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private _currentUser$ = new BehaviorSubject<User | null>(this.restore());
  currentUser$ = this._currentUser$.asObservable();

  get currentUser(): User | null { return this._currentUser$.value; }
  get isLoggedIn$() { return this.currentUser$.pipe(map(u => !!u)); }

  private restore(): User | null {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }
    catch { return null; }
  }
  private persist(user: User | null) {
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    else localStorage.removeItem('currentUser');
  }

  register(username: string, password: string) {
    return this.http.get<User[]>(`${API}/users`, { params: { username } }).pipe(
      map(users => {
        if (users.length > 0) throw new Error('USERNAME_TAKEN');
        return { username, password } as Partial<User>;
      }),
      switchMap(body => this.http.post<User>(`${API}/users`, body)),
      map(user => {
        this._currentUser$.next(user);
        this.persist(user);
        return user;
      })
    );
  }

  login(username: string, password: string) {
    return this.http.get<User[]>(`${API}/users`, { params: { username, password } }).pipe(
      map(users => {
        if (users.length !== 1) throw new Error('INVALID_CREDENTIALS');
        const user = users[0];
        this._currentUser$.next(user);
        this.persist(user);
        return user;
      })
    );
  }

  logout() {
    this._currentUser$.next(null);
    this.persist(null);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export type LoginResponse = {
  status: 'success' | 'error';
  message: string;
  userId: number;
  email: string;
  username?: string;
  role?: 'ADMIN' | 'MEMBRE' | 'OBSERVATEUR';
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  // ✅ on est "auth" si userId existe (pas de token dans ce projet)
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasSession());
  private isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res?.status === 'success' && res.userId != null) {
            this.setLoggedIn(res.email ?? email, res.userId, res.username, res.role);
          } else {
            this.logout();
          }
        })
      );
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
    userRole: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    this.isAuthenticatedSubject.next(false);
  }

  setLoggedIn(email: string, userId: number, username?: string, role?: string): void {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userId', String(userId));
    if (username) localStorage.setItem('username', username);
    if (role) localStorage.setItem('role', role);
    this.isAuthenticatedSubject.next(true);
  }

  isLoggedIn(): boolean {
    return this.hasSession();
  }

  getAuthStatus(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  getLoggedInUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  getUserId(): number | null {
    const value = localStorage.getItem('userId');
    return value ? Number(value) : null;
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  private hasSession(): boolean {
    return !!localStorage.getItem('userId');
  }
}

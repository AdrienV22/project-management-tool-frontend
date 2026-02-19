import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export type LoginResponse = {
  status?: 'success' | 'error';
  message?: string;
  userId?: number;
  email?: string;
  username?: string;
  role?: string;
  token?: string; // optionnel
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasUserId());
  private isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          // ✅ Projet sans Spring Security : on se base sur status + userId
          if (res?.status === 'success' && res?.userId) {
            this.setLoggedIn(res.email ?? email, res.userId, res.role ?? null);
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
    localStorage.removeItem('userRole');
    this.isAuthenticatedSubject.next(false);
  }

  // ✅ Stockage "session" light
  setLoggedIn(email: string, userId: number, role: string | null): void {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userId', String(userId));
    if (role) localStorage.setItem('userRole', role);
    else localStorage.removeItem('userRole');

    this.isAuthenticatedSubject.next(true);
  }

  isLoggedIn(): boolean {
    return this.hasUserId();
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

  // ✅ Pour le header (async pipe)
  getUserEmail(): Observable<string | null> {
    return this.getAuthStatus().pipe(
      map((isLoggedIn) => (isLoggedIn ? localStorage.getItem('userEmail') : null))
    );
  }

  getUserRole(): Observable<string | null> {
    return this.getAuthStatus().pipe(
      map((isLoggedIn) => (isLoggedIn ? localStorage.getItem('userRole') : null))
    );
  }

  private hasUserId(): boolean {
    return !!localStorage.getItem('userId');
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

type LoginResponse = {
  token: string;
  userId: number;
  email: string;
  username?: string;
  role?: string; // selon ton backend
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        if (res?.token) {
          this.setLoggedIn(res.email ?? email, res.userId, res.token);
        }
      })
    );
  }

  register(userData: { username: string; email: string; password: string; userRole: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    this.isAuthenticatedSubject.next(false);
  }

  // ✅ Recrée la méthode attendue par LoginComponent
  setLoggedIn(email: string, userId: number, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userId', String(userId));
    this.isAuthenticatedSubject.next(true);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getLoggedInUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  getUserId(): number | null {
    const v = localStorage.getItem('userId');
    return v ? Number(v) : null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}

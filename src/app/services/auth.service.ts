import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

type LoginResponse = {
  message?: string;
  status?: string;
  token: string;
  userId: number;
  username?: string;
  email: string;
  role: string; // ADMIN / MEMBER / OBSERVER (selon ton enum backend)
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private projectsApiUrl = 'http://localhost:8080/api/projects';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  // ===== AUTH =====

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        // Backend renvoie token + infos user
        this.setSession(response);
      })
    );
  }

  register(userData: { username: string; email: string; password: string; userRole: number }): Observable<any> {
    // Si ton backend renvoie aussi un token au register (optionnel), tu pourras faire pareil qu'au login :
    // .pipe(tap((res: any) => res?.token ? this.setSession(res) : null))
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    this.clearSession();
  }

  // ===== SESSION STORAGE =====

  private setSession(data: LoginResponse): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', String(data.userId));
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);

    this.isAuthenticatedSubject.next(true);
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');

    this.isAuthenticatedSubject.next(false);
  }

  private hasToken(): boolean {
    const token = localStorage.getItem('token');
    return !!token && token.trim().length > 0;
  }

  // ===== GETTERS =====

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number | null {
    const raw = localStorage.getItem('userId');
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  getLoggedInUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  // ===== OBSERVABLE =====

  getAuthStatus(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // ===== API EXAMPLE =====

  getUserProjects(email: string): Observable<any[]> {
    // IMPORTANT : cette route devra être appelée avec Authorization Bearer token via Interceptor.
    return this.http.get<any[]>(`${this.projectsApiUrl}?email=${encodeURIComponent(email)}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root', // Service disponible dans toute l'application
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api'; // URL de ton API backend
  private isAuthenticated: boolean = false; // État de connexion

  constructor(private http: HttpClient) {}

  // Méthode pour se connecter
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('authToken', response.token); // Stocker le token
          this.isAuthenticated = true;
        }
      })
    );
  }

  // Méthode pour se déconnecter
  logout(): void {
    localStorage.removeItem('authToken'); // Supprimer le token
    this.isAuthenticated = false;
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.isAuthenticated || !!localStorage.getItem('authToken');
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root', // Service disponible dans toute l'application
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; // URL de ton API backend
  private isAuthenticated: boolean = false; // État de connexion

  constructor(private http: HttpClient) {}

  // Méthode pour se connecter
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('authToken', response.token); // Stocker le token
          this.isAuthenticated = true;  // Marquer l'utilisateur comme authentifié
        }
      })
    );
  }

  // Méthode pour s'inscrire
  register(userData: { username: string; email: string; password: string; userRole: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((response: any) => {
        // Si l'inscription réussit, on pourrait rediriger vers la page de connexion ou afficher un message
        console.log('Utilisateur inscrit avec succès', response);
      })
    );
  }

  // Méthode pour se déconnecter
  logout(): void {
    localStorage.removeItem('authToken'); // Supprimer le token
    this.isAuthenticated = false;  // Mettre l'état d'authentification à false
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    // Vérifie d'abord l'état d'authentification local
    return this.isAuthenticated || !!localStorage.getItem('authToken');
  }
}

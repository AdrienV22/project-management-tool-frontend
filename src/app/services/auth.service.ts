import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Service disponible dans toute l'application
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; // URL de l'API backend
  private isAuthenticated: boolean = false; // État de connexion utilisateur

  constructor(private http: HttpClient) {}

  // Méthode pour se connecter
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  // Méthode pour s'inscrire
  register(userData: { username: string; email: string; password: string; userRole: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Méthode pour récupérer les projets de l'utilisateur
  getUserProjects(email: string): Observable<any> {
    const projectsUrl = 'http://localhost:8080/api/projects'; // URL pour récupérer les projets
    return this.http.get(`${projectsUrl}?email=${email}`);
  }

  // Méthode pour se déconnecter
  logout(): void {
    this.isAuthenticated = false; // Réinitialiser l'état d'authentification
    localStorage.removeItem('userEmail'); // Supprimer les données utilisateur locales
  }

  // Définir un utilisateur comme connecté
  setLoggedIn(email: string): void {
    this.isAuthenticated = true; // Marquer l'utilisateur comme authentifié
    localStorage.setItem('userEmail', email); // Sauvegarder l'email dans le localStorage
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.isAuthenticated || !!localStorage.getItem('userEmail');
  }

  // Récupérer l'email de l'utilisateur connecté
  getLoggedInUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }
}

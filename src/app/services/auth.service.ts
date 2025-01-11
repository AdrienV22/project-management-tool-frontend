import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root', // Service disponible dans toute l'application
})
export class AuthService {
  private isAuthenticated: boolean = false; // État de connexion

  constructor() {}

  // Simule une connexion
  login(): void {
    this.isAuthenticated = true;
  }

  // Simule une déconnexion
  logout(): void {
    this.isAuthenticated = false;
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}

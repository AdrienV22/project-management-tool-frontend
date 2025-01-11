import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true; // Autorise l'accès si l'utilisateur est connecté
    }

    // Redirige vers la page de connexion si non connecté
    this.router.navigate(['/login']);
    return false;
  }
}

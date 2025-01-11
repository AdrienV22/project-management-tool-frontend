import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isLoggedIn()) {
      return true;  // Utilisateur connecté, permet l'accès
    } else {
      // Si non connecté, afficher un message d'alerte
      alert('Connectez-vous ou inscrivez-vous pour visualiser les projets et les tâches');
      
      // Rediriger vers la page de connexion
      this.router.navigate(['/login']);
      return false;  // Empêche l'accès à la route protégée
    }
  }
}

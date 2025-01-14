import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service'; // Import du service d'authentification
import { Router } from '@angular/router'; // Import pour gérer la redirection
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common'; // Import du CommonModule

@Component({
  standalone: true, // Indique que c'est un standalone component
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule, CommonModule], // Ajoute CommonModule ici
})
export class AppComponent implements OnInit {
  title = 'Mon application de project management';
  isLoggedIn$: Observable<boolean>; // Observable pour l'état de connexion

  constructor(private authService: AuthService, private router: Router) {
    // Récupérer l'état de connexion via l'observable
    this.isLoggedIn$ = this.authService.getAuthStatus();
  }

  ngOnInit(): void {
    // On met à jour l'état de connexion lorsque l'application est initialisée
    this.isLoggedIn$ = this.authService.getAuthStatus();
  }

  logout() {
    this.authService.logout(); // Déconnexion via AuthService
    this.isLoggedIn$ = this.authService.getAuthStatus(); // Mettre à jour l'état après déconnexion
    this.router.navigate(['/login']); // Redirection vers la page de connexion
  }
}

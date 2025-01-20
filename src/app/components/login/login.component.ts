import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // Vérification des champs requis
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    // Appel au service de connexion
    this.authService.login(this.email, this.password).subscribe(
      (response: any) => {
        // Vérifie que la réponse contient un ID utilisateur
        if (response && response.userId) {
          // Sauvegarde de l'état de connexion avec l'email et l'ID utilisateur
          this.authService.setLoggedIn(this.email, response.userId);

          // Redirection vers la page des projets
          this.router.navigate(['/projects']);
        } else {
          // Gestion d'une réponse incorrecte
          this.errorMessage = "Erreur : L'ID utilisateur est introuvable.";
        }
      },
      (error) => {
        console.error('Erreur lors de la connexion:', error);

        // Gestion des erreurs avec des messages clairs pour l'utilisateur
        if (error.status === 404) {
          this.errorMessage = 'Utilisateur non trouvé.';
        } else if (error.status === 401) {
          this.errorMessage = 'Mot de passe incorrect.';
        } else {
          this.errorMessage = 'Erreur inconnue. Veuillez réessayer.';
        }
      }
    );
  }
}

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
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.authService.login(this.email, this.password).subscribe(
      () => {
        // Sauvegarde de l'état de connexion
        this.authService.setLoggedIn(this.email);

        // Récupération des projets et redirection
        this.authService.getUserProjects(this.email).subscribe(
          (projects) => {
            localStorage.setItem('userProjects', JSON.stringify(projects)); // Sauvegarde des projets
            this.router.navigate(['/projects']); // Redirection vers la page des projets
          },
          (error) => {
            console.error('Erreur lors de la récupération des projets:', error);
            this.errorMessage = 'Impossible de récupérer vos projets.';
          }
        );
      },
      (error) => {
        console.error('Erreur lors de la connexion:', error);

        // Vérification des types d'erreurs pour afficher un message approprié
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

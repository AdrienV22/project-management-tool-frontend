import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';  // Assure-toi d'importer AuthService
import { CommonModule } from '@angular/common';  // Importer CommonModule
import { FormsModule } from '@angular/forms';  // Ajouter FormsModule

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule],  
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null; // Gérer les erreurs de connexion

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    // Utiliser le service AuthService pour gérer la connexion
    this.authService.login(this.email, this.password).subscribe(
      (response: any) => {
        this.errorMessage = null;  // Réinitialiser les erreurs
        // Si la connexion réussie, on redirige vers la page des projets
        this.router.navigate(['/projects']);  // Rediriger vers la page des projets
      },
      (error) => {
        // Gérer l'erreur si la connexion échoue
        console.error('Erreur lors de la connexion', error);

        // Vérifier le code d'erreur HTTP et afficher un message spécifique
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

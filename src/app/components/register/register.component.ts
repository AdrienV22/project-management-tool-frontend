import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';  // Importer AuthService
import { CommonModule } from '@angular/common';  // Import de CommonModule
import { FormsModule } from '@angular/forms';   // Import de FormsModule

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule],  // Ajouter CommonModule et FormsModule ici
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  userRole: string = 'MEMBRE'; // Par défaut, rôle "Membre"
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // Validation basique
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    // Données à envoyer au backend pour l'inscription
    const registerData = {
      username: this.username,
      email: this.email,
      password: this.password,
      userRole: this.userRole
    };

    // Utiliser le service AuthService pour l'inscription
    this.authService.register(registerData).subscribe(
      (response) => {
        this.errorMessage = null; // Réinitialiser les erreurs
        console.log('Utilisateur inscrit avec succès', response);
        this.router.navigate(['/login']);  // Rediriger vers la page de connexion
      },
      (error) => {
        // Gérer l'erreur si l'inscription échoue
        console.error('Erreur lors de l\'inscription', error);
        this.errorMessage = 'Une erreur est survenue, veuillez réessayer.';
      }
    );
  }
}

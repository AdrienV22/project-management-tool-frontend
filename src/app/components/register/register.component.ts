import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Ajouter FormsModule
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';  // Importer AuthService

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule],  // Ajouter FormsModule dans imports
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

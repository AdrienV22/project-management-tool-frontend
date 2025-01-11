import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Ajouter FormsModule
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Importer AuthService
import { CommonModule } from '@angular/common';  // Importer CommonModule

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule], // Ajouter CommonModule dans imports
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
      () => {
        this.errorMessage = null; // Réinitialise les erreurs
        this.router.navigate(['/dashboard']); // Rediriger après connexion
      },
      (error) => {
        // Gérer l'erreur si la connexion échoue
        console.error('Erreur lors de la connexion', error);
        this.errorMessage = 'Échec de la connexion. Vérifiez vos identifiants.';
      }
    );
  }
}

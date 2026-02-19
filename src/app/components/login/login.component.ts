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
  email = '';
  password = '';
  errorMessage: string | null = null;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = null;

    const email = this.email?.trim();
    const password = this.password?.trim();

    if (!email || !password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.authService.login(email, password).subscribe({
      next: (response: any) => {
        // Auth valide uniquement si success + userId présent
        if (response?.status === 'success' && response?.userId) {
          this.authService.setLoggedIn(
            response.email ?? email,
            response.userId,
            response.username,
            response.role
          );

          this.isLoading = false;
          this.router.navigate(['/projects']);
        } else {
          // 🔒 Cas incohérent (ex: success sans userId ou status=error)
          this.isLoading = false;
          this.errorMessage = 'Connexion impossible.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur lors de la connexion:', error);

        if (error?.status === 400 || error?.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else if (error?.status === 404) {
          this.errorMessage = 'Utilisateur non trouvé.';
        } else {
          this.errorMessage = 'Erreur serveur. Veuillez réessayer.';
        }
      },
    });
  }
}

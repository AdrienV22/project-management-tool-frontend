import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Ajouter FormsModule
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule],  // Ajouter FormsModule dans imports
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    const loginData = {
      username: this.username,
      password: this.password
    };

    // Utiliser directement l'URL de ton API ici (par exemple, http://localhost:8080)
    this.http.post('http://localhost:8080/login', loginData).subscribe(
      (response: any) => {
        // Traiter la réponse, par exemple en stockant un token JWT
        localStorage.setItem('authToken', response.token);
        this.router.navigate(['/dashboard']); // Rediriger après une connexion réussie
      },
      (error) => {
        // Gérer l'erreur, afficher un message si la connexion échoue
        console.error('Erreur lors de la connexion', error);
      }
    );
  }
}

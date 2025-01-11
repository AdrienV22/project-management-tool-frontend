import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Ajouter FormsModule
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    const registerData = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    // Utiliser directement l'URL de ton API ici pour l'inscription
    this.http.post('http://localhost:8080/register', registerData).subscribe(
      (response: any) => {
        // Traiter la réponse, par exemple rediriger vers la page de connexion après l'inscription
        this.router.navigate(['/login']);
      },
      (error) => {
        // Gérer l'erreur si l'inscription échoue
        console.error('Erreur lors de l\'inscription', error);
      }
    );
  }
}

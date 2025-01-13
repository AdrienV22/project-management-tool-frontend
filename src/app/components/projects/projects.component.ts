import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Assurez-vous que le chemin est correct
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  imports: [CommonModule],
})
export class ProjectsComponent implements OnInit {
  projects: any[] = []; // Les projets récupérés dynamiquement
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    // Utilisation du service AuthService pour récupérer l'email
    const email = this.authService.getLoggedInUserEmail();

    if (!email) {
      this.errorMessage = 'Utilisateur non connecté. Veuillez vous reconnecter.';
      this.router.navigate(['/login']); // Redirection vers la page de connexion
      return;
    }

    // Appel à l'API pour récupérer les projets
    this.authService.getUserProjects(email).subscribe(
      (projects: any[]) => {
        this.projects = projects || []; // Assurez-vous que projects est toujours un tableau
        if (this.projects.length === 0) {
          this.errorMessage = 'Aucun projet trouvé.';
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des projets :', error);
        this.errorMessage = 'Impossible de charger vos projets.';
      }
    );
  }

  viewProjectDetails(projectId: number) {
    this.router.navigate(['/projects', projectId]);
  }

  addProject() {
    this.router.navigate(['/projects/new']);
  }
}

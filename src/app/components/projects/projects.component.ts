import { Component } from '@angular/core';
import { Router } from '@angular/router';  // Importer Router
import { CommonModule } from '@angular/common'; // Ajoute ceci en haut du fichier

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  imports: [CommonModule] // Si ton composant est standalone, ajoute le ici aussi
})
export class ProjectsComponent {
  // Exemple de données de projet
  projects = [
    { id: 1, name: 'Projet 1', description: 'Description du projet 1' },
    { id: 2, name: 'Projet 2', description: 'Description du projet 2' },
    { id: 3, name: 'Projet 3', description: 'Description du projet 3' },
  ];

  constructor(private router: Router) {}  // Injection du Router

  // Méthode de redirection vers la page de détails du projet
  viewProjectDetails(projectId: number) {
    // Corrige le chemin vers la bonne route
    this.router.navigate(['/projects', projectId]);  // Rediriger vers /projects/:id
  }
}

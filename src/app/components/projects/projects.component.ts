import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  imports: [CommonModule, FormsModule],
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  errorMessage: string | null = null;

  showAddProjectForm: boolean = false;
  newProject: any = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'pending',
    client: ''
  };

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  // Récupérer la liste des projets
  loadProjects() {
    this.projectService.getProjects().subscribe(
      (projects: any[]) => {
        this.projects = projects || [];
        if (this.projects.length === 0) {
          this.errorMessage = 'Aucun projet trouvé.';
        } else {
          this.errorMessage = null; // Réinitialiser l'erreur si des projets sont trouvés
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des projets :', error);
        this.errorMessage = 'Impossible de charger vos projets.';
      }
    );
  }

  // Basculer l'affichage du formulaire d'ajout de projet
  toggleAddProjectForm() {
    this.showAddProjectForm = !this.showAddProjectForm;
  }

  // Soumettre un projet (ajouter un nouveau projet)
  onSubmit() {
    if (!this.newProject.name || !this.newProject.description) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    // Formatage des dates au format yyyy-MM-dd
    const startDate = new Date(this.newProject.startDate);
    const endDate = new Date(this.newProject.endDate);

    // Convertir les dates au format ISO (yyyy-MM-dd)
    const formattedStartDate = startDate.toISOString().split('T')[0]; // Partie yyyy-MM-dd
    const formattedEndDate = endDate.toISOString().split('T')[0];

    // Mettre à jour les dates dans newProject
    this.newProject.startDate = formattedStartDate;
    this.newProject.endDate = formattedEndDate;

    console.log('Données du projet:', this.newProject); // Afficher les données envoyées

    this.projectService.addProject(this.newProject).subscribe(
      (response) => {
        console.log('Projet ajouté avec succès:', response);
        this.projects.push(response);
        this.toggleAddProjectForm();
        this.resetNewProject();
      },
      (error) => {
        console.error('Erreur lors de l\'ajout du projet:', error);
        this.errorMessage = 'Impossible d\'ajouter le projet.';
      }
    );
  }

  // Réinitialiser le formulaire du nouveau projet
  resetNewProject() {
    this.newProject = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'pending',
      client: ''
    };
  }

  // Voir les détails d'un projet
  viewProjectDetails(projectId: number) {
    this.router.navigate(['/projects', projectId]);
  }

  // Déconnexion de l'utilisateur
  logout() {
    this.authService.logout(); // Appelle la méthode logout d'AuthService
    this.router.navigate(['/login']); // Redirige vers la page de connexion
  }
}

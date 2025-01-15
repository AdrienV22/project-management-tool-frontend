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
    client: ''  // représente le chef de projet
  };

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe(
      (projects: any[]) => {
        this.projects = projects || [];
        
        if (this.projects.length === 0) {
          this.errorMessage = 'Aucun projet trouvé.';
        } else {
          this.errorMessage = null; // Réinitialiser l'erreur si des projets sont trouvés
          console.log('Projets chargés:', this.projects);  // Vérification du contenu des projets
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des projets :', error);
        this.errorMessage = 'Impossible de charger vos projets.';
      }
    );
  }
  

  toggleAddProjectForm() {
    this.showAddProjectForm = !this.showAddProjectForm;
  }

  onSubmit() {
    if (!this.newProject.name || !this.newProject.description || !this.newProject.client) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires, y compris le chef de projet.';
      return;
    }
  
    const startDate = new Date(this.newProject.startDate);
    const endDate = new Date(this.newProject.endDate);
  
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
  
    this.newProject.startDate = formattedStartDate;
    this.newProject.endDate = formattedEndDate;
  
    console.log('Données du projet:', this.newProject);
  
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

  viewProjectDetails(projectId: number) {
    this.router.navigate(['/projects', projectId]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

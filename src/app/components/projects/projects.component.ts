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

  // Champs pour inviter un membre
  inviteEmail: string = '';
  inviteRole: string = 'MEMBRE';

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
        this.errorMessage = this.projects.length === 0 ? 'Aucun projet trouvé.' : null;
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

    const startDate = new Date(this.newProject.startDate).toISOString().split('T')[0];
    const endDate = new Date(this.newProject.endDate).toISOString().split('T')[0];

    this.newProject.startDate = startDate;
    this.newProject.endDate = endDate;

    this.projectService.addProject(this.newProject).subscribe(
      (response) => {
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

  viewProjectTasks(projectId: number) {
    this.router.navigate(['/projects', projectId, 'tasks']);
  }

  inviteMember() {
    console.log('Invitation envoyée à', this.inviteEmail, 'avec le rôle', this.inviteRole);
    // Tu pourras appeler le backend ici si tu veux lier à une fonctionnalité réelle
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

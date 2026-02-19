import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projects',
  standalone: true,
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  imports: [CommonModule, FormsModule],
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  errorMessage: string | null = null;

  showAddProjectForm = false;

  newProject: any = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    // ✅ Backend : "statut" (pas "status")
    statut: 'Non défini',
    // ✅ Backend : NOT NULL
    clientEmail: '',
  };

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Prefill du clientEmail depuis le user connecté
    this.newProject.clientEmail = this.getCurrentUserEmail() || '';
    this.loadProjects();
  }

  private getCurrentUserEmail(): string {
    // selon ton AuthService, adapte si tu as déjà un getter propre
    return (
      this.authService.getLoggedInUserEmail?.() ||
      localStorage.getItem('userEmail') ||
      ''
    );
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects: any[]) => {
        const all = projects || [];

        // ✅ Filtre UI minimal conforme : un user voit ses projets (chef de projet)
        // (Sans sécurité backend, mais conforme aux user stories pour l’intégration)
        const myEmail = this.getCurrentUserEmail().trim().toLowerCase();

        this.projects = myEmail
          ? all.filter((p) => String(p?.clientEmail || '').trim().toLowerCase() === myEmail)
          : all;

        this.errorMessage = this.projects.length === 0 ? 'Aucun projet trouvé.' : null;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des projets :', error);
        this.errorMessage = 'Impossible de charger vos projets.';
      },
    });
  }

  toggleAddProjectForm(): void {
    this.showAddProjectForm = !this.showAddProjectForm;
    if (this.showAddProjectForm) {
      this.errorMessage = null;
      // ✅ si l’utilisateur vient de se connecter, on s’assure que c’est rempli
      this.newProject.clientEmail = this.getCurrentUserEmail() || '';
    }
  }

  onSubmit(): void {
    // ✅ Revalider les champs obligatoires
    const clientEmail = (this.newProject.clientEmail || this.getCurrentUserEmail()).trim();
    if (!this.newProject.name?.trim() || !this.newProject.description?.trim() || !clientEmail) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires, y compris le chef de projet.';
      return;
    }

    // ✅ Payload conforme backend
    const payload: any = {
      name: this.newProject.name.trim(),
      description: this.newProject.description.trim(),
      clientEmail,
      statut: this.newProject.statut || 'Non défini',
      startDate: this.newProject.startDate ? this.toIsoDate(this.newProject.startDate) : null,
      endDate: this.newProject.endDate ? this.toIsoDate(this.newProject.endDate) : null,
    };

    this.projectService.addProject(payload).subscribe({
      next: (response) => {
        // ✅ Recharger pour appliquer le filtre + éviter incohérences d’état
        this.toggleAddProjectForm();
        this.resetNewProject();
        this.loadProjects();
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout du projet:", error);
        this.errorMessage = "Impossible d'ajouter le projet.";
      },
    });
  }

  private toIsoDate(value: string): string {
    return new Date(value).toISOString().split('T')[0];
  }

  resetNewProject(): void {
    this.newProject = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      statut: 'Non défini',
      clientEmail: this.getCurrentUserEmail() || '',
    };
  }

  viewProjectDetails(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  viewProjectTasks(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'tasks']);
  }

  // ✅ La consigne veut l’invitation sur la page projet (pas dans le dashboard global).
  // On neutralise proprement cette action ici pour éviter une UX “hors scope”.
  inviteMember(): void {
    this.errorMessage = 'Invitation disponible dans le détail du projet.';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

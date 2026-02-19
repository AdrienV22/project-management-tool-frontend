import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

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
    statut: 'Non défini',
    clientEmail: '',
  };

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.newProject.clientEmail = this.getCurrentUserEmail() || '';
    this.loadProjects();
  }

  private getCurrentUserEmail(): string {
    return (
      this.authService.getLoggedInUserEmail?.() ||
      localStorage.getItem('userEmail') ||
      ''
    );
  }

  async loadProjects(): Promise<void> {
    this.projectService.getProjects().subscribe({
      next: async (projects: any[]) => {
        const all = projects || [];
        const myEmail = (this.getCurrentUserEmail() || '').trim().toLowerCase();

        if (!myEmail) {
          this.projects = all;
          this.errorMessage = this.projects.length === 0 ? 'Aucun projet trouvé.' : null;
          return;
        }

        // 1) Chef de projet
        const owned = all.filter(
          (p) => String(p?.clientEmail || '').trim().toLowerCase() === myEmail
        );

        // 2) Projets où je suis membre (via /api/projects/{id}/users)
        const membershipChecks = all.map(async (p) => {
          try {
            const members = await firstValueFrom(this.projectService.getProjectMembers(p.id));
            const isMember = (members || []).some(
              (m: any) => String(m?.email || '').trim().toLowerCase() === myEmail
            );
            return isMember ? p : null;
          } catch {
            return null;
          }
        });

        const memberOf = (await Promise.all(membershipChecks)).filter(Boolean) as any[];

        // Union sans doublons
        const byId = new Map<number, any>();
        [...owned, ...memberOf].forEach((p) => byId.set(p.id, p));
        this.projects = Array.from(byId.values());

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
      this.newProject.clientEmail = this.getCurrentUserEmail() || '';
    }
  }

  onSubmit(): void {
    const clientEmail = (this.newProject.clientEmail || this.getCurrentUserEmail()).trim();
    if (!this.newProject.name?.trim() || !this.newProject.description?.trim() || !clientEmail) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires, y compris le chef de projet.';
      return;
    }

    const payload: any = {
      name: this.newProject.name.trim(),
      description: this.newProject.description.trim(),
      clientEmail,
      statut: this.newProject.statut || 'Non défini',
      startDate: this.newProject.startDate ? this.toIsoDate(this.newProject.startDate) : null,
      endDate: this.newProject.endDate ? this.toIsoDate(this.newProject.endDate) : null,
    };

    this.projectService.addProject(payload).subscribe({
      next: () => {
        this.toggleAddProjectForm();
        this.resetNewProject();
        // recharge : ça recalculera les memberships
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

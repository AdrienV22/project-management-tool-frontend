import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { TaskService, Task } from '../../services/task.service';

type ProjectRole = 'ADMIN' | 'MEMBRE' | 'OBSERVATEUR' | 'NONE';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ProjectDetailComponent implements OnInit {
  project: any = {};
  members: any[] = [];
  tasks: Task[] = [];

  loading = true;
  error: string | null = null;
  isEditing = false;

  inviteEmail = '';
  inviteRole: 'ADMIN' | 'MEMBRE' | 'OBSERVATEUR' = 'MEMBRE';

  // ✅ Rôle courant sur CE projet (clé RNCP)
  currentUserRole: ProjectRole = 'NONE';

  // ✅ Historique UI
  selectedTaskHistory: any[] = [];
  visibleHistoryTaskId: number | null = null;

  // ✅ Helpers UI (permissions)
  get canInvite(): boolean {
    return this.currentUserRole === 'ADMIN';
  }
  get canManageRoles(): boolean {
    return this.currentUserRole === 'ADMIN';
  }
  get canCreateTask(): boolean {
    return this.currentUserRole === 'ADMIN' || this.currentUserRole === 'MEMBRE';
  }
  get canAssignTask(): boolean {
    return this.currentUserRole === 'ADMIN' || this.currentUserRole === 'MEMBRE';
  }
  get canUpdateTask(): boolean {
    return this.currentUserRole === 'ADMIN' || this.currentUserRole === 'MEMBRE';
  }
  get canEditProject(): boolean {
    // traditionnel : seul ADMIN peut modifier/supprimer projet
    return this.currentUserRole === 'ADMIN';
  }
  get canViewTaskHistory(): boolean {
    // selon ton tableau extrait : historique = ADMIN + MEMBRE (OBSERVATEUR KO)
    return this.currentUserRole === 'ADMIN' || this.currentUserRole === 'MEMBRE';
  }

  newTask: Task = {
    title: '',
    description: '',
    dueDate: null,
    status: 'En cours',
    priority: 'MOYENNE',
    targetUserId: 0,
    project: { id: 0 },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const projectIdStr = this.route.snapshot.paramMap.get('id');
    if (!projectIdStr) return;

    const projectId = Number(projectIdStr);

    this.fetchProject(projectId);
    this.loadMembers(projectId);
    this.loadTasks(projectId);

    const currentUserId = this.authService.getUserId();
    if (currentUserId) this.newTask.targetUserId = currentUserId;
    this.newTask.project = { id: projectId };
  }

  private getCurrentUserEmailLower(): string {
    return (this.authService.getLoggedInUserEmail?.() || localStorage.getItem('userEmail') || '')
      .trim()
      .toLowerCase();
  }

  private fetchProject(projectId: number): void {
    this.loading = true;
    this.projectService.getProjectById(projectId).subscribe({
      next: (data) => {
        this.project = data;
        this.loading = false;

        // ✅ Le rôle peut dépendre du clientEmail -> recalcul après chargement projet
        this.resolveCurrentUserRole();
      },
      error: () => {
        this.error = 'Erreur lors du chargement du projet';
        this.loading = false;
      },
    });
  }

  private loadMembers(projectId: number): void {
    this.projectService.getProjectMembers(projectId).subscribe({
      next: (data) => {
        this.members = data || [];
        this.resolveCurrentUserRole();
      },
      error: (e) => console.error('Erreur members', e),
    });
  }

  private resolveCurrentUserRole(): void {
    const myEmail = this.getCurrentUserEmailLower();
    if (!myEmail) {
      this.currentUserRole = 'NONE';
      return;
    }

    // Si je suis clientEmail : ADMIN
    const clientEmail = String(this.project?.clientEmail || '').trim().toLowerCase();
    if (clientEmail && clientEmail === myEmail) {
      this.currentUserRole = 'ADMIN';
      return;
    }

    // Sinon, chercher dans la liste des membres
    const match = (this.members || []).find(
      (m: any) => String(m?.email || '').trim().toLowerCase() === myEmail
    );

    this.currentUserRole = (match?.role as ProjectRole) || 'NONE';

    // UX : si observateur, on force l’assignation vers soi (et de toute façon le form est masqué)
    if (this.currentUserRole === 'OBSERVATEUR') {
      const currentUserId = this.authService.getUserId();
      if (currentUserId) this.newTask.targetUserId = currentUserId;
    }
  }

  private loadTasks(projectId: number): void {
    this.taskService.getTasks({ projectId }).subscribe({
      next: (data) => (this.tasks = data || []),
      error: (e) => console.error('Erreur tasks', e),
    });
  }

  enableEditMode(): void {
    if (!this.canEditProject) return;
    this.isEditing = true;
  }

  cancelEditMode(): void {
    this.isEditing = false;
    this.fetchProject(this.project.id);
  }

  updateProject(): void {
    if (!this.canEditProject) return;

    this.loading = true;

    const updatedProject = {
      ...this.project,
      statut: this.project.statut || 'Non défini',
      clientEmail: this.project.clientEmail || this.authService.getLoggedInUserEmail() || 'inconnu',
    };

    this.projectService.updateProject(this.project.id, updatedProject).subscribe({
      next: () => {
        this.isEditing = false;
        this.fetchProject(this.project.id);
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors de la mise à jour';
        this.loading = false;
      },
    });
  }

  confirmDelete(): void {
    if (!this.canEditProject) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    this.loading = true;
    this.projectService.deleteProject(this.project.id).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: () => {
        this.error = 'Erreur lors de la suppression';
        this.loading = false;
      },
    });
  }

  inviteMember(): void {
    if (!this.canInvite) return;

    const cleanEmail = (this.inviteEmail || '').trim();
    if (!this.project?.id || !cleanEmail || !this.inviteRole) return;

    this.projectService.addUserToProject(this.project.id, cleanEmail, this.inviteRole).subscribe({
      next: () => {
        this.inviteEmail = '';
        this.inviteRole = 'MEMBRE';
        this.loadMembers(this.project.id);
      },
      error: (e) => console.error('Erreur invitation', e),
    });
  }

  changeUserRole(member: any): void {
    if (!this.canManageRoles) return;

    const email = String(member?.email || '').trim();
    const role = member?.role;
    if (!email || !role) return;

    this.projectService.addUserToProject(this.project.id, email, role).subscribe({
      next: () => this.loadMembers(this.project.id),
      error: (e) => console.error('Erreur role', e),
    });
  }

  createTask(): void {
    if (!this.canCreateTask) return;
    if (!this.project?.id) return;

    const payload: Task = {
      ...this.newTask,
      project: { id: this.project.id },
    };

    this.taskService.createTask(payload).subscribe({
      next: () => {
        this.newTask = {
          title: '',
          description: '',
          dueDate: null,
          status: 'En cours',
          priority: 'MOYENNE',
          targetUserId: this.authService.getUserId() || 0,
          project: { id: this.project.id },
        };
        this.loadTasks(this.project.id);

        // reset historique affiché (optionnel mais propre)
        this.visibleHistoryTaskId = null;
        this.selectedTaskHistory = [];
      },
      error: (e) => console.error('Erreur création tâche', e),
    });
  }

  loadHistory(taskId: number): void {
    if (!this.canViewTaskHistory) return;

    // toggle
    if (this.visibleHistoryTaskId === taskId) {
      this.visibleHistoryTaskId = null;
      this.selectedTaskHistory = [];
      return;
    }

    this.taskService.getTaskHistory(taskId).subscribe({
      next: (h) => {
        this.selectedTaskHistory = h || [];
        this.visibleHistoryTaskId = taskId;
      },
      error: () => {
        this.error = 'Impossible de récupérer l’historique.';
      },
    });
  }
}

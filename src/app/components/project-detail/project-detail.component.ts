import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { TaskService, Task } from '../../services/task.service';

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

  newTask: Task = {
    title: '',
    description: '',
    dueDate: null,
    status: 'En cours',
    priority: 'MOYENNE',
    targetUserId: 0,
    project: { id: 0 }
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

  private fetchProject(projectId: number): void {
    this.loading = true;
    this.projectService.getProjectById(projectId).subscribe({
      next: (data) => {
        this.project = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du projet';
        this.loading = false;
      }
    });
  }

  private loadMembers(projectId: number): void {
    this.projectService.getProjectMembers(projectId).subscribe({
      next: (data) => (this.members = data),
      error: (e) => console.error('Erreur members', e)
    });
  }

  private loadTasks(projectId: number): void {
    this.taskService.getTasks({ projectId }).subscribe({
      next: (data) => (this.tasks = data),
      error: (e) => console.error('Erreur tasks', e)
    });
  }

  enableEditMode(): void { this.isEditing = true; }

  cancelEditMode(): void {
    this.isEditing = false;
    this.fetchProject(this.project.id);
  }

  updateProject(): void {
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
      }
    });
  }

  confirmDelete(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    this.loading = true;
    this.projectService.deleteProject(this.project.id).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: () => {
        this.error = 'Erreur lors de la suppression';
        this.loading = false;
      }
    });
  }

  inviteMember(): void {
    if (!this.project?.id || !this.inviteEmail || !this.inviteRole) return;

    this.projectService.addUserToProject(this.project.id, this.inviteEmail, this.inviteRole).subscribe({
      next: () => {
        this.inviteEmail = '';
        this.inviteRole = 'MEMBRE';
        this.loadMembers(this.project.id);
      },
      error: (e) => console.error('Erreur invitation', e)
    });
  }

  changeUserRole(member: any): void {
    if (!member?.email || !member?.role) return;
    this.projectService.addUserToProject(this.project.id, member.email, member.role).subscribe({
      next: () => this.loadMembers(this.project.id),
      error: (e) => console.error('Erreur role', e)
    });
  }

  createTask(): void {
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
          project: { id: this.project.id }
        };
        this.loadTasks(this.project.id);
      },
      error: (e) => console.error('Erreur création tâche', e)
    });
  }

  loadHistory(taskId: number): void {
    this.taskService.getTaskHistory(taskId).subscribe({
      next: (h) => console.log('History', h),
      error: (e) => console.error('History error', e)
    });
  }
}

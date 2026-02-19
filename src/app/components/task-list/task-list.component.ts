import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TaskService, Task, TaskStatus, TaskPriority } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { StatusFilterPipe } from '../../pipes/status-filter.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusFilterPipe],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];

  errorMessage = '';
  successMessage = '';

  selectedStatus: '' | TaskStatus = '';

  projectId!: number;
  userId!: number;

  newTask: Task = {
    title: '',
    description: '',
    dueDate: null,
    status: 'En attente',
    priority: 'MOYENNE',
    targetUserId: 0,
    project: { id: 0 },
  };

  editingTask: (Task & { id: number }) | null = null;

  selectedTaskHistory: any[] = [];
  visibleHistoryTaskId: number | null = null;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ userId depuis localStorage
    const uid = this.authService.getUserId();
    if (!uid) {
      this.errorMessage = 'Utilisateur non connecté.';
      return;
    }
    this.userId = uid;

    // ✅ projectId depuis l'URL (supporte :id ou :projectId)
    const raw =
      this.route.snapshot.paramMap.get('projectId') ??
      this.route.snapshot.paramMap.get('id');

    const pid = Number(raw);
    if (!pid || Number.isNaN(pid)) {
      this.errorMessage = 'ProjectId manquant dans l’URL.';
      return;
    }
    this.projectId = pid;

    this.resetNewTask();
    this.loadTasks();
  }

  // ✅ Bouton retour
  goBackToProject(): void {
    this.router.navigate(['/projects', this.projectId]);
  }

  private loadTasks(): void {
    this.taskService.getTasks({ projectId: this.projectId }).subscribe({
      next: (data) => {
        this.tasks = data || [];
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des tâches', error);
        this.errorMessage = 'Impossible de charger les tâches.';
      },
    });
  }

  createTask(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const payload: Task = {
      ...this.newTask,
      targetUserId: this.userId,
      project: { id: this.projectId },
    };

    this.taskService.createTask(payload).subscribe({
      next: () => {
        this.successMessage = 'Tâche créée avec succès !';
        this.resetNewTask();
        this.loadTasks();
      },
      error: (error) => {
        console.error('Erreur lors de la création de la tâche', error);
        this.errorMessage = 'Impossible de créer la tâche.';
      },
    });
  }

  startEditing(task: Task): void {
    if (!task?.id) return;
    this.editingTask = { ...(task as any), id: task.id };
  }

  cancelEditing(): void {
    this.editingTask = null;
  }

  updateTask(): void {
    if (!this.editingTask?.id) return;

    this.errorMessage = '';
    this.successMessage = '';

    const taskId = this.editingTask.id;

    const payload: Partial<Task> = {
      title: this.editingTask.title,
      description: this.editingTask.description,
      dueDate: this.editingTask.dueDate,
      status: this.editingTask.status,
      priority: this.editingTask.priority,
      targetUserId: this.editingTask.targetUserId,
      project: { id: this.projectId },
    };

    this.taskService.updateTask(taskId, payload).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex((t) => t.id === updatedTask.id);
        if (index !== -1) this.tasks[index] = updatedTask;

        this.successMessage = 'Tâche mise à jour avec succès.';
        this.editingTask = null;
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la tâche', error);
        this.errorMessage = 'Impossible de mettre à jour la tâche.';
      },
    });
  }

  deleteTask(id: number): void {
    if (!id) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== id);
        this.successMessage = 'Tâche supprimée avec succès.';
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la tâche', error);
        this.errorMessage = 'Impossible de supprimer la tâche.';
      },
    });
  }

  showHistory(taskId: number | undefined): void {
    if (!taskId) return;

    if (this.visibleHistoryTaskId === taskId) {
      this.visibleHistoryTaskId = null;
      this.selectedTaskHistory = [];
      return;
    }

    this.taskService.getTaskHistory(taskId).subscribe({
      next: (history) => {
        this.selectedTaskHistory = history || [];
        this.visibleHistoryTaskId = taskId;
      },
      error: () => {
        this.errorMessage = 'Impossible de récupérer l’historique.';
      },
    });
  }

  private resetNewTask(): void {
    this.newTask = {
      title: '',
      description: '',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE' as TaskPriority,
      targetUserId: this.userId,
      project: { id: this.projectId },
    };
  }
}

import { Component, OnInit } from '@angular/core';
import { TaskService, Task, TaskStatus } from '../../services/task.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule]
})
export class TaskComponent implements OnInit {

  tasks: Task[] = [];

  task: Task = {
    title: '',
    description: '',
    dueDate: null,
    status: 'En attente',
    priority: 'MOYENNE',
    targetUserId: 1
  };

  // Variables pour la modification
  showEditModal = false;

  editingTask: Task = {
    title: '',
    description: '',
    dueDate: null,
    status: 'En attente',
    priority: 'MOYENNE',
    targetUserId: 1
  };

  constructor(
    private taskService: TaskService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        console.log('Tâches récupérées :', data);
        this.tasks = data;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des tâches', error);
      }
    });
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  onSubmit(): void {
    const currentUserId = this.authService.getUserId();

    if (!currentUserId) {
      console.error('Utilisateur non connecté');
      return;
    }

    this.task.targetUserId = currentUserId;

    this.taskService.createTask(this.task).subscribe({
      next: (response) => {
        console.log('Tâche créée avec succès', response);
        this.tasks.push(response);
        this.resetTaskForm();
      },
      error: (error) => {
        console.error('Erreur lors de la création de la tâche', error);
      }
    });
  }

  resetTaskForm(): void {
    this.task = {
      title: '',
      description: '',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: this.authService.getUserId() || 1
    };
  }

  // Drag & drop
  onDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
    const taskId = event.item.data?.id;

    if (!taskId) return;

    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Mise à jour locale optimiste
    task.status = newStatus;

    // ✅ updateTask(taskId, partial)
    this.taskService.updateTask(taskId, { status: newStatus }).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) this.tasks[index] = updatedTask;
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut', error);
      }
    });
  }

  // Edition
  editTask(task: Task): void {
    this.editingTask = { ...task };
    this.showEditModal = true;
  }

  updateTask(): void {
    const taskId = this.editingTask.id;
    if (!taskId) return;

    // On envoie uniquement les champs utiles (Partial<Task>)
    const payload: Partial<Task> = {
      title: this.editingTask.title,
      description: this.editingTask.description,
      dueDate: this.editingTask.dueDate,
      status: this.editingTask.status,
      priority: this.editingTask.priority,
      targetUserId: this.editingTask.targetUserId,
      project: this.editingTask.project,
      parentProject: this.editingTask.parentProject,
    };

    this.taskService.updateTask(taskId, payload).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) this.tasks[index] = updatedTask;
        this.closeEditModal();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la tâche', error);
      }
    });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingTask = {
      title: '',
      description: '',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: this.authService.getUserId() || 1
    };
  }

  deleteTask(taskId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== taskId);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la tâche', error);
        }
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';
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
  projectMembers: any[] = [];
  newTask: Task = {
    id: 0,
    title: '',
    description: '',
    dueDate: '',
    status: 'New',
    priority: 'MOYENNE',
    targetUserId: 1,
  };
  editingTask: Task | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  selectedStatus: string = '';

  selectedTaskHistory: any[] = [];
  visibleHistoryTaskId: number | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadProjectMembers();
  }

  private loadTasks(): void {
    this.taskService.getTasks().subscribe(
      (data) => {
        this.tasks = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des tâches', error);
        this.errorMessage = 'Impossible de charger les tâches.';
      }
    );
  }

  private loadProjectMembers(): void {
    this.projectMembers = [
      { username: 'Alice', email: 'alice@example.com' },
      { username: 'Bob', email: 'bob@example.com' },
      { username: 'Charlie', email: 'charlie@example.com' },
    ];
  }

  createTask(): void {
    this.taskService.createTask(this.newTask).subscribe(
      (createdTask) => {
        this.tasks.push(createdTask);
        this.successMessage = 'Tâche créée avec succès !';
        this.errorMessage = '';
        this.resetNewTask();
      },
      (error) => {
        console.error('Erreur lors de la création de la tâche', error);
        this.errorMessage = 'Impossible de créer la tâche.';
        this.successMessage = '';
      }
    );
  }

  assignTask(task: Task): void {
    if (!task.id || !task.assigneeEmail) return;

    this.taskService.assignTaskToUser(task.id, task.assigneeEmail).subscribe({
      next: () => {
        this.successMessage = `Tâche assignée à ${task.assigneeEmail}`;
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l’assignation de la tâche';
        this.successMessage = '';
      }
    });
  }

  startEditing(task: Task): void {
    this.editingTask = { ...task };
  }

  cancelEditing(): void {
    this.editingTask = null;
  }

  updateTask(): void {
    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask).subscribe(
        (updatedTask) => {
          const index = this.tasks.findIndex((task) => task.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
          }
          this.successMessage = 'Tâche mise à jour avec succès.';
          this.errorMessage = '';
          this.editingTask = null;
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de la tâche', error);
          this.errorMessage = 'Impossible de mettre à jour la tâche.';
          this.successMessage = '';
        }
      );
    }
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe(
      () => {
        this.tasks = this.tasks.filter((task) => task.id !== id);
        this.successMessage = 'Tâche supprimée avec succès.';
        this.errorMessage = '';
      },
      (error) => {
        console.error('Erreur lors de la suppression de la tâche', error);
        this.errorMessage = 'Impossible de supprimer la tâche.';
        this.successMessage = '';
      }
    );
  }

  private resetNewTask(): void {
    this.newTask = {
      id: 0,
      title: '',
      description: '',
      dueDate: '',
      status: 'New',
      priority: 'MOYENNE',
      targetUserId: 1,
    };
  }

  showHistory(taskId: number): void {
    if (this.visibleHistoryTaskId === taskId) {
      this.visibleHistoryTaskId = null;
      this.selectedTaskHistory = [];
      return;
    }

    this.taskService.getTaskHistory(taskId).subscribe({
      next: (history) => {
        this.selectedTaskHistory = history;
        this.visibleHistoryTaskId = taskId;
      },
      error: () => {
        this.errorMessage = 'Impossible de récupérer l’historique.';
      }
    });
  }

  get editingTaskTitle(): string {
    return this.editingTask ? this.editingTask.title : '';
  }

  get editingTaskDescription(): string {
    return this.editingTask ? this.editingTask.description : '';
  }

  get editingTaskDueDate(): string {
    return this.editingTask ? this.editingTask.dueDate : '';
  }

  get editingTaskPriority(): string {
    return this.editingTask ? this.editingTask.priority : '';
  }

  get editingTaskStatus(): string {
    return this.editingTask ? this.editingTask.status : '';
  }
}

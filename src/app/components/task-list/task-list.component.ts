import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // Ajout de FormsModule dans imports
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  newTask: Task = {
    id: 0,
    title: '',
    description: '',
    dueDate: '',
    status: 'New',
    priority: 'MOYENNE',
    targetUserId: 1,
  };
  editingTask: Task | null = null; // Tâche en cours d'édition
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  // Méthode pour charger toutes les tâches
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

  // Récupère la valeur d'un champ de la tâche en édition
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

  // Méthode pour créer une nouvelle tâche
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

  // Méthode pour démarrer l'édition d'une tâche
  startEditing(task: Task): void {
    this.editingTask = { ...task }; // Clone de la tâche à éditer
  }

  // Méthode pour annuler l'édition
  cancelEditing(): void {
    this.editingTask = null; // Réinitialise la tâche en cours d'édition
  }

  // Méthode pour enregistrer les modifications d'une tâche
  updateTask(): void {
    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask).subscribe(
        (updatedTask) => {
          const index = this.tasks.findIndex((task) => task.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask; // Met à jour la tâche dans la liste
          }
          this.successMessage = 'Tâche mise à jour avec succès.';
          this.errorMessage = '';
          this.editingTask = null; // Sort de l'édition
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de la tâche', error);
          this.errorMessage = 'Impossible de mettre à jour la tâche.';
          this.successMessage = '';
        }
      );
    }
  }

  // Méthode pour supprimer une tâche
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
  
  
  // Méthode pour réinitialiser le formulaire de nouvelle tâche
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
}


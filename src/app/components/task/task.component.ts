import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';  // Assure-toi d'importer le service AuthService

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TaskComponent implements OnInit {

  tasks: Task[] = [];
  task: Task = {
    id: 0,
    title: '',
    description: '',
    dueDate: '',
    status: 'New',
    priority: 'MOYENNE', // Ajout de la propriété priority
    targetUserId: 1  // Utilisation de l'ID de l'utilisateur
  };

  // Variables pour la modification
  showEditModal = false;
  editingTask: Task = {
    id: 0,
    title: '',
    description: '',
    dueDate: '',
    status: 'New',
    priority: 'MOYENNE',
    targetUserId: 1
  };

  constructor(
    private taskService: TaskService, 
    private router: Router,
    private authService: AuthService  // Injecter le service AuthService
  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe(
      (data) => {
        console.log('Tâches récupérées :', data);
        this.tasks = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des tâches', error);
      }
    );
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  onSubmit(): void {
    // Récupérer l'ID de l'utilisateur depuis le service AuthService
    const currentUserId = this.authService.getUserId();  // Utiliser l'ID de l'utilisateur connecté

    // Vérifier si l'utilisateur est authentifié avant d'envoyer la tâche
    if (!currentUserId) {
      console.error('Utilisateur non connecté');
      return; // Si l'utilisateur n'est pas authentifié, on ne soumet pas la tâche
    }

    // Ajouter l'ID de l'utilisateur à la tâche
    this.task.targetUserId = currentUserId;

    // Appeler le service pour créer la tâche avec l'ID de l'utilisateur
    this.taskService.createTask(this.task).subscribe(
      (response) => {
        console.log('Tâche créée avec succès', response);
        this.tasks.push(response);
        this.resetTaskForm();
      },
      (error) => {
        console.error('Erreur lors de la création de la tâche', error);
      }
    );
  }

  resetTaskForm(): void {
    this.task = {
      id: 0,
      title: '',
      description: '',
      dueDate: '',
      status: 'New',
      priority: 'MOYENNE',
      targetUserId: this.authService.getUserId() || 1
    };
  }

  // Méthodes pour le drag & drop
  onDragStart(event: DragEvent, task: Task): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', task.id.toString());
    }
  }

  onDrop(event: DragEvent, newStatus: string): void {
    event.preventDefault();
    const taskId = event.dataTransfer?.getData('text/plain');
    if (taskId) {
      const task = this.tasks.find(t => t.id.toString() === taskId);
      if (task) {
        task.status = newStatus;
        this.taskService.updateTask(task).subscribe(
          (updatedTask) => {
            const index = this.tasks.findIndex(t => t.id === updatedTask.id);
            if (index !== -1) {
              this.tasks[index] = updatedTask;
            }
          },
          (error) => {
            console.error('Erreur lors de la mise à jour du statut', error);
          }
        );
      }
    }
  }

  // Méthodes pour la modification
  editTask(task: Task): void {
    this.editingTask = { ...task };
    this.showEditModal = true;
  }

  updateTask(): void {
    this.taskService.updateTask(this.editingTask).subscribe(
      (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.closeEditModal();
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de la tâche', error);
      }
    );
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingTask = {
      id: 0,
      title: '',
      description: '',
      dueDate: '',
      status: 'New',
      priority: 'MOYENNE',
      targetUserId: 1
    };
  }

  deleteTask(taskId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.taskService.deleteTask(taskId).subscribe(
        () => {
          this.tasks = this.tasks.filter(t => t.id !== taskId);
        },
        (error) => {
          console.error('Erreur lors de la suppression de la tâche', error);
        }
      );
    }
  }
}

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

  constructor(
    private taskService: TaskService, 
    private router: Router,
    private authService: AuthService  // Injecter le service AuthService
  ) { }

  ngOnInit(): void {
    // Récupérer les tâches existantes
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
        // Réinitialiser le formulaire de création de tâche
        this.task = { id: 0, title: '', description: '', dueDate: '', status: 'New', priority: 'MOYENNE', targetUserId: currentUserId };
      },
      (error) => {
        console.error('Erreur lors de la création de la tâche', error);
      }
    );
  }
}

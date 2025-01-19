import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { Router } from '@angular/router';

// Importer CommonModule et FormsModule
import { CommonModule } from '@angular/common';  // Nécessaire pour *ngFor, date pipe, etc.
import { FormsModule } from '@angular/forms';  // Nécessaire pour ngModel

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  standalone: true,  // Ajoute cette ligne si tu utilises des composants standalone
  imports: [CommonModule, FormsModule]  // Ajouter CommonModule et FormsModule aux imports
})
export class TaskComponent implements OnInit {

  tasks: Task[] = [];  // Tableau pour stocker les tâches

  // Initialisation de la tâche avec toutes les propriétés requises
  task: Task = {
    id: 0, // Initialement 0 (sera généré par le backend lors de la création)
    title: '',
    description: '',
    dueDate: '', // Assure-toi que le format correspond au backend (e.g., 'YYYY-MM-DD')
    status: 'New', // Statut par défaut
    priority: 'MOYENNE', // Valeur par défaut pour la priorité
    targetUserId: 1 // Exemple d'ID utilisateur cible par défaut
  };

  constructor(private taskService: TaskService, private router: Router) { }

  ngOnInit(): void {
    // Récupérer toutes les tâches depuis l'API
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

  // Méthode pour soumettre le formulaire et créer une tâche
  onSubmit(): void {
    // Validation simple avant l'envoi
    if (!this.task.title || !this.task.description) {
      console.error('Le titre et la description sont obligatoires.');
      return;
    }

    this.taskService.createTask(this.task).subscribe(
      (response) => {
        console.log('Tâche créée avec succès', response);
        // Ajoute la tâche créée à la liste des tâches
        this.tasks.push(response);
        // Réinitialise le formulaire
        this.resetTaskForm();
      },
      (error) => {
        console.error('Erreur lors de la création de la tâche', error);
      }
    );
  }

  // Méthode pour réinitialiser le formulaire après la création
  resetTaskForm(): void {
    this.task = {
      id: 0,
      title: '',
      description: '',
      dueDate: '',
      status: 'New',
      priority: 'MOYENNE',
      targetUserId: 1
    };
  }
}

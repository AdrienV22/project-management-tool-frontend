import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common'; // Importation nécessaire pour *ngIf et *ngFor

@Component({
  selector: 'app-task-list',
  standalone: true, // Déclaration du composant comme standalone
  imports: [CommonModule],  // Nécessaire pour l'utilisation de *ngIf et *ngFor
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  tasks: any[] = []; // Tableau pour stocker les tâches

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    // Appel à la méthode getTasks() pour récupérer les tâches
    this.taskService.getTasks().subscribe(
      (data) => {
        console.log('Tâches récupérées :', data); // Affiche les tâches dans la console
        this.tasks = data; // Stocke les tâches dans le tableau
      },
      (error) => {
        console.error('Erreur lors de la récupération des tâches', error);
      }
    );
  }
}

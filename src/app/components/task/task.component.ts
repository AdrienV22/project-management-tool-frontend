// src/app/components/task/task.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  taskId: string | null = null;  // ID de la tâche si présent
  tasks: string[] = ['Tâche 1', 'Tâche 2', 'Tâche 3'];  // Exemple de liste de tâches (tu peux l'adapter)

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Vérifier si un paramètre 'id' est présent dans l'URL
    this.route.paramMap.subscribe((params) => {
      this.taskId = params.get('id');
    });
  }
}

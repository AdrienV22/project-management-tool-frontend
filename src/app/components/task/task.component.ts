import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    targetUserId: 1  // Ajout de la propriété targetUserId
  };

  constructor(private taskService: TaskService, private router: Router) { }

  ngOnInit(): void {
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
    this.taskService.createTask(this.task).subscribe(
      (response) => {
        console.log('Tâche créée avec succès', response);
        this.tasks.push(response);
        this.task = { id: 0, title: '', description: '', dueDate: '', status: 'New', priority: 'MOYENNE', targetUserId: 1 };
      },
      (error) => {
        console.error('Erreur lors de la création de la tâche', error);
      }
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Définir un type Task avec les propriétés du backend
export interface Task {
  id?: number; // ID facultatif pour la création
  title: string;
  description: string;
  dueDate: string;  
  status: string;   
  priority: 'HAUTE' | 'MOYENNE' | 'BASSE'; // Priorités définies
  targetUserId: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/tasks';  // URL de l'API backend

  constructor(private http: HttpClient) { }

  // Méthode pour récupérer toutes les tâches
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching tasks:', error);
        return throwError(() => new Error('Failed to fetch tasks'));
      })
    );
  }

  // Méthode pour créer une nouvelle tâche
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      catchError(error => {
        console.error('Error creating task:', error);
        return throwError(() => new Error('Failed to create task'));
      })
    );
  }

  // Méthode pour mettre à jour une tâche
  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task).pipe(
      catchError(error => {
        console.error('Error updating task:', error);
        return throwError(() => new Error('Failed to update task'));
      })
    );
  }

  // Méthode pour supprimer une tâche
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting task:', error);
        return throwError(() => new Error('Failed to delete task'));
      })
    );
  }
}

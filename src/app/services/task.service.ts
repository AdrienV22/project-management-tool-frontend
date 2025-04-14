import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Définir un type Task
export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  priority: 'HAUTE' | 'MOYENNE' | 'BASSE';
  targetUserId: number;
  assigneeEmail?: string; // Ajouté pour l'assignation frontend
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/tasks';

  constructor(private http: HttpClient) {}

  // Récupérer toutes les tâches
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching tasks:', error);
        return throwError(() => new Error('Failed to fetch tasks'));
      })
    );
  }

  // Créer une nouvelle tâche
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      catchError(error => {
        console.error('Error creating task:', error);
        return throwError(() => new Error('Failed to create task'));
      })
    );
  }

  // Mettre à jour une tâche
  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task).pipe(
      catchError(error => {
        console.error('Error updating task:', error);
        return throwError(() => new Error('Failed to update task'));
      })
    );
  }

  // Supprimer une tâche
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting task:', error);
        return throwError(() => new Error('Failed to delete task'));
      })
    );
  }

  // Assigner une tâche à un utilisateur
  assignTaskToUser(taskId: number, userEmail: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}/assign`, null, {
      params: { email: userEmail }
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de l’assignation de la tâche :', error);
        return throwError(() => new Error('Erreur lors de l’assignation de la tâche'));
      })
    );
  }

  // Récupérer l'historique d'une tâche
  getTaskHistory(taskId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${taskId}/history`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de l’historique :', error);
        return throwError(() => new Error('Impossible de charger l’historique'));
      })
    );
  }
}

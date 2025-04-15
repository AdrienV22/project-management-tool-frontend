import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Définir un type Task
export interface Task {
  id?: number; // ✅ au lieu de id: number
  title: string;
  description: string;
  dueDate: string;
  status: string;
  priority: string;
  targetUserId: number;
  parentProject?: { id: number };
  assigneeEmail?: string;
}


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/tasks';

  constructor(private http: HttpClient) {}

  getTasks(userId?: number, projectId?: number): Observable<Task[]> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId.toString());
    if (projectId) params = params.set('projectId', projectId.toString());

    return this.http.get<Task[]>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors du chargement des tâches :', error);
        return throwError(() => new Error('Impossible de charger les tâches'));
      })
    );
  }

  createTask(task: Task): Observable<Task> {
    const userId = task.targetUserId;
    console.log("Données envoyées pour création :", task); 
  
    return this.http.post<Task>(`${this.apiUrl}?userId=${userId}`, task).pipe(
      catchError(error => {
        console.error('Erreur lors de la création de la tâche :', error);
        return throwError(() => new Error('Impossible de créer la tâche'));
      })
    );
  }
  
  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task).pipe(
      catchError(error => {
        console.error('Erreur lors de la mise à jour de la tâche :', error);
        return throwError(() => new Error('Impossible de mettre à jour la tâche'));
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la suppression de la tâche :', error);
        return throwError(() => new Error('Impossible de supprimer la tâche'));
      })
    );
  }

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

  getTaskHistory(taskId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${taskId}/history`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de l’historique :', error);
        return throwError(() => new Error('Impossible de charger l’historique'));
      })
    );
  }
}

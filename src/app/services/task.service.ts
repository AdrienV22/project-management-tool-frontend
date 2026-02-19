import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Task {
  id?: number;
  title: string;
  description: string;
  dueDate: string | null; // back: LocalDate
  status: 'En cours' | 'Terminé' | 'En attente';
  priority: 'BASSE' | 'MOYENNE' | 'HAUTE';
  targetUserId: number;
  project: { id: number }; // ✅ back attend project.id
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/tasks'; // ✅ CRUD tasks
  private historyUrl = 'http://localhost:8080/tasks'; // ✅ history controller (sans /api)

  constructor(private http: HttpClient) {}

  getTasks(filters?: { status?: string; projectId?: number }): Observable<Task[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.projectId != null) params = params.set('projectId', String(filters.projectId));

    return this.http.get<Task[]>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors du chargement des tâches :', error);
        return throwError(() => new Error('Impossible de charger les tâches'));
      })
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      catchError(error => {
        console.error('Erreur lors de la création de la tâche :', error);
        return throwError(() => new Error('Impossible de créer la tâche'));
      })
    );
  }

  updateTask(taskId: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${taskId}`, task).pipe(
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

  /** ✅ BACKEND: GET /tasks/{taskId}/history  (pas /api) */
  getTaskHistory(taskId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.historyUrl}/${taskId}/history`).pipe(
      catchError(error => {
        // 204 = pas d'historique : ce n'est PAS une erreur fonctionnelle
        if (error?.status === 204) return new Observable<any[]>(subscriber => { subscriber.next([]); subscriber.complete(); });
        console.error("Erreur lors de la récupération de l’historique :", error);
        return throwError(() => new Error("Impossible de charger l’historique"));
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type TaskStatus = 'En attente' | 'En cours' | 'Terminé';
export type TaskPriority = 'BASSE' | 'MOYENNE' | 'HAUTE';

export interface Task {
  id?: number;
  title: string;
  description: string;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  targetUserId: number;

  // ✅ backend attendu: project.id
  project?: { id: number };

  // (compat ancienne) si tu as encore des endroits qui utilisent parentProject
  parentProject?: { id: number };
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  // ✅ endpoints Swagger
  private apiUrl = 'http://localhost:8080/api/tasks';

  // ✅ historique (d’après ton backend) : GET /tasks/{taskId}/history
  private historyUrl = 'http://localhost:8080/tasks';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/tasks?projectId=9&status=En%20cours
   */
  getTasks(filters?: { projectId?: number; status?: TaskStatus }): Observable<Task[]> {
    let params = new HttpParams();
    if (filters?.projectId != null) params = params.set('projectId', String(filters.projectId));
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<Task[]>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.error('Erreur lors du chargement des tâches :', error);
        return throwError(() => new Error('Impossible de charger les tâches'));
      })
    );
  }

  /**
   * POST /api/tasks
   * body: { title, description, dueDate, status, priority, targetUserId, project:{id} }
   */
  createTask(task: Task): Observable<Task> {
    const payload: Task = {
      ...task,
      project: task.project ?? task.parentProject, // compat
    };
    delete (payload as any).parentProject;

    return this.http.post<Task>(this.apiUrl, payload).pipe(
      catchError((error) => {
        console.error('Erreur lors de la création de la tâche :', error);
        return throwError(() => new Error('Impossible de créer la tâche'));
      })
    );
  }

  /**
   * PUT /api/tasks/{taskId}
   */
  updateTask(taskId: number, task: Partial<Task>): Observable<Task> {
    const payload: any = { ...task };
    if (payload.parentProject && !payload.project) payload.project = payload.parentProject;
    delete payload.parentProject;

    return this.http.put<Task>(`${this.apiUrl}/${taskId}`, payload).pipe(
      catchError((error) => {
        console.error('Erreur lors de la mise à jour de la tâche :', error);
        return throwError(() => new Error('Impossible de mettre à jour la tâche'));
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la suppression de la tâche :', error);
        return throwError(() => new Error('Impossible de supprimer la tâche'));
      })
    );
  }

  getTaskHistory(taskId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.historyUrl}/${taskId}/history`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération de l’historique :', error);
        return throwError(() => new Error('Impossible de charger l’historique'));
      })
    );
  }
}

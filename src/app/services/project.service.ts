import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api/projects';
  private tasksUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des projets:', error);
        return throwError(() => new Error('Erreur de récupération des projets'));
      })
    );
  }

  addProject(project: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl, project, { headers }).pipe(
      catchError((error) => {
        console.error('Erreur lors de l\'ajout du projet:', error);
        return throwError(() => new Error('Erreur lors de l\'ajout du projet'));
      })
    );
  }

  getProjectById(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération du projet:', error);
        return throwError(() => new Error('Erreur de récupération du projet'));
      })
    );
  }

  updateProject(projectId: number, updatedData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.apiUrl}/${projectId}`, updatedData, { headers }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la mise à jour du projet:', error);
        return throwError(() => new Error('Erreur de mise à jour du projet'));
      })
    );
  }

  deleteProject(projectId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${projectId}`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la suppression du projet:', error);
        return throwError(() => new Error('Erreur de suppression du projet'));
      })
    );
  }

  // ✅ Invitation membre (backend: PUT /api/projects/{projectId}/users?userEmail=...&role=...)
  addUserToProject(projectId: number, email: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${projectId}/users`, null, {
      params: { userEmail: email, role }
    }).pipe(
      catchError((error) => {
        console.error('Erreur lors de l\'invitation du membre:', error);
        return throwError(() => new Error('Erreur d\'invitation'));
      })
    );
  }

  // ✅ Cohérence swagger: POST /api/tasks
  createTask(task: any): Observable<any> {
    return this.http.post(this.tasksUrl, task).pipe(
      catchError((error) => {
        console.error('Erreur lors de la création de la tâche :', error);
        return throwError(() => new Error('Erreur de création de la tâche'));
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api/projects';  //  URL de base pour l'API

  constructor(private http: HttpClient) {}

  // Récupérer tous les projets
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des projets:', error);
        return throwError(() => new Error('Erreur de récupération des projets'));
      })
    );
  }

  // Ajouter un projet
  addProject(project: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}`, project, { headers }).pipe(
      catchError((error) => {
        console.error('Erreur lors de l\'ajout du projet:', error);
        return throwError(() => new Error('Erreur lors de l\'ajout du projet'));
      })
    );
  }

  // Récupérer un projet spécifique
  getProjectById(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération du projet:', error);
        return throwError(() => new Error('Erreur de récupération du projet'));
      })
    );
  }

  // Mettre à jour un projet
  updateProject(projectId: number, updatedData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.apiUrl}/${projectId}`, updatedData, { headers }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la mise à jour du projet:', error);
        return throwError(() => new Error('Erreur de mise à jour du projet'));
      })
    );
  }

  // Supprimer un projet
  deleteProject(projectId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${projectId}`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la suppression du projet:', error);
        return throwError(() => new Error('Erreur de suppression du projet'));
      })
    );
  }
}

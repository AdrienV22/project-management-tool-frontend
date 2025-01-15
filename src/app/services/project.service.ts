import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api/projects';  //  URL de base pour l'API

  constructor(private http: HttpClient) {}

  // Récupérer tous les projets
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // Ajouter un projet
  addProject(project: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, project);
  }

  // Récupérer un projet spécifique
  getProjectById(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}`);
  }

  // Mettre à jour un projet
  updateProject(projectId: number, updatedData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${projectId}`, updatedData);
  }

  // Supprimer un projet
  deleteProject(projectId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${projectId}`);
  }
}


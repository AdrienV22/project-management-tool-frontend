import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api/projects'; // Remplace par l'URL de ton backend

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer les projets
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // Méthode pour ajouter un projet
  addProject(project: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, project);
  }

  // Méthode pour récupérer les détails d'un projet spécifique
  getProjectById(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}`);
  }

  // Méthode pour mettre à jour un projet
  updateProject(projectId: number, updatedData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${projectId}`, updatedData);
  }

  // Méthode pour supprimer un projet
  deleteProject(projectId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${projectId}`);
  }
}

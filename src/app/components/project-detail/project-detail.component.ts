import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Pour les directives Angular

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  imports: [CommonModule] // Si ton composant est standalone, tu dois l'ajouter ici
})
export class ProjectDetailComponent implements OnInit {
  project: any;
  loading: boolean = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.fetchProjectDetails(projectId);
    }
  }

  fetchProjectDetails(id: string): void {
    this.http.get(`http://localhost:8080/projects/${id}`).subscribe(
      (data: any) => {
        this.project = data;
        this.loading = false;
      },
      (error) => {
        this.error = 'Erreur lors du chargement des détails du projet';
        this.loading = false;
      }
    );
  }
}

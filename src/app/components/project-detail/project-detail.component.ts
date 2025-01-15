import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common'; // Pour *ngIf et d'autres directives Angular
import { FormsModule } from '@angular/forms'; // Pour [(ngModel)]

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  standalone: true, // Si votre composant est standalone
  imports: [CommonModule, FormsModule], // Ajout des modules requis
})
export class ProjectDetailComponent implements OnInit {
  project: any = {};
  loading: boolean = true;
  error: string | null = null;
  isEditing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.fetchProjectDetails(projectId);
    }
  }

  fetchProjectDetails(id: string): void {
    this.projectService.getProjectById(+id).subscribe(
      (data) => {
        this.project = data;
        this.loading = false;
      },
      (error) => {
        this.error = 'Erreur lors du chargement des détails du projet';
        this.loading = false;
      }
    );
  }

  enableEditMode(): void {
    this.isEditing = true;
  }

  cancelEditMode(): void {
    this.isEditing = false;
    this.fetchProjectDetails(this.project.id); // Recharge les données originales
  }

  updateProject(): void {
    this.projectService.updateProject(this.project.id, this.project).subscribe(
      () => {
        this.isEditing = false;
        this.fetchProjectDetails(this.project.id);
      },
      (error) => {
        this.error = 'Erreur lors de la mise à jour du projet';
      }
    );
  }

  confirmDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.projectService.deleteProject(this.project.id).subscribe(
        () => {
          this.router.navigate(['/projects']); // Redirige vers la liste des projets
        },
        (error) => {
          this.error = 'Erreur lors de la suppression du projet';
        }
      );
    }
  }
}

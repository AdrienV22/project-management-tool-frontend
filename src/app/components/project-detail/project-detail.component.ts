import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  standalone: true, 
  imports: [CommonModule, FormsModule], 
})
export class ProjectDetailComponent implements OnInit {
  project: any = {};
  loading: boolean = true;
  error: string | null = null; 
  isEditing: boolean = false;

  inviteEmail: string = '';
  inviteRole: string = 'MEMBRE';

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
    this.loading = true;
    this.projectService.getProjectById(+id).subscribe(
      (data) => {
        this.project = data;
        this.loading = false;
      },
      (error) => {
        this.error = 'Erreur lors du chargement du projet';
        this.loading = false;
      }
    );
  }

  enableEditMode(): void {
    this.isEditing = true;
  }

  cancelEditMode(): void {
    this.isEditing = false;
    this.fetchProjectDetails(this.project.id);
  }

  updateProject(): void {
    this.loading = true;

    const updatedProject = {
      ...this.project,
      statut: this.project.statut || 'Non défini',
      clientEmail: this.project.clientEmail || 'Inconnu',
    };

    this.projectService.updateProject(this.project.id, updatedProject).subscribe(
      () => {
        this.isEditing = false;
        this.fetchProjectDetails(this.project.id);
        this.loading = false;
      },
      () => {
        this.error = 'Erreur lors de la mise à jour';
        this.loading = false;
      }
    );
  }

  confirmDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.loading = true;
      this.projectService.deleteProject(this.project.id).subscribe(
        () => {
          this.router.navigate(['/projects']);
        },
        () => {
          this.error = 'Erreur lors de la suppression';
          this.loading = false;
        }
      );
    }
  }

  inviteMember(): void {
    if (!this.project || !this.project.id || !this.inviteEmail || !this.inviteRole) return;

    this.projectService
      .addUserToProject(this.project.id, this.inviteEmail, this.inviteRole)
      .subscribe({
        next: () => {
          console.log('Membre invité avec succès');
          this.inviteEmail = '';
          this.inviteRole = 'MEMBRE';
          this.fetchProjectDetails(this.project.id);
        },
        error: () => {
          console.error('Erreur lors de l’invitation');
        }
      });
  }

  changeUserRole(member: any): void {
    this.projectService
      .addUserToProject(this.project.id, member.email, member.userRole)
      .subscribe({
        next: () => {
          console.log(`Rôle mis à jour pour ${member.email}`);
        },
        error: () => {
          console.error(`Erreur lors de la mise à jour du rôle pour ${member.email}`);
        }
      });
  }
}

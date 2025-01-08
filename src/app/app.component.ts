import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true, // Indique que c'est un standalone component
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule], // Ajoute RouterModule ici
})
export class AppComponent {
  title = 'Mon application de project management';
}

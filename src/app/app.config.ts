// src/app/app.config.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';  // Import de tes routes
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes), 
    
  ],
  providers: [
    provideHttpClient()  // Fournit HttpClient sans HttpClientModule
  ],
  exports: [RouterModule],
  bootstrap: [AppComponent]  
})
export class AppConfig {}

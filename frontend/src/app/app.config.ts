import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { routes } from './app.routes'; // Import the routes array

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Provide the routes from app.routes.ts
    importProvidersFrom(HttpClientModule) // Provide HttpClient
    // FormsModule is imported by standalone components that need it.
    // BrowserModule is implicitly handled by bootstrapApplication.
    // CommonModule is imported by standalone components that need its directives/pipes.
  ]
};

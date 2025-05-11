import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // usa a config correta

bootstrapApplication(AppComponent, appConfig); // 👈 esta linha é suficiente

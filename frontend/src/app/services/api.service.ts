import { Injectable } from '@angular/core';
import SwaggerClient from 'swagger-client';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private swaggerUrl = 'http://localhost:3000/api-docs/swagger.json'; // URL do Swagger JSON

  private client: any;

  constructor() {
    SwaggerClient(this.swaggerUrl).then((client: any) => {
      this.client = client;
      console.log('Swagger APIs:', client.apis); // Liste as APIs disponíveis
    });
  }

  async getMenus(): Promise<any> {
    if (!this.client) {
      throw new Error('Swagger client not initialized');
    }
    return this.client.apis.default.getMenus();
  }
}
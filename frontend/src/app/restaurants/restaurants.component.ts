import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule

@Component({
  selector: 'app-restaurants',
  standalone: true, // Indica que é um componente independente
  imports: [CommonModule], // Adicione CommonModule aqui
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css']
})
export class RestaurantsComponent {
  restaurants = [
    {
      id: 1,
      name: 'Restaurante Gourmet',
      description: 'Pratos sofisticados com ingredientes frescos.',
      image: 'assets/images/restaurant1.jpg'
    },
    {
      id: 2,
      name: 'Sabor Caseiro',
      description: 'Comida caseira com gostinho de lar.',
      image: 'assets/images/restaurant2.jpg'
    },
    {
      id: 3,
      name: 'Pizza & Cia',
      description: 'As melhores pizzas da cidade.',
      image: 'assets/images/restaurant3.jpg'
    }
  ];

  viewDetails(id: number): void {
    console.log(`Ver detalhes do restaurante com ID: ${id}`);
  }
}
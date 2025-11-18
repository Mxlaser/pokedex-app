import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss']
})
export class PokemonCardComponent {
  @Input() id!: number;
  @Input() name!: string;
  @Input() image?: string;

  @Input() isFavorite = false;

  @Output() toggleFavorite = new EventEmitter<number>();

  onToggleFav() {
    this.toggleFavorite.emit(this.id);
  }
}

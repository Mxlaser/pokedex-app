import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FavoritesService } from '../../core/services/favorites.service';
import { PokemonService } from '../../core/services/pokemon.service';
import { Favorite } from '../../core/models/favorite';
import { PokemonSummary } from '../../core/models/pokemon-summary.model';
import { AuthService } from '../../core/services/auth.service';
import { PokemonCardComponent } from '../../shared/pokemon-card/pokemon-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, PokemonCardComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  private favoritesService = inject(FavoritesService);
  private pokemonService = inject(PokemonService);
  private authService = inject(AuthService);

  loading = signal(true);
  favs = signal<Favorite[]>([]);
  pokemons = signal<PokemonSummary[]>([]);

  hasFavorites = computed(() => this.favs().length > 0);

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.loading.set(false);
      return;
    }

    this.favoritesService.getByUser(userId).subscribe({
      next: favs => {
        this.favs.set(favs);

        if (favs.length === 0) {
          this.loading.set(false);
          return;
        }

        const favIds = favs.map(f => f.pokemonId);

        this.pokemonService.getFirstGen().subscribe({
          next: all => {
            const list = all.filter(p => favIds.includes(p.id));
            this.pokemons.set(list);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });
  }

  onToggleFavorite(id: number) {
    const fav = this.favs().find(f => f.pokemonId === id);
    if (!fav) return;

    this.favoritesService.remove(fav.id).subscribe({
      next: () => {
        this.favs.set(this.favs().filter(f => f.id !== fav.id));
        this.pokemons.set(this.pokemons().filter(p => p.id !== id));
      }
    });
  }

  isFavorite(_id: number): boolean {
    return true; 
  }
}

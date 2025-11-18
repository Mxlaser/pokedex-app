import { Component, OnDestroy, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap, Subscription } from 'rxjs';
import { PokemonService } from '../../core/services/pokemon.service';
import { PokemonDetail } from '../../core/models/pokemon-detail.model';
import { FavoritesService } from '../../core/services/favorites.service';
import { Favorite } from '../../core/models/favorite';
import { AuthService } from '../../core/services/auth.service'; 

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.scss']
})
export class PokemonDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private pokemonService = inject(PokemonService);
  private favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);

  loading = signal(true);
  error = signal<string | null>(null);
  data = signal<PokemonDetail | null>(null);
  isFavorite = signal(false);

  private sub?: Subscription;

  nameCap = computed(() => {
    const d = this.data();
    return d ? d.name.charAt(0).toUpperCase() + d.name.slice(1) : '';
  });

  ngOnInit(): void {
    this.sub = this.route.paramMap.pipe(
      switchMap(params => {
        this.loading.set(true);
        this.error.set(null);
        const id = Number(params.get('id'));
        if (Number.isNaN(id) || id < 1 || id > 151) {
          this.error.set('Pokémon introuvable (id hors Gen 1).');
          this.loading.set(false);
          throw new Error('invalid-id');
        }

        return this.pokemonService.getById(id);
      })
    ).subscribe({
      next: (detail) => {
        this.data.set(detail);
        this.loading.set(false);
        this.checkIfFavorite(detail.id);
      },
      error: () => {
        this.error.set('Impossible de charger ce Pokémon.');
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private getCurrentUserId(): number | null {
    return this.authService.getCurrentUserId(); 
  }

  private checkIfFavorite(pokemonId: number) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.isFavorite.set(false);
      return;
    }

    this.favoritesService.getByUser(userId).subscribe({
      next: (favs: Favorite[]) => {
        this.isFavorite.set(favs.some(f => f.pokemonId === pokemonId));
      }
    });
  }

  onToggleFavorite() {
    const d = this.data();
    if (!d) return;

    const userId = this.getCurrentUserId();
    if (!userId) {
      alert('Vous devez être connecté pour gérer vos favoris.');
      return;
    }

    this.favoritesService.add(userId, d.id).subscribe({
      next: () => {
        this.isFavorite.set(!this.isFavorite());
      }
    });
  }

  trackByStat = (_: number, s: { base_stat: number; stat: { name: string } }) => s.stat.name;
  trackByType = (_: number, t: { type: { name: string } }) => t.type.name;
}

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PokemonService } from '../../core/services/pokemon.service';
import { PokemonSummary } from '../../core/models/pokemon-summary.model';
import { PokemonCardComponent } from '../../shared/pokemon-card/pokemon-card.component';
import { FavoritesService } from '../../core/services/favorites.service';
import { Favorite } from '../../core/models/favorite';
import { AuthService } from '../../core/services/auth.service';

type SortKey = 'id' | 'name';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PokemonCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pokemonService = inject(PokemonService);
  private favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);

  loading = signal(true);
  all = signal<PokemonSummary[]>([]);
  types = signal<string[]>([]);

  private favoriteIds = signal<Set<number>>(new Set<number>());

  form = this.fb.group({
    name: [''],
    type: [''],
    sort: ['id' as SortKey],
  });

  filtered() {
    const list = this.all();
    const { name, type, sort } = this.form.getRawValue();

    let out = list;

    if (name && name.trim()) {
      const n = name.trim().toLowerCase();
      out = out.filter(p => p.name.toLowerCase().includes(n));
    }

    // (filtre type à implémenter plus tard si tu veux vraiment le brancher)

    out = [...out].sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name)
        : a.id - b.id
    );

    return out;
  };

  ngOnInit(): void {
    this.pokemonService.getFirstGen().subscribe({
      next: list => {
        this.all.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    // Types (pour le select, même si on ne filtre pas encore vraiment dessus)
    this.pokemonService.getTypes().subscribe({
      next: t => this.types.set(t),
    });

    const userId = this.getCurrentUserId();
    if (userId) {
      this.favoritesService.getByUser(userId).subscribe({
        next: (favs: Favorite[]) => {
          const set = new Set<number>(favs.map(f => f.pokemonId));
          this.favoriteIds.set(set);
        }
      });
    }
  }

  private getCurrentUserId(): number | null {
    return this.authService.getCurrentUserId();
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds().has(id);
  }

  onToggleFavorite(id: number) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      alert('Vous devez être connecté pour gérer vos favoris.');
      return;
    }

    this.favoritesService.add(userId, id).subscribe({
      next: () => {
        const set = new Set(this.favoriteIds());
        if (set.has(id)) set.delete(id);
        else set.add(id);
        this.favoriteIds.set(set);
      }
    });
  }
}

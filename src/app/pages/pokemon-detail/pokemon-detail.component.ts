import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap, Subscription } from 'rxjs';
import { PokemonService } from '../../core/services/pokemon.service';
import { PokemonDetail } from '../../core/models/pokemon-detail.model';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.scss']
})
export class PokemonDetailComponent implements OnInit, OnDestroy {
  loading = signal(true);
  error = signal<string | null>(null);
  data = signal<PokemonDetail | null>(null);

  private sub?: Subscription;

  nameCap = computed(() => {
    const d = this.data();
    return d ? d.name.charAt(0).toUpperCase() + d.name.slice(1) : '';
  });

  constructor(
    private route: ActivatedRoute,
    private pokemon: PokemonService
  ) {}

  ngOnInit(): void {
    // id depuis l'URL → fetch détail
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
        return this.pokemon.getById(id);
      })
    ).subscribe({
      next: (detail) => {
        this.data.set(detail);
        this.loading.set(false);
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

  // À brancher Étape 4 (favoris)
  onToggleFavorite() {
    const d = this.data();
    if (!d) return;
    console.log('toggle favorite for', d.id);
  }

  trackByStat = (_: number, s: { base_stat: number; stat: { name: string } }) => s.stat.name;
  trackByType = (_: number, t: { type: { name: string } }) => t.type.name;
}

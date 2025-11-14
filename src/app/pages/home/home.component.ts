import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PokemonService } from '../../core/services/pokemon.service';
import { PokemonSummary } from '../../core/models/pokemon-summary.model';
import { PokemonCardComponent } from '../../shared/pokemon-card/pokemon-card.component';

type SortKey = 'id' | 'name';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PokemonCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // --- signals (état local)
  loading = signal(true);
  all = signal<PokemonSummary[]>([]);
  types = signal<string[]>([]);

  // --- form
  private fb = inject(FormBuilder); // injection moderne Angular 17
  form = this.fb.group({
    name: [''],
    type: [''],
    sort: ['id' as SortKey],
  });

  // --- vue filtrée
  filtered = computed(() => {
    const list = this.all();
    const { name, type, sort } = this.form.getRawValue();

    let out = list;

    // filtre nom (contient)
    if (name?.trim()) {
      const n = name.trim().toLowerCase();
      out = out.filter(p => p.name.toLowerCase().includes(n));
    }

    // (filtrage par type ajouté plus tard)
    out = [...out].sort((a, b) => sort === 'name'
      ? a.name.localeCompare(b.name)
      : a.id - b.id);

    return out;
  });

  // --- services
  private pokemon = inject(PokemonService);

  ngOnInit(): void {
    // charge la liste Gen 1
    this.pokemon.getFirstGen().subscribe({
      next: list => {
        this.all.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    // charge les types pour le filtre
    this.pokemon.getTypes().subscribe({
      next: t => this.types.set(t),
    });
  }

  onToggleFavorite(id: number) {
    // sera branché à l’étape 4
    console.log('toggle favorite', id);
  }
}

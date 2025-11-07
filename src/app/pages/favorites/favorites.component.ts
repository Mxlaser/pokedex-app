import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../core/services/favorites.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Mes favoris</h1>
    <div *ngIf="!user">Connectez-vous</div>
    <ul *ngIf="user">
      <li *ngFor="let f of favorites">
        Pokémon #{{ f.pokemonId }}
        <button (click)="remove(f.id)">Retirer</button>
      </li>
    </ul>

    <hr>
    <p>Test rapide : ajouter un ID</p>
    <input type="number" [(ngModel)]="tmpId" />
    <button (click)="toggle(tmpId)">Ajouter/Retirer</button>
  `
})
export class FavoritesComponent {
  favSrv = inject(FavoritesService);
  auth = inject(AuthService);

  user = this.auth.currentUser;
  favorites: any[] = [];
  tmpId = 1;

  ngOnInit() { this.refresh(); }

  refresh() {
    if (!this.user) return;
    this.favSrv.getByUser(this.user.id).subscribe(f => this.favorites = f);
  }

  toggle(id: number) {
    if (!this.user) return;
    this.favSrv.add(this.user.id, id).subscribe(() => this.refresh());
  }
  remove(id: number) { this.favSrv.remove(id).subscribe(() => this.refresh()); }
}

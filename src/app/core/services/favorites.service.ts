import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Favorite } from '../models/favorite';
import { Observable, switchMap } from 'rxjs';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private http = inject(HttpClient);

  getByUser(userId: number): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${API}/favorites`, { params: { userId } as any });
  }

  add(userId: number, pokemonId: number) {
    return this.http.get<Favorite[]>(`${API}/favorites`, { params: { userId, pokemonId } as any })
      .pipe(switchMap(list => list.length
        ? this.http.delete(`${API}/favorites/${list[0].id}`)
        : this.http.post<Favorite>(`${API}/favorites`, { userId, pokemonId })));
  }

  remove(favoriteId: number) {
    return this.http.delete(`${API}/favorites/${favoriteId}`);
  }
}

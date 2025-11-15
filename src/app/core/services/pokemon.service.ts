import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PokemonSummary } from '../models/pokemon-summary.model';
import { PokemonDetail } from '../models/pokemon-detail.model';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly base = environment.apiPokeBase;

  constructor(private http: HttpClient) {}

  getFirstGen(): Observable<PokemonSummary[]> {
    const url = `${this.base}/pokemon?limit=151&offset=0`;
    return this.http.get<{ results: { name: string; url: string }[] }>(url).pipe(
      map(res =>
        res.results.map(r => ({
          id: this.extractIdFromUrl(r.url),
          name: r.name,
        }))
      )
    );
  }

  getById(id: number): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${this.base}/pokemon/${id}`);
  }

  getTypes(): Observable<string[]> {
    return this.http.get<{ results: { name: string }[] }>(`${this.base}/type`).pipe(
      map(res =>
        res.results
          .map(t => t.name)
          .filter(n => !['shadow', 'unknown'].includes(n))
      )
    );
  }

  private extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, forkJoin, mergeMap } from 'rxjs';
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
      mergeMap(res => {
        const details$ = res.results.map(r =>
          this.getById(this.extractIdFromUrl(r.url)).pipe(
            map(detail => ({
              id: detail.id,
              name: detail.name,
              types: detail.types.map(t => t.type.name), 
            } as PokemonSummary)) 
          )
        );
        return forkJoin(details$);
      })
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

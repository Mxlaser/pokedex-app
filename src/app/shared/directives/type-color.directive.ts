import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appTypeColor]',
  standalone: true
})
export class TypeColorDirective implements OnInit {
  @Input('appTypeColor') type!: string;

  private typeColors: { [key: string]: string } = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    steel: '#B7B7CE',
    fairy: '#D685AD',
    dark: '#705746',
  };

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const color = this.typeColors[this.type.toLowerCase()] || '#68A090';
    this.el.nativeElement.style.backgroundColor = color;
    this.el.nativeElement.style.color = ['normal', 'electric', 'ice', 'fairy', 'bug', 'grass'].includes(this.type.toLowerCase()) ? '#1f2933' : '#FFFFFF';
  }
}
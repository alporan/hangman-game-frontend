import { Component, OnInit  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Genre } from './genre.model';
import { Era } from './era.model';
import { Movie } from './movie.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'hangman-game-frontend';
  letters = [{disabled: false, value: 'A'}, {disabled: false, value: 'B'}, {disabled: false, value: 'C'}, {disabled: false, value: 'D'},
             {disabled: false, value: 'E'}, {disabled: false, value: 'F'}, {disabled: false, value: 'G'}, {disabled: false, value: 'H'},
             {disabled: false, value: 'I'}, {disabled: false, value: 'J'}, {disabled: false, value: 'K'}, {disabled: false, value: 'L'},
             {disabled: false, value: 'M'}, {disabled: false, value: 'N'}, {disabled: false, value: 'O'}, {disabled: false, value: 'P'},
             {disabled: false, value: 'Q'}, {disabled: false, value: 'R'}, {disabled: false, value: 'S'}, {disabled: false, value: 'T'},
             {disabled: false, value: 'U'}, {disabled: false, value: 'V'}, {disabled: false, value: 'W'}, {disabled: false, value: 'X'},
             {disabled: false, value: 'Y'}, {disabled: false, value: 'Z'},
];

  displayGame = false;
  genres: Genre[] = [];
  eras: Era[] = [{ value: 0, name: 'Random'}];
  movie: Movie;
  movieUrl: string;
  selectedGenre: Genre;
  selectedEra: Era;

  numberOfFaults: number = 0;
  hiddenMovieTitle: string;
  isWon = false;
  isLost = false;
  letterFound = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getGenres();

    for (let i = 1960; i <= new Date().getFullYear(); i = i + 10) {
      this.eras.push({value: i, name: i + 's'});
    }
  }

  private getGenres() {
    this.http
      .get<{ [key: string]: Genre }>('http://localhost:8080/genre')
      .pipe(
        map(responseData => {
          const genreArray: Genre[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              genreArray.push({ ...responseData[key]});
            }
          }
          return genreArray;
        })
      )
      .subscribe(x => {
        this.genres = [{ id: 0, name: 'Random'}];

        x.forEach(element => { this.genres.push(element)});
      });
  }

  private getMovie() {
    if (this.selectedGenre.id !== 0 && this.selectedEra.value !== 0) {
      this.movieUrl = 'http://localhost:8080/movie?genre=' + this.selectedGenre.id + '&year=' + this.selectedEra.value;
    }else if (this.selectedGenre.id !== 0) {
      this.movieUrl = 'http://localhost:8080/movie?genre=' + this.selectedGenre.id;
    }else if (this.selectedEra.value !== 0) {
      this.movieUrl = 'http://localhost:8080/movie?year=' + this.selectedEra.value;
    }else {
      this.movieUrl = 'http://localhost:8080/movie';
    }
    this.http.get(this.movieUrl)
      .subscribe((data: Movie) => {
        this.movie = { id: data.id,
                      title: data.title,
                      release_date: data.release_date };

        this.hiddenMovieTitle = '';
        for (let i = 0; i < this.movie.title.length; i++) {
          if ( this.movie.title[i] === ' ' ){
            this.hiddenMovieTitle = this.hiddenMovieTitle + '\xa0\xa0';
          } else if ( this.isLetter(this.movie.title[i]) ) {
            this.hiddenMovieTitle = this.hiddenMovieTitle + ' _' ;
          } else {
            this.hiddenMovieTitle = this.hiddenMovieTitle + ' ' + this.movie.title[i];
          }
        }
      });
  }

  onStart(){
    this.resetStates();
    this.displayGame = true;
    this.getMovie();
  }

  onClickLetter(letter: string){

    for (const lett of this.letters) {
      if (letter.toUpperCase() === lett.value) {
        lett.disabled = true;
      }
    }

    this.letterFound = false;
    for (let i = 0; i < this.movie.title.length; i++) {
      if ( this.movie.title[i].toUpperCase() === letter ){
        this.hiddenMovieTitle = this.hiddenMovieTitle.substring(0, (i+1)*2-1) + letter
                                + this.hiddenMovieTitle.substring((i+1)*2, this.movie.title.length*2);
        this.letterFound = true;
      }
    }

    if (!this.letterFound){
      this.numberOfFaults++;
      if (this.numberOfFaults === 9){
        this.isLost = true;
        this.hiddenMovieTitle = '';
        for (let i = 0; i < this.movie.title.length; i++) {
          if ( this.movie.title[i] === ' ' ){
            this.hiddenMovieTitle = this.hiddenMovieTitle + '\xa0\xa0';
          } else {
            this.hiddenMovieTitle = this.hiddenMovieTitle + ' ' + this.movie.title[i];
          }
        }
      }
    } else {
      if ( !this.hiddenMovieTitle.includes('_')) {
        this.isWon = true;
      }
    }
  }

  isLetter(character: string): boolean {
    for (const letter of this.letters) {
      if (character.toUpperCase() === letter.value) {
        return true;
      }
    }
    return false;
  }

  resetStates(): void{
    this.isLost = false;
    this.isWon = false;
    this.numberOfFaults = 0;

    for (const letter of this.letters) {
        letter.disabled = false;
    }
  }
}

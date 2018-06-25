import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ElementRef
} from '@angular/core';

// By importing just the rxjs operators we need, We're theoretically able
// to reduce our build size vs. importing all of them.
import { Observable, Subject, Subscription } from 'rxjs';
import { fromEvent, of } from 'rxjs';
import { switchMap, map, filter, debounceTime, tap, switchAll } from 'rxjs/operators';

import { YouTubeSearchService } from './you-tube-search.service';
import { SearchResult } from './search-result.model';

@Component({
  selector: 'app-search-box',
  template: `
    <input type="text" class="form-control" placeholder="Search" autofocus>
  `
})
export class SearchBoxComponent implements OnInit {
  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() results: EventEmitter<SearchResult[]> = new EventEmitter<SearchResult[]>();

  constructor(private youtube: YouTubeSearchService,
    private el: ElementRef) {
  }

  ngOnInit(): void {
    // convert the `keyup` event into an observable stream
    const obs = fromEvent(this.el.nativeElement, 'keyup')
      .pipe(
      map((e: any) => e.target.value), // extract the value of the input

      // filter((text:string) => text.length > 1), //filter out if empty

      debounceTime(250), //only search after 250 ms

      tap(() => this.loading.emit(true)), // Enable loading
      // search, call the search service

      map((query: string) => this.youtube.search(query)),
      // discard old events if new input comes in

      switchAll()
      // act on the return of the search
      )
      // act on the return of the search
      .subscribe(
      (results: SearchResult[]) => { // on sucesss
        this.loading.emit(false);
        this.results.emit(results);
      },
      (err: any) => { // on error
        console.log(err);
        this.loading.emit(false);
      },
      () => { // on completion
        this.loading.emit(false);
      }
      );
  }
}

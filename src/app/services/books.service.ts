import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { delay, Observable, of } from "rxjs";
import { Book } from "../models/book.model";


@Injectable({
  providedIn: 'root'
})
export class BooksService {
    private booksUrl = 'assets/data/books.json';
    private httpClient = inject(HttpClient);

    getAllBooks(): Observable<Book[]> {
        return this.httpClient.get<Book[]>(this.booksUrl).pipe(delay(500));
    }

    updateBook(book: Book): Observable<Book> {
        return of(book).pipe(delay(500));
    }

    addBook(book: Book): Observable<Book> {
        return of(book).pipe(delay(500));
    }

    deleteBook(id: number): Observable<number> {
        return of(id).pipe(delay(500));
    }
}
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { Book } from "../models/book.model";
import { computed, inject } from "@angular/core";
import { BooksService } from "../services/books.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";

type BooksState = {
    books: Book[];
    isLoadingBooks: boolean;
    hasErrorOnLoadingBooks: boolean;
    isLoadingAction: boolean;
    hasErrorOnDispatchBookAction: boolean
}

const initialState: BooksState = {
    books: [],
    isLoadingBooks: false,
    hasErrorOnLoadingBooks: false,
    isLoadingAction: false,
    hasErrorOnDispatchBookAction: false
}

export const BooksStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withComputed((store) => ({
        getBookById: computed(() => (id: number) => store.books().find(b => b.id === id))
    })),
    withMethods((store, booksService = inject(BooksService)) => {
        return {
            loadAllBooks: rxMethod<void>(
                pipe(
                    tap(() => patchState(store, { isLoadingBooks: true, hasErrorOnLoadingBooks: false })),
                    switchMap(() => booksService.getAllBooks().pipe(
                        tapResponse({
                            next: (books) => patchState(store, {
                                books,
                                isLoadingBooks: false,
                                hasErrorOnLoadingBooks: false
                            }),
                            error: () => patchState(store, {
                                isLoadingBooks: false,
                                hasErrorOnLoadingBooks: true
                            })
                        })
                    ))
                )
            ),
            addBook: rxMethod<Book>(
                pipe(
                    tap(() => patchState(store, { isLoadingAction: true, hasErrorOnDispatchBookAction: false })),
                    switchMap((book) => booksService.addBook(book).pipe(
                        tapResponse({
                            next: (addedBook) => patchState(store, {
                                books: [...store.books(), addedBook],
                                isLoadingAction: false,
                                hasErrorOnDispatchBookAction: false
                            }),
                            error: () => patchState(store, {
                                isLoadingAction: false,
                                hasErrorOnDispatchBookAction: true
                            })
                        })
                    ))
                )
            ),
            updateBook: rxMethod<Book>(
                pipe(
                    tap(() => patchState(store, { isLoadingAction: true, hasErrorOnDispatchBookAction: false })),
                    switchMap((book) => booksService.updateBook(book).pipe(
                        tapResponse({
                            next: (updatedBook) => patchState(store, {
                                books: store.books().map(b => b.id === updatedBook.id ? updatedBook : b),
                                isLoadingAction: false,
                                hasErrorOnDispatchBookAction: false
                            }),
                            error: () => patchState(store, {
                                isLoadingAction: false,
                                hasErrorOnDispatchBookAction: true
                            })
                        })
                    ))
                )
            ),
            deleteBook: rxMethod<number>(
                pipe(
                    tap(() => patchState(store, { isLoadingAction: true, hasErrorOnDispatchBookAction: false })),
                    switchMap((id) => booksService.deleteBook(id).pipe(
                        tapResponse({
                            next: (deletedId) => patchState(store, {
                                books: store.books().filter(book => book.id !== deletedId),
                                isLoadingAction: false,
                                hasErrorOnDispatchBookAction: false
                            }),
                            error: () => patchState(store, {
                                isLoadingAction: false,
                                hasErrorOnDispatchBookAction: true
                            })
                        })
                    ))
                )
            )
        };
    })
);



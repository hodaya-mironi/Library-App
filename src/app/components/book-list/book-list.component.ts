import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { BooksStore } from '../../store/books.store';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BookRow } from '../book-row/book-row.component';
import { NavigationService } from '../../services/navigation.service';

export type SortOption = 'author' | 'publicationDate' | 'catalogNumber' | 'none';
export type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-book-list',
  imports: [ScrollingModule, BookRow],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
})
export class BookList implements OnInit {
  readonly booksStore = inject(BooksStore);
  private navigationService = inject(NavigationService);
  readonly sortBy = signal<SortOption>('none');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly searchQuery = signal<string>('');

  readonly sortedBooks = computed(() => {
    let books = this.booksStore.books();
    const sortOption = this.sortBy();
    const direction = this.sortDirection();
    const query = this.searchQuery().toLowerCase().trim();

    // Filter by search query
    if (query) {
      books = books.filter(book =>
        book.title.toLowerCase().includes(query)
      );
    }

    // Sort if needed
    if (sortOption === 'none') {
      return books;
    }

    const sorted = [...books].sort((a, b) => {
      let comparison = 0;

      switch (sortOption) {
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'publicationDate':
          comparison = new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime();
          break;
        case 'catalogNumber':
          comparison = a.id - b.id;
          break;
        default:
          comparison = 0;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  });

  ngOnInit() {
    // Only load books if the store is empty
    if (this.booksStore.books().length === 0) {
      this.booksStore.loadAllBooks();
    }
  }

  onSortChange(sortOption: SortOption) {
    this.sortBy.set(sortOption);
  }

  toggleSortDirection() {
    this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  onAvailabilityToggled(bookId: number) {
    const book = this.booksStore.books().find(b => b.id === bookId);
    if (book) {
      const updatedBook = {
        ...book,
        isAvailable: !book.isAvailable
      };
      this.booksStore.updateBook(updatedBook);
    }
  }

  onBookClicked(bookId: number) {
    this.navigationService.navigateToBookDetails(bookId);
  }

  onEditBookClicked(bookId: number) {
    this.navigationService.navigateToEditBook(bookId);
  }

  onDeleteBookClicked(bookId: number) {
    const book = this.booksStore.books().find(b => b.id === bookId);
    if (book) {
      const confirmed = confirm(`Are you sure you want to delete "${book.title}"?`);
      if (confirmed) {
        this.booksStore.deleteBook(bookId);
      }
    }
  }

  onAddBook() {
    this.navigationService.navigateToAddBook();
  }
}

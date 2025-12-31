import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BooksStore } from '../../store/books.store';
import { Book } from '../../models/book.model';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-book-details',
  imports: [CommonModule],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.scss',
})
export class BookDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private navigationService = inject(NavigationService);
  private booksStore = inject(BooksStore);

  book = signal<Book | undefined>(undefined);
  isLoading = signal(true);

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');

    if (!bookId) {
      this.navigationService.navigateToBooks();
      this.isLoading.set(false);
      return;
    }

    // Only load books if not already loaded
    if (this.booksStore.books().length === 0) {
      this.booksStore.loadAllBooks();
    }

    const foundBook = this.booksStore.books().find(b => b.id === Number(bookId));
    this.book.set(foundBook);
    this.isLoading.set(false);
  }

  goBack() {
    this.navigationService.goBack();
  }
}

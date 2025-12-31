import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private router = inject(Router);

  navigateToBooks() {
    this.router.navigate(['/books']);
  }

  navigateToBookDetails(bookId: number | string | null): void {
    if (!bookId || bookId === '' || (typeof bookId === 'string' && isNaN(Number(bookId)))) {
      this.navigateToBooks();
      return;
    }

    const id = typeof bookId === 'string' ? Number(bookId) : bookId;
    this.router.navigate(['/books', id]);
  }

  navigateToAddBook(): void {
    this.router.navigate(['/books/add']);
  }

  navigateToEditBook(bookId: number | string): void {
    const id = typeof bookId === 'string' ? Number(bookId) : bookId;
    this.router.navigate(['/books/edit', id]);
  }

  goBack() {
    this.navigateToBooks();
  }
}

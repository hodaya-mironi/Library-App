import { Component, inject, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BooksStore } from '../../store/books.store';
import { Book } from '../../models/book.model';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-book-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.scss',
})
export class BookForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private navigationService = inject(NavigationService);
  protected booksStore = inject(BooksStore);

  bookForm!: FormGroup;
  isEditMode = false;
  bookId: number | null = null;
  private wasLoading = false;

  constructor() {
    effect(() => {
      const isLoading = this.booksStore.isLoadingAction();

      // Track when loading starts
      if (isLoading) {
        this.wasLoading = true;
      }

      // When loading finishes after it was loading, navigate
      if (this.wasLoading && !isLoading) {
        this.wasLoading = false;
        this.navigationService.navigateToBooks();
      }
    });

    // Effect to load book data when books are loaded (for edit mode)
    effect(() => {
      const books = this.booksStore.books();
      if (this.isEditMode && this.bookId !== null && books.length > 0) {
        this.loadBookData(this.bookId);
      }
    });
  }

  ngOnInit() {
    this.initializeForm();

    // Load books if not already loaded (needed for edit mode on page refresh)
    if (this.booksStore.books().length === 0) {
      this.booksStore.loadAllBooks();
    }

    this.checkEditMode();
  }

  private initializeForm() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      author: ['', [Validators.required, Validators.maxLength(100)]],
      isbn: ['', [Validators.required, Validators.pattern(/^(?:\d{9}[\dXx]|(?:\d{3}-?)?\d{1,5}-?\d{1,7}-?\d{1,7}-?[\dXx])$/)]],
      publicationDate: ['', [Validators.required]],
      genre: ['', [Validators.required, Validators.maxLength(50)]],
      pages: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      rating: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
      isAvailable: [true, [Validators.required]],
      description: ['', [Validators.maxLength(1000)]],
      publisher: ['', [Validators.maxLength(100)]],
      language: ['', [Validators.maxLength(50)]],
      location: ['', [Validators.maxLength(100)]]
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.bookId = +id;
      this.loadBookData(this.bookId);
    }
  }

  private loadBookData(id: number) {
    const book = this.booksStore.getBookById()(id);
    if (book) {
      this.bookForm.patchValue(book);
    }
  }

  onSubmit() {
    if (this.bookForm.valid) {
      const formValue = this.bookForm.value;

      if (this.isEditMode && this.bookId !== null) {
        const updatedBook: Book = {
          id: this.bookId,
          ...formValue
        };
        this.booksStore.updateBook(updatedBook);
      } else {
        const newBook: Book = {
          id: this.generateNewId(),
          ...formValue
        };
        this.booksStore.addBook(newBook);
      }
    } else {
      this.markFormGroupTouched(this.bookForm);
    }
  }

  private generateNewId(): number {
    const books = this.booksStore.books();
    if (books.length === 0) return 1;
    return Math.max(...books.map(b => b.id)) + 1;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    this.navigationService.navigateToBooks();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.bookForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} is too short`;
    }
    if (control?.hasError('maxlength')) {
      return `${this.getFieldLabel(fieldName)} is too long`;
    }
    if (control?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('max')) {
      return `${this.getFieldLabel(fieldName)} must be at most ${control.errors?.['max'].max}`;
    }
    if (control?.hasError('pattern')) {
      return `${this.getFieldLabel(fieldName)} must be a valid ISBN (e.g., 978-1-4000-6885-7 or 0-306-40615-2)`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      author: 'Author',
      isbn: 'ISBN',
      publicationDate: 'Publication Date',
      genre: 'Genre',
      pages: 'Pages',
      rating: 'Rating',
      isAvailable: 'Availability',
      description: 'Description',
      publisher: 'Publisher',
      language: 'Language',
      location: 'Location'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.bookForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

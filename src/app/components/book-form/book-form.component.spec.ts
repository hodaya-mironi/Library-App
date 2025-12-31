import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { BookForm } from './book-form.component';
import { BooksStore } from '../../store/books.store';
import { NavigationService } from '../../services/navigation.service';
import { Book } from '../../models/book.model';

describe('BookForm', () => {
  let component: BookForm;
  let fixture: ComponentFixture<BookForm>;
  let mockBooksStore: any;
  let mockNavigation: jasmine.SpyObj<NavigationService>;
  let mockActivatedRoute: any;

  const mockBook: Book = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    isbn: '978-1-4000-6885-7',
    publicationDate: '2023-01-01',
    genre: 'Fiction',
    pages: 300,
    rating: 4.5,
    isAvailable: true,
    description: 'Test description',
    publisher: 'Test Publisher',
    language: 'English',
    location: 'Shelf A1'
  };

  beforeEach(async () => {
    mockBooksStore = {
      books: signal([mockBook]),
      isLoadingBooks: signal(false),
      hasErrorOnLoadingBooks: signal(false),
      isLoadingAction: signal(false),
      hasErrorOnDispatchBookAction: signal(false),
      loadAllBooks: jasmine.createSpy('loadAllBooks'),
      addBook: jasmine.createSpy('addBook'),
      updateBook: jasmine.createSpy('updateBook'),
      getBookById: jasmine.createSpy('getBookById').and.returnValue((id: number) => {
        return mockBooksStore.books().find((book: Book) => book.id === id);
      })
    };

    mockNavigation = jasmine.createSpyObj('Navigation', ['navigateToBooks']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [BookForm],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BooksStore, useValue: mockBooksStore },
        { provide: NavigationService, useValue: mockNavigation },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form initialization', () => {
    it('should initialize form with empty values in add mode', () => {
      expect(component.bookForm).toBeDefined();
      expect(component.bookForm.get('title')?.value).toBe('');
      expect(component.bookForm.get('author')?.value).toBe('');
      expect(component.isEditMode).toBe(false);
    });

    it('should have all required form controls', () => {
      expect(component.bookForm.get('title')).toBeDefined();
      expect(component.bookForm.get('author')).toBeDefined();
      expect(component.bookForm.get('isbn')).toBeDefined();
      expect(component.bookForm.get('publicationDate')).toBeDefined();
      expect(component.bookForm.get('genre')).toBeDefined();
      expect(component.bookForm.get('pages')).toBeDefined();
      expect(component.bookForm.get('rating')).toBeDefined();
      expect(component.bookForm.get('isAvailable')).toBeDefined();
      expect(component.bookForm.get('description')).toBeDefined();
      expect(component.bookForm.get('publisher')).toBeDefined();
      expect(component.bookForm.get('language')).toBeDefined();
      expect(component.bookForm.get('location')).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should load books if store is empty', () => {
      mockBooksStore.books.set([]);
      component.ngOnInit();
      expect(mockBooksStore.loadAllBooks).toHaveBeenCalled();
    });

    it('should not load books if store has books', () => {
      component.ngOnInit();
      expect(mockBooksStore.loadAllBooks).not.toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
      fixture = TestBed.createComponent(BookForm);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set isEditMode to true when id is in route', () => {
      expect(component.isEditMode).toBe(true);
      expect(component.bookId).toBe(1);
    });

    it('should populate form with book data', () => {
      expect(component.bookForm.get('title')?.value).toBe('Test Book');
      expect(component.bookForm.get('author')?.value).toBe('Test Author');
      expect(component.bookForm.get('isbn')?.value).toBe('978-1-4000-6885-7');
      expect(component.bookForm.get('publicationDate')?.value).toBe('2023-01-01');
      expect(component.bookForm.get('genre')?.value).toBe('Fiction');
      expect(component.bookForm.get('pages')?.value).toBe(300);
      expect(component.bookForm.get('rating')?.value).toBe(4.5);
      expect(component.bookForm.get('isAvailable')?.value).toBe(true);
    });
  });

  describe('form validation', () => {
    it('should require title', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setValue('');
      expect(titleControl?.hasError('required')).toBe(true);
    });

    it('should require author', () => {
      const authorControl = component.bookForm.get('author');
      authorControl?.setValue('');
      expect(authorControl?.hasError('required')).toBe(true);
    });

    it('should validate ISBN pattern', () => {
      const isbnControl = component.bookForm.get('isbn');
      isbnControl?.setValue('invalid-isbn');
      expect(isbnControl?.hasError('pattern')).toBe(true);

      isbnControl?.setValue('978-1-4000-6885-7');
      expect(isbnControl?.hasError('pattern')).toBe(false);
    });

    it('should validate pages minimum', () => {
      const pagesControl = component.bookForm.get('pages');
      pagesControl?.setValue(0);
      expect(pagesControl?.hasError('min')).toBe(true);

      pagesControl?.setValue(1);
      expect(pagesControl?.hasError('min')).toBe(false);
    });

    it('should validate pages maximum', () => {
      const pagesControl = component.bookForm.get('pages');
      pagesControl?.setValue(10001);
      expect(pagesControl?.hasError('max')).toBe(true);

      pagesControl?.setValue(10000);
      expect(pagesControl?.hasError('max')).toBe(false);
    });

    it('should validate rating minimum', () => {
      const ratingControl = component.bookForm.get('rating');
      ratingControl?.setValue(-1);
      expect(ratingControl?.hasError('min')).toBe(true);

      ratingControl?.setValue(0);
      expect(ratingControl?.hasError('min')).toBe(false);
    });

    it('should validate rating maximum', () => {
      const ratingControl = component.bookForm.get('rating');
      ratingControl?.setValue(6);
      expect(ratingControl?.hasError('max')).toBe(true);

      ratingControl?.setValue(5);
      expect(ratingControl?.hasError('max')).toBe(false);
    });

    it('should validate title max length', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setValue('a'.repeat(201));
      expect(titleControl?.hasError('maxlength')).toBe(true);

      titleControl?.setValue('a'.repeat(200));
      expect(titleControl?.hasError('maxlength')).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should add new book when form is valid in add mode', () => {
      component.isEditMode = false;
      component.bookForm.patchValue({
        title: 'New Book',
        author: 'New Author',
        isbn: '978-1-4000-6885-8',
        publicationDate: '2024-01-01',
        genre: 'Science',
        pages: 250,
        rating: 4.0,
        isAvailable: true,
        description: 'New description',
        publisher: 'New Publisher',
        language: 'English',
        location: 'Shelf B1'
      });

      component.onSubmit();

      expect(mockBooksStore.addBook).toHaveBeenCalled();
      const addedBook = mockBooksStore.addBook.calls.mostRecent().args[0];
      expect(addedBook.title).toBe('New Book');
      expect(addedBook.id).toBe(2);
    });

    it('should update book when form is valid in edit mode', () => {
      component.isEditMode = true;
      component.bookId = 1;
      component.bookForm.patchValue({
        title: 'Updated Book',
        author: 'Updated Author',
        isbn: '978-1-4000-6885-7',
        publicationDate: '2023-01-01',
        genre: 'Fiction',
        pages: 300,
        rating: 4.5,
        isAvailable: true
      });

      component.onSubmit();

      expect(mockBooksStore.updateBook).toHaveBeenCalled();
      const updatedBook = mockBooksStore.updateBook.calls.mostRecent().args[0];
      expect(updatedBook.id).toBe(1);
      expect(updatedBook.title).toBe('Updated Book');
    });

    it('should not submit when form is invalid', () => {
      component.bookForm.patchValue({
        title: '',
        author: ''
      });

      component.onSubmit();

      expect(mockBooksStore.addBook).not.toHaveBeenCalled();
      expect(mockBooksStore.updateBook).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when form is invalid', () => {
      component.bookForm.patchValue({
        title: '',
        author: ''
      });

      component.onSubmit();

      expect(component.bookForm.get('title')?.touched).toBe(true);
      expect(component.bookForm.get('author')?.touched).toBe(true);
    });
  });

  describe('onCancel', () => {
    it('should navigate to books list', () => {
      component.onCancel();
      expect(mockNavigation.navigateToBooks).toHaveBeenCalled();
    });
  });

  describe('getErrorMessage', () => {
    it('should return required error message', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();
      const errorMessage = component.getErrorMessage('title');
      expect(errorMessage).toBe('Title is required');
    });

    it('should return minlength error message', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setValue('');
      titleControl?.setErrors({ minlength: { requiredLength: 1, actualLength: 0 } });
      const errorMessage = component.getErrorMessage('title');
      expect(errorMessage).toBe('Title is too short');
    });

    it('should return maxlength error message', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setErrors({ maxlength: { requiredLength: 200, actualLength: 201 } });
      const errorMessage = component.getErrorMessage('title');
      expect(errorMessage).toBe('Title is too long');
    });

    it('should return min error message', () => {
      const pagesControl = component.bookForm.get('pages');
      pagesControl?.setValue(0);
      const errorMessage = component.getErrorMessage('pages');
      expect(errorMessage).toBe('Pages must be at least 1');
    });

    it('should return max error message', () => {
      const pagesControl = component.bookForm.get('pages');
      pagesControl?.setValue(10001);
      const errorMessage = component.getErrorMessage('pages');
      expect(errorMessage).toBe('Pages must be at most 10000');
    });

    it('should return pattern error message for ISBN', () => {
      const isbnControl = component.bookForm.get('isbn');
      isbnControl?.setValue('invalid');
      const errorMessage = component.getErrorMessage('isbn');
      expect(errorMessage).toContain('valid ISBN');
    });
  });

  describe('isFieldInvalid', () => {
    it('should return true when field is invalid and touched', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();
      expect(component.isFieldInvalid('title')).toBe(true);
    });

    it('should return true when field is invalid and dirty', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsDirty();
      expect(component.isFieldInvalid('title')).toBe(true);
    });

    it('should return false when field is valid', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setValue('Valid Title');
      titleControl?.markAsTouched();
      expect(component.isFieldInvalid('title')).toBe(false);
    });

    it('should return false when field is invalid but not touched or dirty', () => {
      const titleControl = component.bookForm.get('title');
      titleControl?.setValue('');
      expect(component.isFieldInvalid('title')).toBe(false);
    });
  });

  describe('generateNewId', () => {
    it('should return 1 when no books exist', () => {
      mockBooksStore.books.set([]);
      const newId = component['generateNewId']();
      expect(newId).toBe(1);
    });

    it('should return max id + 1 when books exist', () => {
      const books: Book[] = [
        { ...mockBook, id: 5 },
        { ...mockBook, id: 3 },
        { ...mockBook, id: 7 }
      ];
      mockBooksStore.books.set(books);
      const newId = component['generateNewId']();
      expect(newId).toBe(8);
    });
  });
});

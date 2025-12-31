import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { BookList } from './book-list.component';
import { BooksStore } from '../../store/books.store';
import { NavigationService } from '../../services/navigation.service';
import { Book } from '../../models/book.model';

describe('BookList', () => {
  let component: BookList;
  let fixture: ComponentFixture<BookList>;
  let mockBooksStore: any;
  let mockNavigation: jasmine.SpyObj<NavigationService>;

  const mockBooks: Book[] = [
    {
      id: 1,
      title: 'Test Book A',
      author: 'Author A',
      isbn: '978-1-4000-6885-7',
      publicationDate: '2023-01-01',
      genre: 'Fiction',
      pages: 300,
      rating: 4.5,
      isAvailable: true,
      description: 'Test description',
      publisher: 'Publisher A',
      language: 'English',
      location: 'Shelf A1'
    },
    {
      id: 2,
      title: 'Test Book B',
      author: 'Author B',
      isbn: '978-1-4000-6885-8',
      publicationDate: '2022-06-15',
      genre: 'Non-Fiction',
      pages: 250,
      rating: 4.0,
      isAvailable: false,
      description: 'Another test description',
      publisher: 'Publisher B',
      language: 'English',
      location: 'Shelf B2'
    }
  ];

  beforeEach(async () => {
    mockBooksStore = {
      books: signal([...mockBooks]),
      isLoadingBooks: signal(false),
      hasErrorOnLoadingBooks: signal(false),
      loadAllBooks: jasmine.createSpy('loadAllBooks'),
      updateBook: jasmine.createSpy('updateBook'),
      deleteBook: jasmine.createSpy('deleteBook')
    };

    mockNavigation = jasmine.createSpyObj('Navigation', [
      'navigateToBookDetails',
      'navigateToEditBook',
      'navigateToAddBook'
    ]);

    await TestBed.configureTestingModule({
      imports: [BookList],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BooksStore, useValue: mockBooksStore },
        { provide: NavigationService, useValue: mockNavigation }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load books if store is empty', () => {
      mockBooksStore.books.set([]);
      fixture.detectChanges();
      expect(mockBooksStore.loadAllBooks).toHaveBeenCalled();
    });

    it('should not load books if store already has books', () => {
      fixture.detectChanges();
      expect(mockBooksStore.loadAllBooks).not.toHaveBeenCalled();
    });
  });

  describe('sorting', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should sort by author ascending', () => {
      component.onSortChange('author');
      component.sortDirection.set('asc');
      const sorted = component.sortedBooks();
      expect(sorted[0].author).toBe('Author A');
      expect(sorted[1].author).toBe('Author B');
    });

    it('should sort by author descending', () => {
      component.onSortChange('author');
      component.sortDirection.set('desc');
      const sorted = component.sortedBooks();
      expect(sorted[0].author).toBe('Author B');
      expect(sorted[1].author).toBe('Author A');
    });

    it('should sort by publication date ascending', () => {
      component.onSortChange('publicationDate');
      component.sortDirection.set('asc');
      const sorted = component.sortedBooks();
      expect(sorted[0].publicationDate).toBe('2022-06-15');
      expect(sorted[1].publicationDate).toBe('2023-01-01');
    });

    it('should sort by catalog number (id)', () => {
      component.onSortChange('catalogNumber');
      component.sortDirection.set('asc');
      const sorted = component.sortedBooks();
      expect(sorted[0].id).toBe(1);
      expect(sorted[1].id).toBe(2);
    });

    it('should not sort when sortBy is none', () => {
      component.onSortChange('none');
      const sorted = component.sortedBooks();
      expect(sorted).toEqual(mockBooks);
    });

    it('should toggle sort direction', () => {
      expect(component.sortDirection()).toBe('asc');
      component.toggleSortDirection();
      expect(component.sortDirection()).toBe('desc');
      component.toggleSortDirection();
      expect(component.sortDirection()).toBe('asc');
    });
  });

  describe('searching', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter books by title search query', () => {
      component.onSearchChange('Book A');
      const filtered = component.sortedBooks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Test Book A');
    });

    it('should be case insensitive', () => {
      component.onSearchChange('book a');
      const filtered = component.sortedBooks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Test Book A');
    });

    it('should return all books when search query is empty', () => {
      component.onSearchChange('');
      const filtered = component.sortedBooks();
      expect(filtered.length).toBe(2);
    });

    it('should return empty array when no matches', () => {
      component.onSearchChange('Non-existent Book');
      const filtered = component.sortedBooks();
      expect(filtered.length).toBe(0);
    });
  });

  describe('book actions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle book availability', () => {
      component.onAvailabilityToggled(1);
      expect(mockBooksStore.updateBook).toHaveBeenCalledWith({
        ...mockBooks[0],
        isAvailable: false
      });
    });

    it('should navigate to book details when book is clicked', () => {
      component.onBookClicked(1);
      expect(mockNavigation.navigateToBookDetails).toHaveBeenCalledWith(1);
    });

    it('should navigate to edit book page', () => {
      component.onEditBookClicked(1);
      expect(mockNavigation.navigateToEditBook).toHaveBeenCalledWith(1);
    });

    it('should navigate to add book page', () => {
      component.onAddBook();
      expect(mockNavigation.navigateToAddBook).toHaveBeenCalled();
    });

    it('should delete book when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onDeleteBookClicked(1);
      expect(mockBooksStore.deleteBook).toHaveBeenCalledWith(1);
    });

    it('should not delete book when not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.onDeleteBookClicked(1);
      expect(mockBooksStore.deleteBook).not.toHaveBeenCalled();
    });

    it('should not delete if book not found', () => {
      mockBooksStore.books.set([]);
      component.onDeleteBookClicked(999);
      expect(mockBooksStore.deleteBook).not.toHaveBeenCalled();
    });
  });

  describe('combined sorting and searching', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should apply search then sort', () => {
      mockBooksStore.books.set([
        { ...mockBooks[0], title: 'Alpha Book', author: 'Z Author' },
        { ...mockBooks[1], title: 'Beta Book', author: 'A Author' }
      ]);
      component.onSearchChange('Book');
      component.onSortChange('author');
      const result = component.sortedBooks();
      expect(result[0].author).toBe('A Author');
      expect(result[1].author).toBe('Z Author');
    });
  });
});

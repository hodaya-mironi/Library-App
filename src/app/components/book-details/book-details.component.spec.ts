import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { BookDetails } from './book-details.component';
import { BooksStore } from '../../store/books.store';
import { NavigationService } from '../../services/navigation.service';
import { Book } from '../../models/book.model';

describe('BookDetails', () => {
  let component: BookDetails;
  let fixture: ComponentFixture<BookDetails>;
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
    mockBooksStore = jasmine.createSpyObj('BooksStore', ['loadAllBooks'], {
      books: signal([mockBook])
    });

    mockNavigation = jasmine.createSpyObj('Navigation', ['navigateToBooks', 'goBack']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [BookDetails],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BooksStore, useValue: mockBooksStore },
        { provide: NavigationService, useValue: mockNavigation },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookDetails);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load all books only if store is empty', () => {
      mockBooksStore.books.set([]);
      fixture.detectChanges();
      expect(mockBooksStore.loadAllBooks).toHaveBeenCalled();
    });

    it('should not load books if store already has books', () => {
      mockBooksStore.books.set([mockBook]);
      fixture.detectChanges();
      expect(mockBooksStore.loadAllBooks).not.toHaveBeenCalled();
    });

    it('should find and set the book when valid id is provided', () => {
      fixture.detectChanges();
      expect(component.book()).toEqual(mockBook);
      expect(component.isLoading()).toBe(false);
    });

    it('should handle when book is not found', () => {
      mockBooksStore.books.set([]);
      fixture.detectChanges();
      expect(component.book()).toBeUndefined();
      expect(component.isLoading()).toBe(false);
    });

    it('should navigate when bookId is null', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
      fixture.detectChanges();
      expect(mockNavigation.navigateToBooks).toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });

    it('should set isLoading to true initially', () => {
      expect(component.isLoading()).toBe(true);
    });
  });

  describe('goBack', () => {
    it('should call navigation service goBack method', () => {
      component.goBack();
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });
});

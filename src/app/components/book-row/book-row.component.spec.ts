import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookRow } from './book-row.component';
import { Book } from '../../models/book.model';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';

describe('BookRow', () => {
  let component: BookRow;
  let fixture: ComponentFixture<BookRow>;
  let componentRef: ComponentRef<BookRow>;

  const mockBook: Book = {
    id: 1,
    catalogNumber: '0001',
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
    await TestBed.configureTestingModule({
      imports: [BookRow],
      providers: [
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookRow);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('book', mockBook);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('input signals', () => {
    it('should receive book input', () => {
      expect(component.book()).toEqual(mockBook);
    });
  });

  describe('displayedAvailability', () => {
    it('should initially return book availability from input', () => {
      expect(component.displayedAvailability()).toBe(true);
    });

    it('should return local availability when set', () => {
      component['localAvailability'].set(false);
      expect(component.displayedAvailability()).toBe(false);
    });

    it('should prefer local availability over book input', () => {
      componentRef.setInput('book', { ...mockBook, isAvailable: true });
      component['localAvailability'].set(false);
      expect(component.displayedAvailability()).toBe(false);
    });
  });

  describe('onRowClick', () => {
    it('should emit bookClicked with book id', () => {
      spyOn(component.bookClicked, 'emit');
      component.onRowClick();
      expect(component.bookClicked.emit).toHaveBeenCalledWith(1);
    });
  });

  describe('onToggleAvailability', () => {
    it('should toggle availability from true to false', () => {
      spyOn(component.availabilityToggled, 'emit');
      expect(component.displayedAvailability()).toBe(true);

      component.onToggleAvailability();

      expect(component.displayedAvailability()).toBe(false);
      expect(component.availabilityToggled.emit).toHaveBeenCalledWith(1);
    });

    it('should toggle availability from false to true', () => {
      componentRef.setInput('book', { ...mockBook, isAvailable: false });
      fixture.detectChanges();
      spyOn(component.availabilityToggled, 'emit');

      component.onToggleAvailability();

      expect(component.displayedAvailability()).toBe(true);
      expect(component.availabilityToggled.emit).toHaveBeenCalledWith(1);
    });

    it('should update local availability state', () => {
      component.onToggleAvailability();
      expect(component['localAvailability']()).toBe(false);
    });
  });

  describe('onEdit', () => {
    it('should emit editClicked with book id', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');
      spyOn(component.editClicked, 'emit');

      component.onEdit(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.editClicked.emit).toHaveBeenCalledWith(1);
    });

    it('should stop event propagation', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.onEdit(event);

      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    it('should emit deleteClicked with book id', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');
      spyOn(component.deleteClicked, 'emit');

      component.onDelete(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.deleteClicked.emit).toHaveBeenCalledWith(1);
    });

    it('should stop event propagation', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.onDelete(event);

      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('output events', () => {
    it('should have bookClicked output', () => {
      expect(component.bookClicked).toBeDefined();
    });

    it('should have availabilityToggled output', () => {
      expect(component.availabilityToggled).toBeDefined();
    });

    it('should have editClicked output', () => {
      expect(component.editClicked).toBeDefined();
    });

    it('should have deleteClicked output', () => {
      expect(component.deleteClicked).toBeDefined();
    });
  });
});

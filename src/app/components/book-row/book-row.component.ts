import { Component, input, output, signal, computed } from '@angular/core';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-row',
  imports: [],
  templateUrl: './book-row.component.html',
  styleUrl: './book-row.component.scss',
})
export class BookRow {
  book = input.required<Book>();

  bookClicked = output<number>();
  availabilityToggled = output<number>();
  editClicked = output<number>();
  deleteClicked = output<number>();

  private localAvailability = signal<boolean | null>(null);

  displayedAvailability = computed(() => {
    const local = this.localAvailability();
    return local !== null ? local : this.book().isAvailable;
  });

  onRowClick() {
    this.bookClicked.emit(this.book().id);
  }

  onToggleAvailability() {
    const newValue = !this.displayedAvailability();
    this.localAvailability.set(newValue);
    this.availabilityToggled.emit(this.book().id);
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.editClicked.emit(this.book().id);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.deleteClicked.emit(this.book().id);
  }
}

import { Routes } from '@angular/router';
import { BookList } from './components/book-list/book-list.component';
import { BookDetails } from './components/book-details/book-details.component';
import { BookForm } from './components/book-form/book-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/books', pathMatch: 'full' },
  { path: 'books', component: BookList },
  { path: 'books/add', component: BookForm },
  { path: 'books/edit/:id', component: BookForm },
  { path: 'books/:id', component: BookDetails }
];

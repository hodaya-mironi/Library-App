# Library App

An Angular application for managing a library book collection with NgRx Signals for state management.

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 20.19.x or higher recommended)
- **npm** (comes with Node.js)

To check if you have Node.js and npm installed, run:

```bash
node -v
npm -v
```

## Installation

1. Clone the repository (if you haven't already):

```bash
git clone <repository-url>
cd library-app
```

2. Install the dependencies:

```bash
npm install
```

## Running the Application

### Development Server

To run the application in development mode:

```bash
npm start
```

Or using the Angular CLI directly:

```bash
ng serve
```

The application will be available at `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Running Tests

To execute the unit tests via Karma:

```bash
npm test
```

Or using the Angular CLI:

```bash
ng test
```

## Technical Assumptions & Trade-offs

### Assumptions for Simplicity

**Single Copy Model**: For the sake of simplicity, I assumed each book has only a single copy. In a real-world library system, a book would typically have multiple copies. To support this, I would implement a `BookCopy` model (including fields like `bookCopyId`, `isAvailable`, and `location`). The UI would then aggregate this data to display a single book entry with its overall availability status, while "Check-in" and "Check-out" actions would be performed against specific copy IDs.

**Backend Responsibility**: I assumed that the backend is responsible for all CRUD operations (Add, Edit, Delete). Therefore, I did not implement logic to persist changes directly to the source JSON file.

### Trade-offs & Design Decisions

**Optimistic UI Updates**: I chose to implement Optimistic UI updates for the Check-in/Check-out actions. This ensures a "snappy" and responsive user experience by updating the Store and UI immediately. In a production-grade application, this would be supported by a Toast Service to handle potential backend failures; if an error occurs, the user would be notified via a toast message, and the Store would be reverted to its previous state to maintain data integrity.

**Filtering & Sorting Logic**: In traditional NgRx (pre-Signal Store), this logic would typically reside in Selectors. Since the Signal Store doesn't yet have a direct "one-to-one" equivalent for complex local filtering, I chose to handle the sorting and filtering logic within the Component level. This prevents the Global Store from being "polluted" with transient UI state (like specific filter queries) that isn't required by other parts of the application.

## Project Structure

```
library-app/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable UI components
│   │   ├── models/         # TypeScript interfaces and models
│   │   ├── services/       # Business logic and data services
│   │   ├── store/          # NgRx Signals state management
│   │   ├── app.ts          # Root component
│   │   ├── app.routes.ts   # Application routing
│   │   └── app.config.ts   # Application configuration
│   ├── assets/             # Static assets (images, fonts, etc.)
│   └── styles.scss         # Global styles
├── angular.json            # Angular CLI configuration
├── package.json            # Project dependencies
└── tsconfig.json           # TypeScript configuration
```

## Technologies Used

- **Angular** v20.3.0 - Frontend framework
- **NgRx Signals** v20.1.0 - State management
- **Angular CDK** v20.2.14 - Component Dev Kit
- **RxJS** v7.8.0 - Reactive programming
- **TypeScript** v5.9.2 - Programming language
- **SCSS** - Styling

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the app for production
- `npm run watch` - Build and watch for changes
- `npm test` - Run unit tests
- `npm run ng` - Run Angular CLI commands

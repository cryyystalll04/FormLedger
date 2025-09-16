# FormLedger

**A dynamic form management system for creating and managing user submissions.**

FormLedger is a full-stack application that allows administrators to create dynamic forms from JSON schemas. Normal users can then fill out these forms, and administrators can view and export the submitted data as PDF documents.



## Features

- **User Authentication:** Secure login and signup for both administrators and normal users.
- **Role-Based Access Control:** Differentiates between admin and user dashboards to provide a tailored experience.
- **Dynamic Form Creation:** Admins can paste a JSON schema to instantly create complex forms.
- **Dynamic Form Rendering:** Forms are rendered on the fly based on the JSON schema, making the application highly flexible.
- **Form Submission:** Users can fill out and submit forms, with data stored in a MySQL database.
- **Submission Management:** Admins can view all submissions for a specific form.
- **PDF Export:** Individual form submissions can be exported as PDF documents for easy storage and sharing.



## Technologies Used

- **Frontend:**
  - **Vue 3:** The core JavaScript framework.
  - **Vue Router:** For client-side routing.
  - **Pinia:** For state management (authentication).
  - **Vuetify:** A Vue UI library for a polished and responsive design.
  - **Axios:** For making API requests to the backend.
  - **jsPDF:** A JavaScript library for generating PDFs on the client side.

- **Backend:**
  - **Node.js:** The JavaScript runtime environment.
  - **Express.js:** A web framework for building the REST API.
  - **MySQL:** The relational database for storing form schemas and submissions.
  - **jsonwebtoken:** For creating and verifying JWTs for user authentication.
  - **bcrypt.js:** For secure password hashing.
  - **cors:** For enabling cross-origin requests.

## Setup & Installation

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL (v8 or higher)

### Backend Setup

1.  Navigate to the `FormLedger` project root.
2.  Go to the backend directory and install dependencies:
    ```bash
    cd backend
    npm install
    ```
3.  Set up your MySQL database and create a `users` and `forms` table.
4.  Run the backend server:
    ```bash
    node server.js
    ```
    The backend will run on `http://localhost:3000`.

### Frontend Setup

1.  Navigate back to the project root and go to the frontend directory.
2.  Install dependencies:
    ```bash
    cd frontend
    npm install
    ```
3.  Run the frontend development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

## Usage

1.  **Register a User:** Navigate to `/signup` to create a new user account.
2.  **Log in as Admin:** Create an admin account via the backend or a signup, then log in.
3.  **Create a Form:** As an admin, click "Create New Form" and paste a JSON schema from a tool like [Vue Form Builder](https://builder.vueform.com/demo).
4.  **Fill Out a Form:** Log in as a normal user and navigate to the list of available forms to submit data.
5.  **View Submissions:** Log back in as an admin and view the submissions for a form. You can also export individual submissions to a PDF.

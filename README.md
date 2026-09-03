# FlowTask - Full-Stack Multi-Page Todo Application

FlowTask is a full-stack, responsive, multi-page Todo workflow management application built for high productivity. It features a modern white theme powered by Tailwind CSS v4, multi-page routing via search query parameters, dynamic metrics dashboards, interactive checklist progress trackers, server-side filtering, and a hybrid database supporting MongoDB with automatic fallback to local JSON file storage.

---

## 🌐 Live Deployment & Links
* **Live Application URL**: [https://ziptrrip-assignment.onrender.com](https://ziptrrip-assignment.onrender.com)
* **Live Backend API URL**: [https://ziptrrip-assignment-b.onrender.com](https://ziptrrip-assignment-b.onrender.com)
* **Backend Health Check**: [https://ziptrrip-assignment-b.onrender.com/api/health](https://ziptrrip-assignment-b.onrender.com/api/health)
* **GitHub Repository URL**: [https://github.com/ganesh8068/Ziptrrip-Assignment](https://github.com/ganesh8068/Ziptrrip-Assignment)
* **Branch**: `main`

---

## 🚀 Features & Functionalities

### 💻 1. Frontend Architecture & Features (React + Tailwind CSS v4)
* **Multi-Page Application Architecture (instead of single-view SPA)**:
  * **Dashboard Page (`/`)**: Main workflow hub containing the creation panel, quick statistics, search bar, filters, sorting controls, and interactive task cards.
  * **Single Todo Details Page (`/todo?id=<id>`)**: Receives the specific task ID via URL search query parameters (e.g. `http://localhost:5173/todo?id=b630eb32-...`) using `useSearchParams`. Displays complete metadata, editable title/description, and an interactive checklist manager.
* **Dynamic Real-Time Statistics Header**:
  * **Total Tasks**: Real-time counter of all tasks in the system.
  * **Completed Rate**: Live percentage tracker of completed tasks.
  * **Pending Backlog**: Shows ongoing tasks requiring action.
  * **Overdue Alerts**: Highlights tasks where the due date is in the past and status is pending.
* **Subtask Checklist & Live Progress Bar**:
  * Create multiple checklist items for any task during creation or later from the details page.
  * Dynamic visual progress bar shows checklist completion percentage (`0%` to `100%`).
  * Check individual subtasks on the detail page with immediate state persistence.
* **Advanced Server-Side Filtering**:
  * **Live Search**: Case-insensitive text search matching task titles and descriptions.
  * **Status Filter**: Toggle between `All Statuses`, `⏳ Pending`, and `✅ Completed`.
  * **Priority Filter**: Filter by `🟢 Low`, `🟡 Medium`, or `🔴 High` urgency levels.
  * **Category Filter**: Dynamically aggregates all unique categories (e.g. `Work`, `Personal`, `General`) from the database.
* **Multi-Parameter Sorting**:
  * Sort by **Date Created**, **Due Date**, **Alphabetical Title**, or **Priority Level**.
  * Directional toggle button switches between **Ascending (▲)** and **Descending (▼)** orders.
* **Clean White Theme & Tailwind CSS v4**:
  * Built using Tailwind CSS v4 (`@tailwindcss/vite`).
  * Modern, crisp white theme palette (`bg-white` cards on `bg-slate-50` canvas) with high-contrast slate typography (`text-slate-900`, `text-slate-500`).
  * Soft elevated shadows (`shadow-xs`, `hover:shadow-md`) and smooth micro-transitions.
  * Accessible custom checkmark toggles and color-coded priority pill badges.
* **Reliable Task Deletions**:
  * Instant task removal on both the dashboard card and the detail view with live state synchronization.

---

### ⚙️ 2. Backend Architecture & Features (Node.js + Express.js)
* **RESTful CRUD Endpoints**:
  * Full support for `GET`, `POST`, `PUT`, and `DELETE` requests under `/api/todos`.
* **Hybrid Database Engine (MongoDB Mongoose + JSON Fallback)**:
  * **MongoDB Support**: Connects to any MongoDB cluster (Atlas or local) using Mongoose models when `MONGODB_URI` is provided in `.env`.
  * **Automatic JSON Fallback**: If `MONGODB_URI` is not provided or the remote cluster is unreachable, FlowTask automatically and seamlessly falls back to [`backend/todos.json`](backend/todos.json). The server never crashes.
* **Data Sanitization & Validation**:
  * Trims text fields, validates mandatory titles, generates UUIDs, and normalizes nested checklist subtask structures.
* **CORS & Environment Setup**:
  * Enabled CORS middleware to allow cross-origin requests from the React frontend.
  * Configured on port `5050` to prevent collisions with macOS default AirPlay Receiver on port `5000`.
  * Integrated `dotenv` for environment variable loading.
* **Health Check & Diagnostic Endpoint**:
  * `GET /api/health` returns server health, current timestamp, and active database mode (`mongodb` or `json_file`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, React Router v7, Vite 8, Tailwind CSS v4, Lucide React Icons |
| **Backend** | Node.js, Express.js 5, Mongoose 9, CORS, Dotenv, Nodemon |
| **Database** | MongoDB (Primary) / Persistent Local JSON Storage (`todos.json`) (Fallback) |
| **Styling** | Tailwind CSS v4, Google Fonts (Outfit, JetBrains Mono) |

---

## 📂 Directory Structure

```text
Ziptrrip/
├── backend/
│   ├── config/
│   │   └── db.js            # Hybrid database engine (MongoDB + JSON fallback)
│   ├── model/
│   │   └── Todo.js          # Mongoose schema and model definition
│   ├── routes/
│   │   ├── index.js         # Route barrel exporter
│   │   └── routes.js        # REST API endpoints (CRUD, search, filters)
│   ├── index.js             # Express server entry point
│   ├── package.json         # Backend dependencies & npm scripts
│   ├── .env.example         # Environment template for MongoDB URI & Port
│   ├── .env                 # Local environment file (git-ignored for security)
│   └── todos.json           # Fallback local JSON database file
├── frontend/
│   ├── public/              # Static assets (favicon, icons)
│   ├── src/
│   │   ├── components/
│   │   │   └── Header.jsx   # Metrics stats dashboard & navigation bar
│   │   ├── pages/
│   │   │   ├── TodoListPage.jsx    # Page 1: Main dashboard list & creation
│   │   │   └── TodoDetailPage.jsx  # Page 2: Single todo item detail & checklist editor
│   │   ├── App.jsx          # Multi-page router configuration (/ and /todo)
│   │   ├── index.css        # Tailwind CSS v4 directives and typography
│   │   └── main.jsx         # React application mount point
│   ├── index.html           # HTML template with Google Fonts preconnect
│   ├── package.json         # Frontend dependencies (Tailwind v4, React Router)
│   └── vite.config.js       # Vite configuration with @tailwindcss/vite plugin
├── .gitignore               # Excludes node_modules, build outputs, and .env credentials
└── README.md                # Comprehensive project documentation
```

---

## 🔌 Complete API Documentation

Base URL: `http://localhost:5050/api/todos`

### 1. `GET /api/todos` — Retrieve List of Todos
Returns an array of todo items. Supports optional query parameters for server-side filtering and sorting.

* **Query Parameters**:
  * `search` *(optional, string)*: Filter by title or description text.
  * `status` *(optional, string)*: Filter by `completed` or `pending`.
  * `category` *(optional, string)*: Filter by category (e.g. `Work`, `General`, or `all`).
  * `priority` *(optional, string)*: Filter by `low`, `medium`, or `high`.
  * `sortBy` *(optional, string)*: `createdAt`, `dueDate`, `title`, or `priority`.
  * `order` *(optional, string)*: `asc` or `desc`.
* **Example Request**:
  ```bash
  curl "http://localhost:5050/api/todos?status=pending&priority=high&sortBy=dueDate&order=asc"
  ```
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "b630eb32-9a2e-4216-9d8b-4ae54590c391",
      "title": "Build REST APIs",
      "description": "Implement CRUD handlers with validation",
      "completed": false,
      "priority": "high",
      "category": "Backend",
      "dueDate": "2026-09-10",
      "createdAt": "2026-09-01T07:00:00.000Z",
      "updatedAt": "2026-09-01T07:00:00.000Z",
      "subtasks": [
        { "id": "sub-1", "title": "Create db.js", "completed": true }
      ]
    }
  ]
  ```

---

### 2. `GET /api/todos/:id` — Retrieve Single Todo Item
Fetches a single task by its unique ID. Used by the single item detail page.

* **URL Parameter**: `id` *(string)*: Unique identifier of the task.
* **Success Response (200 OK)**: Returns the matching todo object.
* **Error Response (404 Not Found)**: `{"error": "Todo not found"}`

---

### 3. `POST /api/todos` — Create New Todo
Creates a new task with generated timestamps, UUID, and subtask structure.

* **Request Body**:
  ```json
  {
    "title": "Complete Assignment Documentation",
    "description": "Ensure all requirements, APIs, and features are documented in .md files",
    "priority": "high",
    "category": "Work",
    "dueDate": "2026-09-05",
    "subtasks": [
      { "title": "Document API endpoints", "completed": true },
      { "title": "Document multi-page routing", "completed": false }
    ]
  }
  ```
* **Success Response (201 Created)**: Returns the newly created task object with generated `id`.

---

### 4. `PUT /api/todos/:id` — Update Todo or Subtasks
Updates one or more fields of an existing task (e.g. toggling completion, editing title, adding/removing checklist subtasks).

* **Request Body** (partial updates accepted):
  ```json
  {
    "completed": true
  }
  ```
* **Success Response (200 OK)**: Returns the updated todo object.

---

### 5. `DELETE /api/todos/:id` — Delete Todo
Permanently deletes a task.

* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Todo deleted successfully"
  }
  ```

---

### 6. `GET /api/health` — System Health & Database Status
* **Success Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-01T07:30:00.000Z",
    "db": {
      "type": "mongodb",
      "connected": true,
      "storagePath": "MongoDB Cluster"
    }
  }
  ```

---

## 💻 Setup and Running Instructions

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or higher recommended).
* [Git](https://git-scm.com/) installed on your machine.

---

### 2. Backend Server Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Optional)* Configure MongoDB in `.env`:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your MongoDB connection string in `.env`:
   ```env
   PORT=5050
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/flowtask?retryWrites=true&w=majority
   ```
   > **Note**: If you leave `MONGODB_URI` blank, the server runs in local JSON file mode using `backend/todos.json`.
4. Start the backend server:
   ```bash
   npm run server
   ```
   The backend will start and listen on **`http://localhost:5050`**.

---

### 3. Frontend Server Setup
1. Open a new terminal session and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```text
   http://localhost:5173/
   ```

---

## 🧪 Verification & Testing Workflow
1. **Visit Dashboard (`http://localhost:5173/`)**: Verify that the dynamic metric cards render and tasks display in clean white Tailwind cards.
2. **Create a Task**: Fill in the title, description, category, priority, due date, and subtasks in the left sidebar form, then click **Add Task**.
3. **Toggle Completion**: Click the custom checkmark on any task card to mark it completed and observe the metrics header updating in real time.
4. **Navigate to Details Page**: Click any task title to navigate to `/todo?id=<todo_id>`. Verify that the page loads the task via search query parameter.
5. **Manage Checklist**: On the details page, add new subtasks or check existing ones. Notice the completion percentage updating instantly.
6. **Edit or Delete**: Click **Edit Task** to update details, or click **Delete Task** to remove the item and return to the main dashboard.

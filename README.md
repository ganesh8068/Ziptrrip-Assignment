# FlowTask - Premium Todo Dashboard & Workflow Manager

FlowTask is a full-stack, responsive, multi-page Todo application. It provides an intuitive workflow dashboard with search, advanced category/priority filtering, sorting, interactive subtask checklists, and a dynamic real-time progress tracker.

---

## 🚀 Key Features

### 💻 Frontend (React + Vanilla CSS)
1. **Dynamic Dashboard Metrics Header**: Shows total tasks, completed percentage, pending backlog, and overdue items in real time.
2. **Subtask Checklist Builder**: Add multi-item subtasks to a main todo item. Each card dynamically displays a progress bar indicating checklist completion rate.
3. **Advanced Server-side Filters**:
   - Live search (filters by keywords in title and description).
   - Filter by Status (All, Completed, Pending).
   - Filter by Priority (Low, Medium, High).
   - Filter by Category (Work, Personal, Shopping, etc. dynamically aggregated).
4. **Interactive Sorting**: Sort by Due Date, Created Date, Alphabetical Title, and Priority Level in ascending or descending orders.
5. **Multi-page Query Parameter Architecture**:
   - Main dashboard page routes to `/`.
   - Single item detail page loads via query parameters at `/todo?id=<id>` as requested.
6. **Premium Dark/Light Glassmorphic Theme**: Designed with custom responsive grids, interactive hover transitions, custom checkmark inputs, and distinct badge styling.

### ⚙️ Backend (Node.js + Express.js)
1. **RESTful CRUD APIs**: Comprehensive handlers to create, read, update, and delete tasks.
2. **File-based Local DB**: Stores data persistently in `backend/todos.json`, auto-creating it on the first launch.
3. **Robust Input Sanitization**: Standardizes fields (trimming strings, parsing arrays, setting default fields, and generating dates).

---

## 🛠️ Tech Stack
- **Frontend**: React 19, React Router v7, Vite, Lucide React (Icons), Vanilla CSS (responsive variables).
- **Backend**: Node.js, Express.js, CORS, Nodemon.
- **Database**: Local JSON File storage.

---

## 📂 Directory Structure

```text
Ziptrrip/
├── backend/
│   ├── index.js            # Express server entry point
│   ├── db.js               # JSON filesystem database helper
│   ├── routes.js           # REST API endpoints (CRUD, search, filters)
│   ├── package.json        # Backend configuration
│   └── todos.json          # Persistent JSON database (auto-generated)
├── frontend/
│   ├── index.html          # SPA entry point
│   ├── package.json        # Frontend configuration
│   ├── vite.config.js      # Vite dev settings
│   └── src/
│       ├── main.jsx        # Mount point
│       ├── App.jsx         # App router (/) and (/todo)
│       ├── index.css       # Premium responsive design system styles
│       ├── components/
│       │   └── Header.jsx  # Live stats dashboard component
│       └── pages/
│           ├── TodoListPage.jsx    # Main grid & dashboard list
│           └── TodoDetailPage.jsx  # Single todo query parameter detail editor
└── README.md               # Main repository documentation
```

---

## 🔌 API Documentation

All routes are prefixed with `/api/todos`.

### 1. Retrieve Tasks
* **URL**: `/api/todos`
* **Method**: `GET`
* **Query Parameters** (Optional):
  * `search` (string): Keyword matching Title/Description.
  * `status` (string): `completed` or `pending`.
  * `category` (string): Category name or `all`.
  * `priority` (string): `low`, `medium`, or `high`.
  * `sortBy` (string): `createdAt`, `dueDate`, `title`, or `priority`.
  * `order` (string): `asc` or `desc`.
* **Success Response**: `200 OK` (returns list of todo objects).

### 2. Retrieve Single Task
* **URL**: `/api/todos/:id`
* **Method**: `GET`
* **Success Response**: `200 OK` (returns requested todo item) or `404 Not Found`.

### 3. Create Task
* **URL**: `/api/todos`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "title": "Build Frontend Router",
    "description": "Implement BrowserRouter and configure query parameter matching",
    "priority": "high",
    "category": "Development",
    "dueDate": "2026-09-05",
    "subtasks": [
      { "title": "Install react-router-dom", "completed": false }
    ]
  }
  ```
* **Success Response**: `201 Created` (returns created todo object with generated UUID and creation timestamp).

### 4. Update Task (Supports checklist toggles and details editing)
* **URL**: `/api/todos/:id`
* **Method**: `PUT`
* **Request Body**: Accepts partial updates (e.g. `completed: true`, modified `title`, or updated `subtasks` array).
* **Success Response**: `200 OK` (returns updated todo item).

### 5. Delete Task
* **URL**: `/api/todos/:id`
* **Method**: `DELETE`
* **Success Response**: `200 OK` (returns success message).

---

## 💻 Setup and Running Instructions

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version 16 or newer recommended).

### 2. Running the Backend Server
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Run the development server (runs on `http://localhost:5050`):
   ```bash
   npm run server
   ```

### 3. Running the Frontend Server
1. Open a new terminal session and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the React Dev server (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173` to explore FlowTask!

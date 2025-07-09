# 🧠 Real-Time Collaborative Task Board

A **full-stack, real-time Kanban board** (like Trello) built with the **MERN stack + Socket.IO**. Collaborate with your team, manage tasks seamlessly, and see live updates with features like **Smart Assign**, **Conflict Detection**, and a comprehensive **Activity Log**.

> 🚀 **Live Demo:** [https://collab-task-board-frontend.vercel.app/](https://collab-task-board-frontend.vercel.app/)
> 🎥 **Watch Overview Video:** [Project Walkthrough](https://drive.google.com/file/d/1ZVi7xLOeze4rijGJsaoVRUGSERixESBU/view?usp=drivesdk)

---

## 📸 Demo Highlights

| 📌 Feature               | 🎥 Preview                                           |
| ------------------------ | ---------------------------------------------------- |
| Kanban Board             | ![Kanban Board](/public/kanbanBoard.png)             |
| Smart Assign in Action   | ![Smart Assign](/public/SmartAssign.png)             |
| Conflict Detection Popup | ![Conflict Detection](/public/ConflictDetection.png) |

---

## 🚀 Features

### 🔐 Secure Authentication

- JWT-based login & registration
- Passwords hashed with bcrypt
- Protected API routes for authenticated users only

### 🧑‍🤝‍🧑 Team Collaboration

- Board ownership and member invites
- Role-based access: owners can manage members
- Only board members can view/edit tasks

### 📦 Real-Time Kanban Board

- Columns: `To Do`, `In Progress`, `Done`
- Drag & Drop to update task status
- Instant updates across all connected users with Socket.IO

### 🧠 Smart Assign

- Automatically assigns tasks to the teammate with the fewest active tasks
- Powered by MongoDB aggregation logic

### ⚔️ Conflict Detection

- Detects simultaneous edits to the same task
- Prompts users to **merge** or **overwrite** changes
- Ensures data consistency with version control

### 📜 Activity Log

- Tracks all actions (create, edit, delete, move, assign)
- Displays "who did what, when"
- Updates in real time for all users

### 🎨 Sleek Custom UI

- Responsive and mobile-friendly design
- Animations powered by Framer Motion
- Built entirely with plain CSS (no UI frameworks)

---

## 🧰 Tech Stack

| Layer     | Technology                 |
| --------- | -------------------------- |
| Frontend  | React + TypeScript         |
| Backend   | Node.js + Express          |
| Real-Time | Socket.IO                  |
| Database  | MongoDB + Mongoose         |
| Auth      | JWT + bcrypt               |
| Styling   | Custom CSS + Framer Motion |

---

## 🔐 Environment Variables

| Location      | Variables                                       |
| ------------- | ----------------------------------------------- |
| `server/.env` | `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` |
| `client/.env` | `VITE_BACKEND_URL`, `VITE_BACKEND_URL_SOCKET`   |

> 🚨 **Note:** All environment variables are kept private and secured. API routes are protected using JWT.

---

## 🏗️ Architectural Highlights

- **Socket.IO Rooms:** Boards act as isolated socket rooms for real-time updates
- **Optimistic UI:** Instant UI updates before server confirmation
- **Conflict-Safe Editing:** Tasks include version numbers to avoid stale writes
- **Smart Load Distribution:** Auto-assign logic balances workload across team members

---

## 📁 Monorepo Structure

```
collab-todo-board/
├── client/            # React frontend
├── server/            # Express backend
├── public/            # images
├── packages/
│   └── zod-schemas/   # Shared Zod schemas for validation
└── README.md
```

---

## ⚙️ Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/GauravOP-03/Collab-task-board.git
   cd collab-task-board
   ```

2. **Install dependencies for each package**

   ```bash
   pnpm --filter server install
   pnpm --filter client install
   pnpm --filter zod-schemas install
   ```

3. **Build shared packages (if needed)**

   ```bash
   pnpm --filter zod-schemas build
   ```

4. **Setup environment variables**

   - Copy `.env.example` to `.env` in both `server/` and `client/`
   - Fill in the required values:

     - `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `VITE_BACKEND_URL`

5. **Run the app (development mode)**

   ```bash
   cd apps/frontend
   pnpm dev # To start client
   cd apps/server
   node index.js # To start server
   ```

---

## 🙌 Author

Built with ❤️ by [Gaurav Kumar](https://github.com/GauravOP-03)
💬 Let’s connect on [LinkedIn](https://www.linkedin.com/in/gaurav-kumar-5813bb321) or open an issue to collaborate!

---

## 📄 License

MIT License. Free to use for personal and educational projects.

# Database Schema Documentation: Bug Tracker

This project uses a relational database to manage users, projects, bugs, tasks, and team collaboration.

---

## 1. `projects` Table
Stores high-level projects or product versions.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `BigInt (PK)` | Primary Key. |
| `name` | `String` | Project name. |
| `description` | `Text` | Project details/goals. |
| `status` | `Enum` | `active` or `archived`. |
| `manager_id` | `BigInt (FK)` | Links to `users.id` (Project Lead). |
| `timestamps` | `Datetime` | `created_at` and `updated_at`. |

---

## 2. `users` Table
Stores authentication and profile information for all team members.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `BigInt (PK)` | Primary Key. |
| `name` | `String` | Full name of the user. |
| `email` | `String` | Unique email address. |
| `password` | `String` | Hashed password. |
| `role` | `Enum` | `admin`, `manager`, or `dev`. |
| `is_approved` | `Boolean` | Whether the user has been verified by an admin. |
| `remember_token` | `String` | Laravel auth token. |
| `timestamps` | `Datetime` | `created_at` and `updated_at`. |

---

## 3. `bugs` Table
Stores all reported software bugs.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `BigInt (PK)` | Primary Key. |
| `project_id` | `BigInt (FK)` | Links to `projects.id` (The specific project). |
| `title` | `String` | Brief summary of the bug. |
| `description` | `Text` | Detailed steps to reproduce. |
| `category` | `String` | e.g., UI, Backend, Database. |
| `status` | `Enum` | `reported`, `in_progress`, `resolved`, `closed`. |
| `priority` | `Enum` | `low`, `medium`, `high`, `urgent`. |
| `severity` | `Enum` | `minor`, `major`, `critical`, `blocker`. |
| `created_by` | `BigInt (FK)` | Links to `users.id` (The reporter). |
| `assigned_to` | `BigInt (FK)` | Links to `users.id` (The developer fixing it). |
| `timestamps` | `Datetime` | `created_at` and `updated_at`. |

---

## 4. `tasks` Table
Stores general project tasks and sprint items.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `BigInt (PK)` | Primary Key. |
| `project_id` | `BigInt (FK)` | Links to `projects.id` (The specific project). |
| `title` | `String` | Task name. |
| `description` | `Text` | Task details. |
| `category` | `String` | e.g., Feature, Maintenance. |
| `status` | `Enum` | `open`, `in_progress`, `resolved`. |
| `priority` | `Enum` | `low`, `medium`, `high`, `urgent`. |
| `severity` | `Enum` | `minor`, `major`, `critical`, `blocker`. |
| `deadline` | `Date` | Due date for the task. |
| `created_by` | `BigInt (FK)` | Links to `users.id` (The creator). |
| `assigned_to` | `BigInt (FK)` | Links to `users.id` (The assignee). |
| `timestamps` | `Datetime` | `created_at` and `updated_at`. |

---

## 5. `comments` Table
Stores communication logs for both bugs and tasks.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `BigInt (PK)` | Primary Key. |
| `user_id` | `BigInt (FK)` | Links to `users.id` (The commenter). |
| `bug_id` | `BigInt (FK)` | Links to `bugs.id` (Nullable). |
| `task_id` | `BigInt (FK)` | Links to `tasks.id` (Nullable). |
| `content` | `Text` | The comment text. |
| `timestamps` | `Datetime` | `created_at` and `updated_at`. |

---

## Relationships Summary

- **Projects ↔ Bugs/Tasks**: One project contains many bugs and tasks.
- **Users ↔ Projects**: One user (Manager) can lead many projects.
- **Users ↔ Bugs/Tasks**: One user can report many bugs and be assigned to many tasks.
- **Bugs ↔ Comments**: One bug can have many comments.
- **Tasks ↔ Comments**: One task can have many comments.
- **Comments ↔ Users**: Each comment belongs to one specific user.

---

## Sample Test Data

### 1. Test Users
| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Admin Alice** | `admin@example.com` | `password` | `admin` |
| **Manager Mike** | `manager@example.com` | `password` | `manager` |
| **Dev Dave** | `dave@example.com` | `password` | `dev` |

### 2. Sample Projects
| Name | Description | Status | Manager |
| :--- | :--- | :--- | :--- |
| **Bug Tracker v2** | Refining the internal issue tracking system. | `active` | Alice |
| **Mobile App** | Development of the cross-platform mobile client. | `active` | Mike |

---

## Standard Laravel Tables
- `personal_access_tokens`: Manages API authentication tokens for Sanctum.
- `cache`: Stores application cache data.
- `jobs`: Manages background job processing.

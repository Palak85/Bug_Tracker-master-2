# Database Schema Documentation: Bug Tracker

This project uses a relational database to manage users, bug reports, tasks, and team collaboration. Below is the detailed schema for each table.

---

## 1. `users` Table
Stores authentication and profile information for all team members.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `BigInt (PK)` | Primary Key. |
| `name` | `String` | Full name of the user. |
| `email` | `String` | Unique email address (used for login). |
| `password` | `String` | Hashed password. |
| `role` | `Enum` | `admin`, `manager`, or `dev`. |
| `is_approved` | `Boolean` | Whether the user has been verified by an admin. |
| `remember_token` | `String` | Laravel auth token. |
| `timestamps` | `Datetime` | `created_at` and `updated_at`. |

---

## 2. `bugs` Table
Stores all reported software bugs.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `BigInt (PK)` | Primary Key. |
| `title` | `String` | Brief summary of the bug. |
| `description` | `Text` | Detailed steps to reproduce and behavior. |
| `category` | `String` | e.g., UI, Backend, Database. |
| `project` | `String` | e.g., Mobile App, Web Portal. |
| `status` | `Enum` | `reported`, `in_progress`, `resolved`, `closed`. |
| `priority` | `Enum` | `low`, `medium`, `high`, `urgent`. |
| `severity` | `Enum` | `minor`, `major`, `critical`, `blocker`. |
| `created_by` | `BigInt (FK)` | Links to `users.id` (The reporter). |
| `assigned_to` | `BigInt (FK)` | Links to `users.id` (The developer fixing it). |
| `timestamps` | `Datetime` | `created_at` and `updated_at`. |

---

## 3. `tasks` Table
Stores general project tasks and sprint items.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `BigInt (PK)` | Primary Key. |
| `title` | `String` | Task name. |
| `description` | `Text` | Task details. |
| `category` | `String` | e.g., Feature, Maintenance. |
| `project` | `String` | e.g., API, Frontend. |
| `status` | `Enum` | `open`, `in_progress`, `resolved`. |
| `priority` | `Enum` | `low`, `medium`, `high`, `urgent`. |
| `severity` | `Enum` | `minor`, `major`, `critical`, `blocker`. |
| `deadline` | `Date` | Due date for the task. |
| `created_by` | `BigInt (FK)` | Links to `users.id` (The creator). |
| `assigned_to` | `BigInt (FK)` | Links to `users.id` (The assignee). |
| `timestamps` | `Datetime` | `created_at` and `updated_at`. |

---

## 4. `comments` Table
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

- **Users ↔ Bugs/Tasks**: One user can report many bugs and be assigned to many tasks.
- **Bugs ↔ Comments**: One bug can have many comments.
- **Tasks ↔ Comments**: One task can have many comments.
- **Comments ↔ Users**: Each comment belongs to one specific user.

---

---

## Sample Test Data

You can use the following data to test the different roles and features of the application.

### 1. Test Users
| Name | Email | Password | Role | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Alice** | `admin@example.com` | `password` | `admin` | System management & approvals. |
| **Manager Mike** | `manager@example.com` | `password` | `manager` | Creating tasks & assigning developers. |
| **Dev Dave** | `dave@example.com` | `password` | `dev` | Reporting bugs & resolving tasks. |

### 2. Sample Bugs
| Title | Category | Project | Severity | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Login Timeout** | Auth | Web Portal | **Critical** | **Urgent** | `reported` |
| **Icon misaligned** | UI | Mobile App | `minor` | `low` | `in_progress` |
| **Data not saving** | Database | API | **Blocker** | **Urgent** | `reported` |

### 3. Sample Tasks
| Title | Category | Project | Priority | Deadline | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Design Logo** | Design | Marketing | `medium` | `2026-06-01` | `open` |
| **Write API Docs** | Documentation | API | `high` | `2026-05-20` | `in_progress` |
| **Setup Server** | DevOps | Infra | **Urgent** | `2026-05-10` | `resolved` |

### 4. Sample Comments
| User | Item | Content |
| :--- | :--- | :--- |
| **Dave** | Bug: Login Timeout | "I've started investigating the logs for this." |
| **Alice** | Bug: Login Timeout | "Please check the Redis connection settings." |
| **Mike** | Task: Design Logo | "The client requested a purple color palette." |

---

## Standard Laravel Tables
- `personal_access_tokens`: Manages API authentication tokens for Sanctum.
- `cache`: Stores application cache data.
- `jobs`: Manages background job processing.

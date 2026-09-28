

# Student Internship & Skill Tracking Portal
## 🚀 Live Demo

**Student Internship & Skill Tracking Portal:**
https://studentintershipportal-production-1844.up.railway.app/


A comprehensive, centralized academic-industry platform designed for academic departments to track student technical skills, internship company engagements, applications, certificates, and completion verification.

---

## 🌟 Overview & Scenario

In modern universities, students participate in multiple internships and acquire diverse technical skills throughout their degree. Academic departments face significant overhead coordinating company partnerships, tracking application pipelines, validating industry certificates, and monitoring completion status.

This portal provides:
- **Student Profile & Technical Skill Portfolio**: Student portfolios showcasing verified skills, proficiency levels, and academic credentials.
- **Internship Opportunity Marketplace**: Searchable, domain-filtered internship listings with stipend details, deadlines, and requirements.
- **Application Pipeline & Status Tracking**: Multi-step tracking from submission to interview, offer, acceptance, and final completion grading.
- **Certificate Verification Hub**: Digital upload and departmental coordinator verification of credentials and completion certificates.
- **Department Coordinator Command Center**: Centralized review of applicants, conversion rates, skill gap metrics, and status progression.
- **Interactive Relational Database Console**: Live SQL execution, schema exploration, and foreign-key relational integrity mapping.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
  - Controlled forms, custom hooks, reactive filtering, conditional rendering, array transformations (`map`, `filter`, `reduce`).
- **Backend**: Node.js, Express REST API, TypeScript, TSX.
  - Relational SQL engine powered by `sql.js` (WebAssembly SQLite) with standard MySQL DDL compatibility and foreign key constraints.
  - Validation middleware for input hygiene and business rule enforcement.
  - Centralized error handling hierarchy (`AppError`, `ValidationError`, `NotFoundError`, `ConflictError`).
- **Database**: Relational Database with Foreign Keys and CASCADE rules.
  - Tables: `students`, `companies`, `internships`, `skills`, `student_skills`, `applications`, `certificates`.

---

## 📊 Relational Database Schema & Foreign Keys

```
+--------------------+            +-----------------------+
|      STUDENTS      |            |       COMPANIES       |
+--------------------+            +-----------------------+
| id (PK)            |            | id (PK)               |
| roll_number (UQ)   |            | company_name (UQ)     |
| name               |            | domain                |
| email (UQ)         |            | website               |
| department         |            | email                 |
| batch_year         |            | location              |
| cgpa               |            +-----------+-----------+
+----+----------+----+                        | 1
     | 1        | 1                           |
     |          |                             | M
     | M        |                    +--------v--------------+
+----v-------+  |                    |      INTERNSHIPS      |
|  STUDENT   |  |                    +-----------------------+
|   SKILLS   |  |                    | id (PK)               |
+------------+  |                    | company_id (FK)       |
| student_id |  |                    | title, domain, stipend|
| skill_id   |  |                    | deadline, status      |
+----+-------+  |                    +-----------+-----------+
     | M        |                                | 1
     |          |                                |
     | 1        | M                            M |
+----v-------+  +------------>+------------------v-----------+
|   SKILLS   |                |         APPLICATIONS         |
+------------+                +------------------------------+
| id (PK)    |                | id (PK)                      |
| name (UQ)  |                | student_id (FK)              |
| category   |                | internship_id (FK)           |
+------------+                | status (Enum)                |
                              | supervisor_remarks, score    |
                              +--------------+---------------+
                                             | 1 (Optional)
                                             |
                                             | 0..1
                              +--------------v---------------+
                              |         CERTIFICATES         |
                              +------------------------------+
                              | id (PK)                      |
                              | student_id (FK)              |
                              | application_id (FK nullable) |
                              | title, issuing_org           |
                              | credential_id, verified_dept |
                              +------------------------------+
```

---

## 📡 REST API Documentation

### 1. Students API
- `GET /api/students` - List all students (optional `?search=...&department=...`)
- `GET /api/students/:id` - Get student profile with aggregated skills, applications, and certificates
- `POST /api/students` - Create a student profile (Body: `name`, `email`, `roll_number`, `department`, `batch_year`, `cgpa`, etc.)
- `PUT /api/students/:id` - Update student profile
- `DELETE /api/students/:id` - Delete student (cascades to related skills, applications, certificates)
- `GET /api/students/:id/skills` - List skills linked to student
- `POST /api/students/:id/skills` - Add technical skill to student (`skill_id`, `proficiency_level`, `certified`, `acquired_date`)
- `DELETE /api/students/:id/skills/:studentSkillId` - Remove skill from student

### 2. Companies API
- `GET /api/companies` - List all companies with internship counts
- `GET /api/companies/:id` - Company profile with active postings
- `POST /api/companies` - Register new hiring partner (`company_name`, `domain`, `email`, `location`, `website`)
- `PUT /api/companies/:id` - Update company details
- `DELETE /api/companies/:id` - Remove company

### 3. Internships API
- `GET /api/internships` - Query internships with filters (`?domain=...&role_type=...&status=...&search=...&min_stipend=...`)
- `GET /api/internships/:id` - Internship details, requirements, and applicants list
- `POST /api/internships` - Post internship (`company_id`, `title`, `domain`, `role_type`, `stipend_amount`, `duration_months`, `deadline`)
- `PUT /api/internships/:id` - Update internship posting
- `DELETE /api/internships/:id` - Delete internship

### 4. Applications API
- `GET /api/applications` - Query applications (`?status=...&student_id=...&internship_id=...`)
- `GET /api/applications/:id` - Application detail
- `POST /api/applications` - Apply for internship (`student_id`, `internship_id`, `cover_note`, `resume_link`)
- `PATCH /api/applications/:id/status` - Transition status (`APPLIED` ➔ `UNDER_REVIEW` ➔ `SHORTLISTED` ➔ `INTERVIEW` ➔ `OFFERED` ➔ `ACCEPTED` ➔ `COMPLETED` / `REJECTED`)
- `DELETE /api/applications/:id` - Withdraw application

### 5. Skills Master Catalog API
- `GET /api/skills` - List master skills catalog grouped by category
- `POST /api/skills` - Add new skill to catalog (`name`, `category`, `description`)
- `PUT /api/skills/:id` - Update skill definition
- `DELETE /api/skills/:id` - Delete skill

### 6. Certificates API
- `GET /api/certificates` - List certificates (`?student_id=...&verified=...`)
- `POST /api/certificates` - Upload/register certificate info (`student_id`, `title`, `issuing_org`, `issue_date`, `credential_id`, `credential_url`)
- `PATCH /api/certificates/:id/verify` - Department coordinator verification toggle (`verified: true/false`)
- `DELETE /api/certificates/:id` - Delete certificate

### 7. Analytics & Database API
- `GET /api/analytics/overview` - Department dashboard KPIs and conversion statistics
- `POST /api/db/query` - Execute custom SQL query (SELECT / DML) with time benchmarks
- `GET /api/db/schema` - Introspect all tables, column types, and foreign key definitions
- `GET /api/db/export-mysql` - Download MySQL DDL and seed dump file

---

## 🐙 Git & GitHub Workflow

### Branching Strategy
- `main`: Production release branch. Only merged via reviewed Pull Requests.
- `feature/student-profile`: Student profile management, CGPA metrics, and skill associations.
- `feature/internship-catalog`: Company postings, search, domain filter chips, and application submission.
- `feature/application-workflow`: State transition pipeline, coordinator notes, and completion evaluations.
- `feature/certificate-verification`: Certificate logging, credential verification, and badge generation.
- `feature/mysql-schema-and-apis`: Relational schema DDL, validation middleware, and error handling.

### Pull Request & Issue Templates
All features follow GitHub Issue tracking with labels:
- `enhancement`: Feature additions
- `bug`: Defect fixes
- `documentation`: API specs and schema guides
- `security`: Input validation and constraint integrity

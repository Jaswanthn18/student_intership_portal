-- ====================================================================
-- STUDENT INTERNSHIP & SKILL TRACKING PORTAL
-- Relational MySQL Schema (DDL)
-- ====================================================================

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roll_number VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  department VARCHAR(80) NOT NULL,
  batch_year INTEGER NOT NULL,
  cgpa DECIMAL(3, 2) NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  resume_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name VARCHAR(120) NOT NULL,
  domain VARCHAR(80) NOT NULL,
  website VARCHAR(200),
  email VARCHAR(150) NOT NULL,
  location VARCHAR(100) NOT NULL,
  logo_url TEXT,
  description TEXT,
  contact_person VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Internships Table
CREATE TABLE IF NOT EXISTS internships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  title VARCHAR(150) NOT NULL,
  domain VARCHAR(80) NOT NULL,
  role_type VARCHAR(50) NOT NULL, -- 'Remote', 'On-site', 'Hybrid'
  location VARCHAR(100) NOT NULL,
  duration_months INTEGER NOT NULL,
  stipend_amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  vacancies INTEGER DEFAULT 1,
  deadline DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLOSING_SOON', 'CLOSED'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 4. Skills Master Catalog Table
CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(60) NOT NULL, -- 'Frontend', 'Backend', 'Data Science', 'Cloud & DevOps', etc.
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Student_Skills Junction Table (Many-to-Many Relational)
CREATE TABLE IF NOT EXISTS student_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  proficiency_level VARCHAR(30) NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  certified BOOLEAN DEFAULT 0,
  acquired_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE(student_id, skill_id)
);

-- 6. Applications Table (Connecting Students with Internships)
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  internship_id INTEGER NOT NULL,
  status VARCHAR(40) DEFAULT 'APPLIED', 
  -- Statuses: 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'ACCEPTED', 'COMPLETED', 'REJECTED'
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cover_note TEXT,
  resume_link TEXT,
  supervisor_remarks TEXT,
  completion_score DECIMAL(4, 1) DEFAULT NULL, -- e.g. 94.5% or 9.5
  completion_feedback TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
  UNIQUE(student_id, internship_id)
);

-- 7. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  application_id INTEGER,
  title VARCHAR(180) NOT NULL,
  issuing_org VARCHAR(120) NOT NULL,
  issue_date DATE NOT NULL,
  credential_id VARCHAR(100),
  credential_url TEXT,
  verified_by_dept BOOLEAN DEFAULT 0,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL
);

-- Relational Indexes for Optimal Query Performance
CREATE INDEX IF NOT EXISTS idx_internships_company ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_internships_domain ON internships(domain);
CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill ON student_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);

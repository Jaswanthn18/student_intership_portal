-- ====================================================================
-- Initial Seed Data for Student Internship & Skill Tracking Portal
-- ====================================================================

-- 1. Insert Skills Catalog
INSERT OR IGNORE INTO skills (id, name, category, description) VALUES
(1, 'React.js', 'Frontend', 'Declarative, component-based frontend library for modern web UIs'),
(2, 'TypeScript', 'Languages', 'Typed superset of JavaScript that compiles to plain JavaScript'),
(3, 'Node.js & Express', 'Backend', 'Asynchronous event-driven JavaScript runtime and minimalist web framework'),
(4, 'Python & FastAPI', 'Backend', 'High-performance Python framework for building robust REST and ML APIs'),
(5, 'MySQL & Relational DBs', 'Database', 'Relational database management, ACID transactions, complex JOINs and indexing'),
(6, 'Docker & Kubernetes', 'DevOps & Cloud', 'Containerization, microservices orchestration, and CI/CD pipelines'),
(7, 'Machine Learning & PyTorch', 'Data Science & AI', 'Deep learning architectures, neural networks, and model training'),
(8, 'AWS Cloud Architecture', 'DevOps & Cloud', 'EC2, S3, RDS, Lambda serverless, and cloud security policies'),
(9, 'Tailwind CSS', 'Frontend', 'Utility-first CSS framework for rapid and maintainable responsive design'),
(10, 'Flutter & Dart', 'Mobile', 'Cross-platform mobile application framework for iOS and Android'),
(11, 'Next.js', 'Frontend', 'React production framework with SSR, SSG, and API route architectures'),
(12, 'Cybersecurity & Pentesting', 'Security', 'Vulnerability assessment, network defense, OWASP Top 10 mitigation');

-- 2. Insert Students
INSERT OR IGNORE INTO students (id, roll_number, name, email, department, batch_year, cgpa, phone, bio, resume_url, avatar_url) VALUES
(1, '2023CS1042', 'Aarav Patel', 'aarav.patel@univ.edu', 'Computer Science & Engineering', 2025, 9.15, '+1 (555) 234-8901', 'Passionate full-stack developer with keen interest in distributed systems, clean REST APIs, and responsive React applications.', 'https://drive.google.com/file/d/aarav-resume.pdf', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
(2, '2023CS1088', 'Priya Sharma', 'priya.sharma@univ.edu', 'Information Technology', 2025, 9.42, '+1 (555) 345-6789', 'AI & Data Science enthusiast actively researching NLP, computer vision pipelines, and productionizing PyTorch models.', 'https://drive.google.com/file/d/priya-resume.pdf', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'),
(3, '2023CS1019', 'Rohan Verma', 'rohan.verma@univ.edu', 'Computer Science & Engineering', 2026, 8.78, '+1 (555) 456-7890', 'Cloud and DevOps aspirant with hands-on experience in Docker, Terraform, Kubernetes clusters, and automated release gates.', 'https://drive.google.com/file/d/rohan-resume.pdf', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
(4, '2023IT1055', 'Ananya Iyer', 'ananya.iyer@univ.edu', 'Information Technology', 2025, 9.20, '+1 (555) 567-8901', 'Mobile software engineer crafting elegant cross-platform experiences in Flutter and native Android with Jetpack Compose.', 'https://drive.google.com/file/d/ananya-resume.pdf', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80');

-- 3. Insert Student Skills (Relational Mapping)
INSERT OR IGNORE INTO student_skills (id, student_id, skill_id, proficiency_level, certified, acquired_date) VALUES
(1, 1, 1, 'Expert', 1, '2023-08-15'),
(2, 1, 2, 'Advanced', 1, '2023-11-20'),
(3, 1, 3, 'Advanced', 1, '2024-01-10'),
(4, 1, 5, 'Intermediate', 1, '2024-03-05'),
(5, 1, 9, 'Expert', 0, '2023-06-12'),
(6, 2, 4, 'Expert', 1, '2023-09-01'),
(7, 2, 7, 'Advanced', 1, '2024-02-18'),
(8, 2, 5, 'Advanced', 1, '2023-10-15'),
(9, 2, 2, 'Intermediate', 0, '2024-04-10'),
(10, 3, 6, 'Advanced', 1, '2023-12-01'),
(11, 3, 8, 'Intermediate', 1, '2024-03-22'),
(12, 3, 3, 'Intermediate', 0, '2024-01-15'),
(13, 4, 10, 'Expert', 1, '2023-07-20'),
(14, 4, 1, 'Intermediate', 0, '2024-02-10'),
(15, 4, 2, 'Advanced', 1, '2023-11-05');

-- 4. Insert Companies
INSERT OR IGNORE INTO companies (id, company_name, domain, website, email, location, logo_url, description, contact_person) VALUES
(1, 'NexusCloud Technologies', 'Cloud & DevOps', 'https://nexuscloud.tech', 'careers@nexuscloud.tech', 'San Francisco, CA', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80', 'Leading enterprise multi-cloud infrastructure and observability platform serving Fortune 500 customers.', 'Elena Rostova (Head of University Talent)'),
(2, 'Apex Cognitive AI Labs', 'Data Science & AI', 'https://apex-cognitive.io', 'internships@apex-cognitive.io', 'Boston, MA', 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=100&auto=format&fit=crop&q=80', 'Pioneering frontier foundation models, agentic workflows, and semantic knowledge retrieval systems.', 'Dr. Julian Sterling (VP Research)'),
(3, 'FinPulse Digital', 'FinTech & Full Stack', 'https://finpulse.co', 'talent@finpulse.co', 'New York, NY', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80', 'Next-generation high-frequency algorithmic clearing and retail neo-banking infrastructure.', 'Marcus Thorne (Engineering Director)'),
(4, 'Vanguard Cyber Defense', 'Cybersecurity', 'https://vanguardcyber.net', 'jobs@vanguardcyber.net', 'Austin, TX', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80', 'Autonomous cybersecurity detection platform powered by proactive threat emulation and SIEM.', 'Sarah Jenkins (SecOps Talent Lead)'),
(5, 'SwiftFlow Mobile', 'Mobile & Frontend', 'https://swiftflow.dev', 'interns@swiftflow.dev', 'Seattle, WA', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80', 'High-growth consumer app studio building real-time collaborative productivity tools for over 10M creators.', 'Liam O’Connor (Co-Founder & CTO)');

-- 5. Insert Internships
INSERT OR IGNORE INTO internships (id, company_id, title, domain, role_type, location, duration_months, stipend_amount, description, requirements, vacancies, deadline, status) VALUES
(1, 1, 'Cloud Infrastructure & SRE Intern', 'Cloud & DevOps', 'Hybrid', 'San Francisco, CA', 6, 2800.00, 'Collaborate with the Core Platform team to architect resilient Kubernetes deployments, automate Terraform blueprints, and configure Prometheus/Grafana observability dashboards.', 'Strong knowledge of Linux CLI, basic Docker containerization, understanding of networking protocols, and willingness to learn Golang/AWS.', 3, '2026-11-15', 'ACTIVE'),
(2, 2, 'Applied AI & LLM Systems Intern', 'Data Science & AI', 'Remote', 'Remote (Global)', 4, 3200.00, 'Work alongside senior ML research engineers to benchmark, fine-tune, and deploy multimodal generative models with low-latency streaming endpoints.', 'Proficiency in Python, PyTorch or TensorFlow, vector databases, familiarity with transformer architectures, and solid linear algebra fundamentals.', 2, '2026-10-30', 'ACTIVE'),
(3, 3, 'Full-Stack Web Engineering Intern', 'Web Development', 'On-site', 'New York, NY', 6, 2900.00, 'Build scalable, secure customer-facing web dashboards and low-latency financial transaction portals using React, TypeScript, and Express/Postgres microservices.', 'Solid proficiency in React.js, TypeScript, state management, REST API design, and relational SQL database modeling.', 4, '2026-11-05', 'ACTIVE'),
(4, 4, 'Security Operations & SOC Analyst Intern', 'Cybersecurity', 'On-site', 'Austin, TX', 3, 2400.00, 'Assist the SecOps intelligence team in analyzing network telemetry, triaging incident alerts, conducting static code security audits, and scripting automation in Python.', 'Familiarity with TCP/IP, Wireshark, basic penetration testing methodologies, Linux fundamentals, and OWASP Top 10 vulnerabilities.', 2, '2026-10-25', 'ACTIVE'),
(5, 5, 'Cross-Platform Mobile App Intern', 'Mobile Development', 'Remote', 'Remote (US/Canada)', 4, 2600.00, 'Design and implement buttery-smooth responsive UI screens, state management architecture, and offline sync engines for our flagship consumer mobile application.', 'Experience with Flutter/Dart or React Native, familiarity with mobile design guidelines (Material 3/Human Interface), and Git workflows.', 3, '2026-11-20', 'ACTIVE'),
(6, 1, 'DevSecOps & CI/CD Pipeline Intern', 'Cloud & DevOps', 'Remote', 'Remote', 5, 2700.00, 'Automate secure artifact scanning, GitHub Actions pipelines, and zero-trust container security policies across hybrid Kubernetes clusters.', 'Knowledge of Docker, GitHub Actions/GitLab CI, shell scripting, and basic cloud security principles.', 2, '2026-10-18', 'ACTIVE');

-- 6. Insert Applications (Tracking Status & Relational Progress)
INSERT OR IGNORE INTO applications (id, student_id, internship_id, status, applied_date, cover_note, resume_link, supervisor_remarks, completion_score, completion_feedback, updated_at) VALUES
(1, 1, 3, 'COMPLETED', '2024-05-10 10:30:00', 'I have built multiple production-grade React & Express applications and would love to contribute to FinPulse financial engines.', 'https://drive.google.com/file/d/aarav-resume.pdf', 'Outstanding performance throughout the 6-month term. Architected 4 core modules on time with zero regressions.', 96.5, 'Demonstrated senior-level maturity in code reviews and test coverage. Highly recommended for full-time conversion.', '2024-11-15 16:45:00'),
(2, 1, 1, 'OFFERED', '2026-08-12 14:20:00', 'Excited to deepen my platform engineering and distributed systems skills under NexusCloud mentorship.', 'https://drive.google.com/file/d/aarav-resume.pdf', 'Cleared technical rounds with top ratings from the infrastructure committee. Formal offer dispatched.', NULL, NULL, '2026-09-20 09:15:00'),
(3, 2, 2, 'INTERVIEW', '2026-09-02 11:00:00', 'My research paper on contextual attention mechanisms aligns directly with Apex Cognitive Labs mission.', 'https://drive.google.com/file/d/priya-resume.pdf', 'Interview scheduled for Friday with Lead ML Scientist.', NULL, NULL, '2026-09-24 15:30:00'),
(4, 3, 1, 'UNDER_REVIEW', '2026-09-10 16:40:00', 'Certified AWS Cloud Practitioner with solid hands-on experience orchestrating multi-node k8s clusters.', 'https://drive.google.com/file/d/rohan-resume.pdf', 'Profile forwarded to DevOps hiring manager for technical review.', NULL, NULL, '2026-09-18 10:20:00'),
(5, 4, 5, 'ACCEPTED', '2026-08-25 09:10:00', 'Created 3 published Flutter apps with over 25k downloads. Eager to contribute to SwiftFlow design systems.', 'https://drive.google.com/file/d/ananya-resume.pdf', 'Candidate accepted offer. Onboarding scheduled for next month.', NULL, NULL, '2026-09-22 13:00:00');

-- 7. Insert Certificates (Connecting Students, Internships & Verifications)
INSERT OR IGNORE INTO certificates (id, student_id, application_id, title, issuing_org, issue_date, credential_id, credential_url, verified_by_dept, verified_at) VALUES
(1, 1, 1, 'Full-Stack Software Engineering Internship Certificate of Excellence', 'FinPulse Digital', '2024-11-16', 'FP-2024-INT-0994', 'https://finpulse.co/verify/FP-2024-INT-0994', 1, '2024-11-20 11:15:00'),
(2, 1, NULL, 'AWS Certified Solutions Architect – Associate', 'Amazon Web Services', '2024-04-12', 'AWS-ARCH-883921', 'https://aws.amazon.com/verification/883921', 1, '2024-04-20 14:00:00'),
(3, 2, NULL, 'Deep Learning Specialization with PyTorch', 'DeepLearning.AI / Coursera', '2024-03-10', 'COURSERA-DL-772184', 'https://coursera.org/verify/COURSERA-DL-772184', 1, '2024-03-15 16:20:00'),
(4, 3, NULL, 'Certified Kubernetes Administrator (CKA)', 'Cloud Native Computing Foundation (CNCF)', '2024-06-05', 'LF-CKA-4029184', 'https://www.cncf.io/certification/verify', 1, '2024-06-12 10:00:00'),
(5, 4, NULL, 'Meta Certified Mobile Developer Professional', 'Meta / Coursera', '2024-01-22', 'META-MOB-99382', 'https://coursera.org/verify/META-MOB-99382', 0, NULL);

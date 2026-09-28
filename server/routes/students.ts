import { Router, Request, Response, NextFunction } from 'express';
import { queryAll, queryOne, run } from '../db.ts';
import { validateStudent, validateStudentSkill } from '../middleware/validation.ts';
import { NotFoundError, ConflictError } from '../errors.ts';

export const studentsRouter = Router();

// GET all students
studentsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department, search } = req.query;
    let sql = 'SELECT * FROM students';
    const params: any[] = [];
    const conditions: string[] = [];

    if (department && typeof department === 'string') {
      conditions.push('department = ?');
      params.push(department);
    }
    if (search && typeof search === 'string') {
      conditions.push('(name LIKE ? OR roll_number LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY id DESC';

    const students = queryAll(sql, params);

    // Attach skill and application counts
    const enriched = students.map((s: any) => {
      const skillsCount = queryOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM student_skills WHERE student_id = ?',
        [s.id]
      )?.count ?? 0;
      const appsCount = queryOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM applications WHERE student_id = ?',
        [s.id]
      )?.count ?? 0;
      const certsCount = queryOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM certificates WHERE student_id = ?',
        [s.id]
      )?.count ?? 0;
      return { ...s, skillsCount, appsCount, certsCount };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
});

// GET single student by ID with full relational details
studentsRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = Number(req.params.id);
    const student = queryOne('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!student) {
      throw new NotFoundError(`Student with ID ${studentId} not found`);
    }

    // Relational skills
    const skills = queryAll(
      `SELECT ss.id as student_skill_id, ss.proficiency_level, ss.certified, ss.acquired_date,
              s.id as skill_id, s.name as skill_name, s.category as skill_category, s.description as skill_description
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.student_id = ?
       ORDER BY ss.created_at DESC`,
      [studentId]
    );

    // Relational applications
    const applications = queryAll(
      `SELECT a.*, i.title as internship_title, i.domain as internship_domain, i.role_type, i.stipend_amount,
              c.id as company_id, c.company_name, c.logo_url as company_logo
       FROM applications a
       JOIN internships i ON a.internship_id = i.id
       JOIN companies c ON i.company_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.applied_date DESC`,
      [studentId]
    );

    // Relational certificates
    const certificates = queryAll(
      `SELECT cert.*, app.internship_id, i.title as linked_internship_title
       FROM certificates cert
       LEFT JOIN applications app ON cert.application_id = app.id
       LEFT JOIN internships i ON app.internship_id = i.id
       WHERE cert.student_id = ?
       ORDER BY cert.issue_date DESC`,
      [studentId]
    );

    res.json({
      success: true,
      data: {
        ...student,
        skills,
        applications,
        certificates,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST create student
studentsRouter.post('/', validateStudent, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roll_number, name, email, department, batch_year, cgpa, phone, bio, resume_url, avatar_url } = req.body;

    const existingRoll = queryOne('SELECT id FROM students WHERE roll_number = ?', [roll_number]);
    if (existingRoll) {
      throw new ConflictError(`Student with roll number "${roll_number}" already exists`);
    }

    const existingEmail = queryOne('SELECT id FROM students WHERE email = ?', [email]);
    if (existingEmail) {
      throw new ConflictError(`Student with email "${email}" already exists`);
    }

    const result = run(
      `INSERT INTO students (roll_number, name, email, department, batch_year, cgpa, phone, bio, resume_url, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        roll_number.trim(),
        name.trim(),
        email.trim().toLowerCase(),
        department.trim(),
        Number(batch_year),
        Number(cgpa),
        phone || null,
        bio || null,
        resume_url || null,
        avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      ]
    );

    const created = queryOne('SELECT * FROM students WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, message: 'Student profile created successfully', data: created });
  } catch (err) {
    next(err);
  }
});

// PUT update student
studentsRouter.put('/:id', validateStudent, (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = Number(req.params.id);
    const existing = queryOne('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!existing) {
      throw new NotFoundError(`Student with ID ${studentId} not found`);
    }

    const { roll_number, name, email, department, batch_year, cgpa, phone, bio, resume_url, avatar_url } = req.body;

    // Check duplicate roll number on other students
    const duplicateRoll = queryOne('SELECT id FROM students WHERE roll_number = ? AND id != ?', [roll_number, studentId]);
    if (duplicateRoll) {
      throw new ConflictError(`Roll number "${roll_number}" is already used by another student`);
    }

    // Check duplicate email on other students
    const duplicateEmail = queryOne('SELECT id FROM students WHERE email = ? AND id != ?', [email, studentId]);
    if (duplicateEmail) {
      throw new ConflictError(`Email "${email}" is already used by another student`);
    }

    run(
      `UPDATE students
       SET roll_number = ?, name = ?, email = ?, department = ?, batch_year = ?, cgpa = ?, phone = ?, bio = ?, resume_url = ?, avatar_url = ?
       WHERE id = ?`,
      [
        roll_number.trim(),
        name.trim(),
        email.trim().toLowerCase(),
        department.trim(),
        Number(batch_year),
        Number(cgpa),
        phone || null,
        bio || null,
        resume_url || null,
        avatar_url || existing.avatar_url,
        studentId,
      ]
    );

    const updated = queryOne('SELECT * FROM students WHERE id = ?', [studentId]);
    res.json({ success: true, message: 'Student profile updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE student (Cascades to student_skills, applications, certificates)
studentsRouter.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = Number(req.params.id);
    const student = queryOne('SELECT id FROM students WHERE id = ?', [studentId]);
    if (!student) {
      throw new NotFoundError(`Student with ID ${studentId} not found`);
    }

    run('DELETE FROM students WHERE id = ?', [studentId]);
    res.json({ success: true, message: `Student ID ${studentId} and all associated relational records deleted` });
  } catch (err) {
    next(err);
  }
});

// GET student skills
studentsRouter.get('/:id/skills', (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = Number(req.params.id);
    const skills = queryAll(
      `SELECT ss.id as student_skill_id, ss.student_id, ss.skill_id, ss.proficiency_level, ss.certified, ss.acquired_date,
              s.name as skill_name, s.category as skill_category, s.description as skill_description
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.student_id = ?
       ORDER BY ss.created_at DESC`,
      [studentId]
    );
    res.json({ success: true, data: skills });
  } catch (err) {
    next(err);
  }
});

// POST add skill to student
studentsRouter.post('/:id/skills', (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = Number(req.params.id);
    const { skill_id, proficiency_level, certified, acquired_date } = req.body;

    if (!skill_id || isNaN(Number(skill_id))) {
      throw new Error('Valid skill_id is required');
    }
    const student = queryOne('SELECT id FROM students WHERE id = ?', [studentId]);
    if (!student) throw new NotFoundError(`Student with ID ${studentId} not found`);

    const skill = queryOne('SELECT id, name FROM skills WHERE id = ?', [skill_id]);
    if (!skill) throw new NotFoundError(`Skill with ID ${skill_id} not found`);

    const existingMapping = queryOne(
      'SELECT id FROM student_skills WHERE student_id = ? AND skill_id = ?',
      [studentId, skill_id]
    );
    if (existingMapping) {
      throw new ConflictError(`Skill "${skill.name}" is already linked to this student profile`);
    }

    const result = run(
      `INSERT INTO student_skills (student_id, skill_id, proficiency_level, certified, acquired_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        studentId,
        skill_id,
        proficiency_level || 'Intermediate',
        certified ? 1 : 0,
        acquired_date || new Date().toISOString().slice(0, 10),
      ]
    );

    const record = queryOne(
      `SELECT ss.*, s.name as skill_name, s.category as skill_category
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.id = ?`,
      [result.lastInsertRowid]
    );

    res.status(201).json({ success: true, message: 'Skill added to student profile', data: record });
  } catch (err) {
    next(err);
  }
});

// DELETE remove skill from student
studentsRouter.delete('/:id/skills/:studentSkillId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = Number(req.params.id);
    const studentSkillId = Number(req.params.studentSkillId);

    const record = queryOne(
      'SELECT id FROM student_skills WHERE id = ? AND student_id = ?',
      [studentSkillId, studentId]
    );
    if (!record) {
      throw new NotFoundError('Student skill mapping not found');
    }

    run('DELETE FROM student_skills WHERE id = ?', [studentSkillId]);
    res.json({ success: true, message: 'Skill removed from student profile' });
  } catch (err) {
    next(err);
  }
});

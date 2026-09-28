import { Router, Request, Response, NextFunction } from 'express';
import { queryAll, queryOne, run } from '../db.ts';
import { validateApplication, validateApplicationStatus } from '../middleware/validation.ts';
import { NotFoundError, ConflictError, ValidationError } from '../errors.ts';

export const applicationsRouter = Router();

// GET all applications with relational student + internship + company data
applicationsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, student_id, internship_id } = req.query;

    let sql = `
      SELECT a.*,
             s.name as student_name, s.roll_number as student_roll, s.email as student_email, 
             s.department as student_department, s.cgpa as student_cgpa, s.avatar_url as student_avatar,
             i.title as internship_title, i.domain as internship_domain, i.role_type, 
             i.duration_months, i.stipend_amount,
             c.company_name, c.logo_url as company_logo
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN internships i ON a.internship_id = i.id
      JOIN companies c ON i.company_id = c.id
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (status && typeof status === 'string' && status !== 'All') {
      conditions.push('a.status = ?');
      params.push(status);
    }
    if (student_id && !isNaN(Number(student_id))) {
      conditions.push('a.student_id = ?');
      params.push(Number(student_id));
    }
    if (internship_id && !isNaN(Number(internship_id))) {
      conditions.push('a.internship_id = ?');
      params.push(Number(internship_id));
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY a.updated_at DESC, a.applied_date DESC';

    const applications = queryAll(sql, params);
    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
});

// GET single application
applicationsRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const appId = Number(req.params.id);
    const application = queryOne(
      `SELECT a.*,
              s.name as student_name, s.roll_number as student_roll, s.email as student_email, 
              s.department as student_department, s.cgpa as student_cgpa, s.bio as student_bio,
              i.title as internship_title, i.domain as internship_domain, i.role_type, 
              i.location as internship_location, i.duration_months, i.stipend_amount, i.description as internship_desc,
              c.company_name, c.logo_url as company_logo, c.website as company_website
       FROM applications a
       JOIN students s ON a.student_id = s.id
       JOIN internships i ON a.internship_id = i.id
       JOIN companies c ON i.company_id = c.id
       WHERE a.id = ?`,
      [appId]
    );

    if (!application) {
      throw new NotFoundError(`Application with ID ${appId} not found`);
    }

    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
});

// POST submit internship application
applicationsRouter.post('/', validateApplication, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { student_id, internship_id, cover_note, resume_link } = req.body;

    const student = queryOne('SELECT id, name, resume_url FROM students WHERE id = ?', [student_id]);
    if (!student) {
      throw new NotFoundError(`Student with ID ${student_id} not found`);
    }

    const internship = queryOne('SELECT id, title, status, deadline FROM internships WHERE id = ?', [internship_id]);
    if (!internship) {
      throw new NotFoundError(`Internship with ID ${internship_id} not found`);
    }

    if (internship.status === 'CLOSED') {
      throw new ValidationError(`Applications for "${internship.title}" are closed`);
    }

    const existingApp = queryOne(
      'SELECT id, status FROM applications WHERE student_id = ? AND internship_id = ?',
      [student_id, internship_id]
    );
    if (existingApp) {
      throw new ConflictError(`Student already applied for this internship (Current status: ${existingApp.status})`);
    }

    const effectiveResume = resume_link?.trim() || student.resume_url || 'https://drive.google.com/file/d/student-resume.pdf';

    const result = run(
      `INSERT INTO applications (student_id, internship_id, status, cover_note, resume_link)
       VALUES (?, ?, 'APPLIED', ?, ?)`,
      [student_id, internship_id, cover_note ? cover_note.trim() : null, effectiveResume]
    );

    const created = queryOne(
      `SELECT a.*, i.title as internship_title, c.company_name
       FROM applications a
       JOIN internships i ON a.internship_id = i.id
       JOIN companies c ON i.company_id = c.id
       WHERE a.id = ?`,
      [result.lastInsertRowid]
    );

    res.status(201).json({
      success: true,
      message: `Successfully applied to "${internship.title}"!`,
      data: created,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH update application status (Status Management workflow)
applicationsRouter.patch('/:id/status', validateApplicationStatus, (req: Request, res: Response, next: NextFunction) => {
  try {
    const appId = Number(req.params.id);
    const existing = queryOne('SELECT * FROM applications WHERE id = ?', [appId]);
    if (!existing) {
      throw new NotFoundError(`Application with ID ${appId} not found`);
    }

    const { status, supervisor_remarks, completion_score, completion_feedback } = req.body;

    const remarks = supervisor_remarks !== undefined ? supervisor_remarks : existing.supervisor_remarks;
    const score = completion_score !== undefined ? (completion_score ? Number(completion_score) : null) : existing.completion_score;
    const feedback = completion_feedback !== undefined ? completion_feedback : existing.completion_feedback;

    run(
      `UPDATE applications
       SET status = ?, supervisor_remarks = ?, completion_score = ?, completion_feedback = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, remarks, score, feedback, appId]
    );

    const updated = queryOne(
      `SELECT a.*,
              s.name as student_name, s.email as student_email,
              i.title as internship_title, c.company_name
       FROM applications a
       JOIN students s ON a.student_id = s.id
       JOIN internships i ON a.internship_id = i.id
       JOIN companies c ON i.company_id = c.id
       WHERE a.id = ?`,
      [appId]
    );

    res.json({
      success: true,
      message: `Application status transitioned to ${status}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE withdraw application
applicationsRouter.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const appId = Number(req.params.id);
    const existing = queryOne('SELECT id, status FROM applications WHERE id = ?', [appId]);
    if (!existing) {
      throw new NotFoundError(`Application with ID ${appId} not found`);
    }

    run('DELETE FROM applications WHERE id = ?', [appId]);
    res.json({ success: true, message: `Application ID ${appId} withdrawn successfully` });
  } catch (err) {
    next(err);
  }
});

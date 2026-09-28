import { Router, Request, Response, NextFunction } from 'express';
import { queryAll, queryOne, run } from '../db.ts';
import { validateInternship } from '../middleware/validation.ts';
import { NotFoundError } from '../errors.ts';

export const internshipsRouter = Router();

// GET all internships with relational company data and filters
internshipsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domain, role_type, status, search, company_id, min_stipend } = req.query;

    let sql = `
      SELECT i.*, 
             c.company_name, c.logo_url as company_logo, c.location as company_location, c.website as company_website,
             (SELECT COUNT(*) FROM applications WHERE internship_id = i.id) as applicants_count
      FROM internships i
      JOIN companies c ON i.company_id = c.id
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (domain && typeof domain === 'string' && domain !== 'All') {
      conditions.push('i.domain = ?');
      params.push(domain);
    }
    if (role_type && typeof role_type === 'string' && role_type !== 'All') {
      conditions.push('i.role_type = ?');
      params.push(role_type);
    }
    if (status && typeof status === 'string' && status !== 'All') {
      conditions.push('i.status = ?');
      params.push(status);
    }
    if (company_id && !isNaN(Number(company_id))) {
      conditions.push('i.company_id = ?');
      params.push(Number(company_id));
    }
    if (min_stipend && !isNaN(Number(min_stipend))) {
      conditions.push('i.stipend_amount >= ?');
      params.push(Number(min_stipend));
    }
    if (search && typeof search === 'string') {
      conditions.push('(i.title LIKE ? OR i.description LIKE ? OR c.company_name LIKE ? OR i.requirements LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY i.created_at DESC';

    const internships = queryAll(sql, params);
    res.json({ success: true, count: internships.length, data: internships });
  } catch (err) {
    next(err);
  }
});

// GET single internship
internshipsRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const internshipId = Number(req.params.id);
    const internship = queryOne(
      `SELECT i.*, 
              c.company_name, c.logo_url as company_logo, c.location as company_location, 
              c.website as company_website, c.email as company_email, c.contact_person
       FROM internships i
       JOIN companies c ON i.company_id = c.id
       WHERE i.id = ?`,
      [internshipId]
    );

    if (!internship) {
      throw new NotFoundError(`Internship with ID ${internshipId} not found`);
    }

    const applications = queryAll(
      `SELECT a.*, s.name as student_name, s.roll_number, s.department, s.cgpa, s.email as student_email
       FROM applications a
       JOIN students s ON a.student_id = s.id
       WHERE a.internship_id = ?
       ORDER BY a.applied_date DESC`,
      [internshipId]
    );

    res.json({
      success: true,
      data: {
        ...internship,
        applications,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST create internship
internshipsRouter.post('/', validateInternship, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { company_id, title, domain, role_type, location, duration_months, stipend_amount, description, requirements, vacancies, deadline, status } = req.body;

    const company = queryOne('SELECT id FROM companies WHERE id = ?', [company_id]);
    if (!company) {
      throw new NotFoundError(`Referenced company with ID ${company_id} does not exist`);
    }

    const result = run(
      `INSERT INTO internships (company_id, title, domain, role_type, location, duration_months, stipend_amount, description, requirements, vacancies, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        title.trim(),
        domain.trim(),
        role_type,
        location ? location.trim() : 'Remote',
        Number(duration_months),
        Number(stipend_amount),
        description.trim(),
        requirements ? requirements.trim() : null,
        vacancies ? Number(vacancies) : 1,
        deadline,
        status || 'ACTIVE',
      ]
    );

    const created = queryOne(
      `SELECT i.*, c.company_name, c.logo_url as company_logo
       FROM internships i
       JOIN companies c ON i.company_id = c.id
       WHERE i.id = ?`,
      [result.lastInsertRowid]
    );

    res.status(201).json({ success: true, message: 'Internship opportunity created', data: created });
  } catch (err) {
    next(err);
  }
});

// PUT update internship
internshipsRouter.put('/:id', validateInternship, (req: Request, res: Response, next: NextFunction) => {
  try {
    const internshipId = Number(req.params.id);
    const existing = queryOne('SELECT id FROM internships WHERE id = ?', [internshipId]);
    if (!existing) {
      throw new NotFoundError(`Internship with ID ${internshipId} not found`);
    }

    const { company_id, title, domain, role_type, location, duration_months, stipend_amount, description, requirements, vacancies, deadline, status } = req.body;

    const company = queryOne('SELECT id FROM companies WHERE id = ?', [company_id]);
    if (!company) {
      throw new NotFoundError(`Referenced company with ID ${company_id} does not exist`);
    }

    run(
      `UPDATE internships
       SET company_id = ?, title = ?, domain = ?, role_type = ?, location = ?, duration_months = ?, stipend_amount = ?, description = ?, requirements = ?, vacancies = ?, deadline = ?, status = ?
       WHERE id = ?`,
      [
        company_id,
        title.trim(),
        domain.trim(),
        role_type,
        location ? location.trim() : 'Remote',
        Number(duration_months),
        Number(stipend_amount),
        description.trim(),
        requirements ? requirements.trim() : null,
        vacancies ? Number(vacancies) : 1,
        deadline,
        status || 'ACTIVE',
        internshipId,
      ]
    );

    const updated = queryOne(
      `SELECT i.*, c.company_name, c.logo_url as company_logo
       FROM internships i
       JOIN companies c ON i.company_id = c.id
       WHERE i.id = ?`,
      [internshipId]
    );

    res.json({ success: true, message: 'Internship updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE internship
internshipsRouter.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const internshipId = Number(req.params.id);
    const existing = queryOne('SELECT id FROM internships WHERE id = ?', [internshipId]);
    if (!existing) {
      throw new NotFoundError(`Internship with ID ${internshipId} not found`);
    }

    run('DELETE FROM internships WHERE id = ?', [internshipId]);
    res.json({ success: true, message: `Internship ID ${internshipId} deleted successfully` });
  } catch (err) {
    next(err);
  }
});

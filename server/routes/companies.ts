import { Router, Request, Response, NextFunction } from 'express';
import { queryAll, queryOne, run } from '../db.ts';
import { validateCompany } from '../middleware/validation.ts';
import { NotFoundError, ConflictError } from '../errors.ts';

export const companiesRouter = Router();

// GET all companies
companiesRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domain, search } = req.query;
    let sql = 'SELECT * FROM companies';
    const params: any[] = [];
    const conditions: string[] = [];

    if (domain && typeof domain === 'string') {
      conditions.push('domain = ?');
      params.push(domain);
    }
    if (search && typeof search === 'string') {
      conditions.push('(company_name LIKE ? OR location LIKE ? OR domain LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY company_name ASC';

    const companies = queryAll(sql, params);

    const enriched = companies.map((c: any) => {
      const activeInternships = queryOne<{ count: number }>(
        "SELECT COUNT(*) as count FROM internships WHERE company_id = ? AND status = 'ACTIVE'",
        [c.id]
      )?.count ?? 0;
      const totalInternships = queryOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM internships WHERE company_id = ?',
        [c.id]
      )?.count ?? 0;
      return { ...c, activeInternships, totalInternships };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
});

// GET company by ID with its posted internships
companiesRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = Number(req.params.id);
    const company = queryOne('SELECT * FROM companies WHERE id = ?', [companyId]);
    if (!company) {
      throw new NotFoundError(`Company with ID ${companyId} not found`);
    }

    const internships = queryAll(
      `SELECT i.*, 
              (SELECT COUNT(*) FROM applications WHERE internship_id = i.id) as applicants_count
       FROM internships i
       WHERE i.company_id = ?
       ORDER BY i.created_at DESC`,
      [companyId]
    );

    res.json({
      success: true,
      data: {
        ...company,
        internships,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST create company
companiesRouter.post('/', validateCompany, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { company_name, domain, website, email, location, logo_url, description, contact_person } = req.body;

    const existing = queryOne('SELECT id FROM companies WHERE company_name = ?', [company_name.trim()]);
    if (existing) {
      throw new ConflictError(`Company "${company_name}" already exists in the portal`);
    }

    const result = run(
      `INSERT INTO companies (company_name, domain, website, email, location, logo_url, description, contact_person)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_name.trim(),
        domain.trim(),
        website ? website.trim() : null,
        email.trim().toLowerCase(),
        location.trim(),
        logo_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
        description || null,
        contact_person || null,
      ]
    );

    const created = queryOne('SELECT * FROM companies WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, message: 'Company registered successfully', data: created });
  } catch (err) {
    next(err);
  }
});

// PUT update company
companiesRouter.put('/:id', validateCompany, (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = Number(req.params.id);
    const existing = queryOne('SELECT * FROM companies WHERE id = ?', [companyId]);
    if (!existing) {
      throw new NotFoundError(`Company with ID ${companyId} not found`);
    }

    const { company_name, domain, website, email, location, logo_url, description, contact_person } = req.body;

    const duplicate = queryOne('SELECT id FROM companies WHERE company_name = ? AND id != ?', [company_name.trim(), companyId]);
    if (duplicate) {
      throw new ConflictError(`Another company with name "${company_name}" already exists`);
    }

    run(
      `UPDATE companies
       SET company_name = ?, domain = ?, website = ?, email = ?, location = ?, logo_url = ?, description = ?, contact_person = ?
       WHERE id = ?`,
      [
        company_name.trim(),
        domain.trim(),
        website ? website.trim() : null,
        email.trim().toLowerCase(),
        location.trim(),
        logo_url || existing.logo_url,
        description || null,
        contact_person || null,
        companyId,
      ]
    );

    const updated = queryOne('SELECT * FROM companies WHERE id = ?', [companyId]);
    res.json({ success: true, message: 'Company updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE company
companiesRouter.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = Number(req.params.id);
    const company = queryOne('SELECT id FROM companies WHERE id = ?', [companyId]);
    if (!company) {
      throw new NotFoundError(`Company with ID ${companyId} not found`);
    }

    run('DELETE FROM companies WHERE id = ?', [companyId]);
    res.json({ success: true, message: `Company ID ${companyId} and associated internships deleted` });
  } catch (err) {
    next(err);
  }
});

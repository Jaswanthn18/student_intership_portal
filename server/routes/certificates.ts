import { Router, Request, Response, NextFunction } from 'express';
import { queryAll, queryOne, run } from '../db.ts';
import { validateCertificate } from '../middleware/validation.ts';
import { NotFoundError } from '../errors.ts';

export const certificatesRouter = Router();

// GET all certificates
certificatesRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { student_id, verified } = req.query;
    let sql = `
      SELECT cert.*, 
             s.name as student_name, s.roll_number as student_roll, s.department as student_dept,
             i.title as internship_title, c.company_name
      FROM certificates cert
      JOIN students s ON cert.student_id = s.id
      LEFT JOIN applications a ON cert.application_id = a.id
      LEFT JOIN internships i ON a.internship_id = i.id
      LEFT JOIN companies c ON i.company_id = c.id
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (student_id && !isNaN(Number(student_id))) {
      conditions.push('cert.student_id = ?');
      params.push(Number(student_id));
    }
    if (verified !== undefined && verified !== '') {
      conditions.push('cert.verified_by_dept = ?');
      params.push(verified === 'true' || verified === '1' ? 1 : 0);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY cert.created_at DESC';

    const certificates = queryAll(sql, params);
    res.json({ success: true, count: certificates.length, data: certificates });
  } catch (err) {
    next(err);
  }
});

// GET single certificate
certificatesRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const certId = Number(req.params.id);
    const cert = queryOne(
      `SELECT cert.*, 
              s.name as student_name, s.roll_number as student_roll, s.department as student_dept,
              i.title as internship_title, c.company_name
       FROM certificates cert
       JOIN students s ON cert.student_id = s.id
       LEFT JOIN applications a ON cert.application_id = a.id
       LEFT JOIN internships i ON a.internship_id = i.id
       LEFT JOIN companies c ON i.company_id = c.id
       WHERE cert.id = ?`,
      [certId]
    );

    if (!cert) {
      throw new NotFoundError(`Certificate with ID ${certId} not found`);
    }

    res.json({ success: true, data: cert });
  } catch (err) {
    next(err);
  }
});

// POST upload certificate information
certificatesRouter.post('/', validateCertificate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { student_id, application_id, title, issuing_org, issue_date, credential_id, credential_url } = req.body;

    const student = queryOne('SELECT id FROM students WHERE id = ?', [student_id]);
    if (!student) {
      throw new NotFoundError(`Student with ID ${student_id} not found`);
    }

    let validAppId = null;
    if (application_id && !isNaN(Number(application_id))) {
      const app = queryOne('SELECT id FROM applications WHERE id = ?', [Number(application_id)]);
      if (app) {
        validAppId = Number(application_id);
      }
    }

    const result = run(
      `INSERT INTO certificates (student_id, application_id, title, issuing_org, issue_date, credential_id, credential_url, verified_by_dept)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        student_id,
        validAppId,
        title.trim(),
        issuing_org.trim(),
        issue_date,
        credential_id ? credential_id.trim() : null,
        credential_url ? credential_url.trim() : null,
      ]
    );

    const created = queryOne('SELECT * FROM certificates WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, message: 'Certificate recorded successfully', data: created });
  } catch (err) {
    next(err);
  }
});

// PATCH verify certificate by department
certificatesRouter.patch('/:id/verify', (req: Request, res: Response, next: NextFunction) => {
  try {
    const certId = Number(req.params.id);
    const existing = queryOne('SELECT id, verified_by_dept FROM certificates WHERE id = ?', [certId]);
    if (!existing) {
      throw new NotFoundError(`Certificate with ID ${certId} not found`);
    }

    const { verified } = req.body;
    const isVerified = verified !== undefined ? (verified ? 1 : 0) : 1;
    const verifiedAt = isVerified ? new Date().toISOString() : null;

    run(
      'UPDATE certificates SET verified_by_dept = ?, verified_at = ? WHERE id = ?',
      [isVerified, verifiedAt, certId]
    );

    const updated = queryOne('SELECT * FROM certificates WHERE id = ?', [certId]);
    res.json({
      success: true,
      message: isVerified ? 'Certificate verified by department coordinator' : 'Certificate marked as pending verification',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE certificate
certificatesRouter.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const certId = Number(req.params.id);
    const existing = queryOne('SELECT id FROM certificates WHERE id = ?', [certId]);
    if (!existing) {
      throw new NotFoundError(`Certificate with ID ${certId} not found`);
    }

    run('DELETE FROM certificates WHERE id = ?', [certId]);
    res.json({ success: true, message: `Certificate ID ${certId} deleted` });
  } catch (err) {
    next(err);
  }
});

import { Router, Request, Response, NextFunction } from 'express';
import { queryAll, queryOne, run } from '../db.ts';
import { validateSkill, validateStudentSkill } from '../middleware/validation.ts';
import { NotFoundError, ConflictError } from '../errors.ts';

export const skillsRouter = Router();

// GET all master skills
skillsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM skills';
    const conditions: string[] = [];
    const params: any[] = [];

    if (category && typeof category === 'string' && category !== 'All') {
      conditions.push('category = ?');
      params.push(category);
    }
    if (search && typeof search === 'string') {
      conditions.push('(name LIKE ? OR category LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY category ASC, name ASC';

    const skills = queryAll(sql, params);

    // Count how many students have acquired each skill
    const enriched = skills.map((sk: any) => {
      const studentCount = queryOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM student_skills WHERE skill_id = ?',
        [sk.id]
      )?.count ?? 0;
      return { ...sk, studentCount };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    next(err);
  }
});

// POST create skill in master catalog
skillsRouter.post('/', validateSkill, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, description } = req.body;
    const existing = queryOne('SELECT id FROM skills WHERE LOWER(name) = LOWER(?)', [name.trim()]);
    if (existing) {
      throw new ConflictError(`Skill "${name}" already exists in the catalog`);
    }

    const result = run(
      'INSERT INTO skills (name, category, description) VALUES (?, ?, ?)',
      [name.trim(), category.trim(), description ? description.trim() : null]
    );

    const created = queryOne('SELECT * FROM skills WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, message: 'Skill added to catalog', data: created });
  } catch (err) {
    next(err);
  }
});

// PUT update skill
skillsRouter.put('/:id', validateSkill, (req: Request, res: Response, next: NextFunction) => {
  try {
    const skillId = Number(req.params.id);
    const existing = queryOne('SELECT id FROM skills WHERE id = ?', [skillId]);
    if (!existing) {
      throw new NotFoundError(`Skill with ID ${skillId} not found`);
    }

    const { name, category, description } = req.body;
    const duplicate = queryOne('SELECT id FROM skills WHERE LOWER(name) = LOWER(?) AND id != ?', [name.trim(), skillId]);
    if (duplicate) {
      throw new ConflictError(`Skill "${name}" already exists`);
    }

    run(
      'UPDATE skills SET name = ?, category = ?, description = ? WHERE id = ?',
      [name.trim(), category.trim(), description ? description.trim() : null, skillId]
    );

    const updated = queryOne('SELECT * FROM skills WHERE id = ?', [skillId]);
    res.json({ success: true, message: 'Skill updated', data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE skill from catalog
skillsRouter.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const skillId = Number(req.params.id);
    const existing = queryOne('SELECT id FROM skills WHERE id = ?', [skillId]);
    if (!existing) {
      throw new NotFoundError(`Skill with ID ${skillId} not found`);
    }

    run('DELETE FROM skills WHERE id = ?', [skillId]);
    res.json({ success: true, message: `Skill ID ${skillId} deleted` });
  } catch (err) {
    next(err);
  }
});

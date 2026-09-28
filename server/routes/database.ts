import { Router, Request, Response, NextFunction } from 'express';
import { queryAll, run, exportMySQLDump } from '../db.ts';
import { AppError } from '../errors.ts';

export const databaseRouter = Router();

// GET database schema summary
databaseRouter.get('/schema', (req: Request, res: Response, next: NextFunction) => {
  try {
    const tables = [
      'students',
      'companies',
      'internships',
      'skills',
      'student_skills',
      'applications',
      'certificates',
    ];

    const schemaInfo = tables.map((tableName) => {
      const columns = queryAll(`PRAGMA table_info(${tableName});`);
      const foreignKeys = queryAll(`PRAGMA foreign_key_list(${tableName});`);
      const rowCount = queryAll(`SELECT COUNT(*) as count FROM ${tableName};`)[0]?.count ?? 0;

      return {
        table: tableName,
        rowCount,
        columns: columns.map((col: any) => ({
          cid: col.cid,
          name: col.name,
          type: col.type,
          notnull: col.notnull === 1,
          dflt_value: col.dflt_value,
          pk: col.pk === 1,
        })),
        foreignKeys: foreignKeys.map((fk: any) => ({
          id: fk.id,
          from: fk.from,
          to: fk.to,
          table: fk.table,
          on_update: fk.on_update,
          on_delete: fk.on_delete,
        })),
      };
    });

    res.json({ success: true, data: schemaInfo });
  } catch (err) {
    next(err);
  }
});

// POST execute custom SQL query
databaseRouter.post('/query', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
      throw new AppError('SQL statement is required', 400, 'VALIDATION_ERROR');
    }

    const trimmed = sql.trim();
    const startTime = performance.now();

    // Check query type
    const isSelect = /^SELECT\s+/i.test(trimmed) || /^PRAGMA\s+/i.test(trimmed) || /^EXPLAIN\s+/i.test(trimmed);

    if (isSelect) {
      const rows = queryAll(trimmed);
      const executionTimeMs = +(performance.now() - startTime).toFixed(2);
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      res.json({
        success: true,
        type: 'SELECT',
        rowCount: rows.length,
        columns,
        rows,
        executionTimeMs,
      });
    } else {
      // Execute mutation query
      const result = run(trimmed);
      const executionTimeMs = +(performance.now() - startTime).toFixed(2);

      res.json({
        success: true,
        type: 'MUTATION',
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid,
        executionTimeMs,
        message: `Query executed successfully (${result.changes} rows affected)`,
      });
    }
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: {
        code: 'SQL_SYNTAX_OR_EXECUTION_ERROR',
        message: err.message || 'Error executing SQL statement',
      },
    });
  }
});

// GET MySQL dump file
databaseRouter.get('/export-mysql', (req: Request, res: Response, next: NextFunction) => {
  try {
    const dump = exportMySQLDump();
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="student_internship_portal_mysql.sql"');
    res.send(dump);
  } catch (err) {
    next(err);
  }
});

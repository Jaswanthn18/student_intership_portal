import { Router, Request, Response, NextFunction } from 'express';
import { queryAll, queryOne } from '../db.ts';

export const analyticsRouter = Router();

analyticsRouter.get('/overview', (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalStudents = queryOne<{ c: number }>('SELECT COUNT(*) as c FROM students')?.c ?? 0;
    const totalCompanies = queryOne<{ c: number }>('SELECT COUNT(*) as c FROM companies')?.c ?? 0;
    const totalInternships = queryOne<{ c: number }>('SELECT COUNT(*) as c FROM internships')?.c ?? 0;
    const activeInternships = queryOne<{ c: number }>("SELECT COUNT(*) as c FROM internships WHERE status = 'ACTIVE'")?.c ?? 0;
    const totalApplications = queryOne<{ c: number }>('SELECT COUNT(*) as c FROM applications')?.c ?? 0;
    const completedInternships = queryOne<{ c: number }>("SELECT COUNT(*) as c FROM applications WHERE status = 'COMPLETED'")?.c ?? 0;
    const acceptedOffers = queryOne<{ c: number }>("SELECT COUNT(*) as c FROM applications WHERE status IN ('ACCEPTED', 'COMPLETED')")?.c ?? 0;
    const totalCertificates = queryOne<{ c: number }>('SELECT COUNT(*) as c FROM certificates')?.c ?? 0;
    const verifiedCertificates = queryOne<{ c: number }>('SELECT COUNT(*) as c FROM certificates WHERE verified_by_dept = 1')?.c ?? 0;

    // Applications by status
    const statusBreakdown = queryAll<{ status: string; count: number }>(
      'SELECT status, COUNT(*) as count FROM applications GROUP BY status'
    );

    // Internships by domain
    const domainBreakdown = queryAll<{ domain: string; count: number }>(
      'SELECT domain, COUNT(*) as count FROM internships GROUP BY domain ORDER BY count DESC'
    );

    // Top skills acquired by students
    const topSkills = queryAll<{ name: string; category: string; count: number }>(
      `SELECT s.name, s.category, COUNT(ss.id) as count
       FROM skills s
       JOIN student_skills ss ON s.id = ss.skill_id
       GROUP BY s.id
       ORDER BY count DESC
       LIMIT 8`
    );

    // Placement / conversion rate
    const placementRate = totalStudents > 0 ? Math.round((acceptedOffers / totalStudents) * 100) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalCompanies,
          totalInternships,
          activeInternships,
          totalApplications,
          completedInternships,
          acceptedOffers,
          placementRate,
          totalCertificates,
          verifiedCertificates,
        },
        statusBreakdown,
        domainBreakdown,
        topSkills,
      },
    });
  } catch (err) {
    next(err);
  }
});

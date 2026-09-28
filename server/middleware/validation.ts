import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors.ts';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const VALID_APPLICATION_STATUSES = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'ACCEPTED',
  'COMPLETED',
  'REJECTED',
] as const;

export const VALID_PROFICIENCY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
] as const;

export function validateStudent(req: Request, res: Response, next: NextFunction) {
  const { name, email, roll_number, department, batch_year, cgpa } = req.body;
  const errors: Record<string, string> = {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Full name is required';
  }
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Valid institutional or personal email is required';
  }
  if (!roll_number || typeof roll_number !== 'string' || roll_number.trim().length === 0) {
    errors.roll_number = 'Roll / Registration Number is required';
  }
  if (!department || typeof department !== 'string' || department.trim().length === 0) {
    errors.department = 'Academic department is required';
  }
  const year = Number(batch_year);
  if (isNaN(year) || year < 2000 || year > 2040) {
    errors.batch_year = 'Valid graduation batch year is required (e.g. 2025)';
  }
  const numCgpa = Number(cgpa);
  if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10.0) {
    errors.cgpa = 'CGPA must be a valid number between 0.0 and 10.0';
  }

  if (Object.keys(errors).length > 0) {
    return next(new ValidationError('Student validation failed', errors));
  }
  next();
}

export function validateCompany(req: Request, res: Response, next: NextFunction) {
  const { company_name, domain, email, location } = req.body;
  const errors: Record<string, string> = {};

  if (!company_name || typeof company_name !== 'string' || company_name.trim().length === 0) {
    errors.company_name = 'Company name is required';
  }
  if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
    errors.domain = 'Company industry domain is required';
  }
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Valid company contact email is required';
  }
  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    errors.location = 'Headquarters / operating location is required';
  }

  if (Object.keys(errors).length > 0) {
    return next(new ValidationError('Company validation failed', errors));
  }
  next();
}

export function validateInternship(req: Request, res: Response, next: NextFunction) {
  const { company_id, title, domain, role_type, duration_months, stipend_amount, deadline, description } = req.body;
  const errors: Record<string, string> = {};

  if (!company_id || isNaN(Number(company_id))) {
    errors.company_id = 'A valid associated company ID is required';
  }
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.title = 'Internship role title is required';
  }
  if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
    errors.domain = 'Domain (e.g. Web Development, AI/ML, Cloud) is required';
  }
  if (!role_type || !['Remote', 'On-site', 'Hybrid'].includes(role_type)) {
    errors.role_type = 'Role type must be Remote, On-site, or Hybrid';
  }
  const duration = Number(duration_months);
  if (isNaN(duration) || duration < 1 || duration > 24) {
    errors.duration_months = 'Duration must be between 1 and 24 months';
  }
  const stipend = Number(stipend_amount);
  if (isNaN(stipend) || stipend < 0) {
    errors.stipend_amount = 'Monthly stipend amount must be a positive number or 0';
  }
  if (!deadline || isNaN(Date.parse(deadline))) {
    errors.deadline = 'Valid application deadline date is required (YYYY-MM-DD)';
  }
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.description = 'A detailed internship description (at least 10 characters) is required';
  }

  if (Object.keys(errors).length > 0) {
    return next(new ValidationError('Internship validation failed', errors));
  }
  next();
}

export function validateApplication(req: Request, res: Response, next: NextFunction) {
  const { student_id, internship_id } = req.body;
  const errors: Record<string, string> = {};

  if (!student_id || isNaN(Number(student_id))) {
    errors.student_id = 'Valid student ID is required';
  }
  if (!internship_id || isNaN(Number(internship_id))) {
    errors.internship_id = 'Valid internship opportunity ID is required';
  }

  if (Object.keys(errors).length > 0) {
    return next(new ValidationError('Application submission validation failed', errors));
  }
  next();
}

export function validateApplicationStatus(req: Request, res: Response, next: NextFunction) {
  const { status, supervisor_remarks, completion_score } = req.body;
  const errors: Record<string, string> = {};

  if (!status || !VALID_APPLICATION_STATUSES.includes(status)) {
    errors.status = `Invalid status. Must be one of: ${VALID_APPLICATION_STATUSES.join(', ')}`;
  }

  if (completion_score !== undefined && completion_score !== null && completion_score !== '') {
    const score = Number(completion_score);
    if (isNaN(score) || score < 0 || score > 100) {
      errors.completion_score = 'Completion score must be a number between 0 and 100';
    }
  }

  if (Object.keys(errors).length > 0) {
    return next(new ValidationError('Status update validation failed', errors));
  }
  next();
}

export function validateSkill(req: Request, res: Response, next: NextFunction) {
  const { name, category } = req.body;
  const errors: Record<string, string> = {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Skill name is required';
  }
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.category = 'Skill category is required';
  }

  if (Object.keys(errors).length > 0) {
    return next(new ValidationError('Skill validation failed', errors));
  }
  next();
}

export function validateStudentSkill(req: Request, res: Response, next: NextFunction) {
  const { student_id, skill_id, proficiency_level } = req.body;
  const errors: Record<string, string> = {};

  if (!student_id || isNaN(Number(student_id))) {
    errors.student_id = 'Valid student ID is required';
  }
  if (!skill_id || isNaN(Number(skill_id))) {
    errors.skill_id = 'Valid skill ID is required';
  }
  if (!proficiency_level || !VALID_PROFICIENCY_LEVELS.includes(proficiency_level)) {
    errors.proficiency_level = `Proficiency level must be one of: ${VALID_PROFICIENCY_LEVELS.join(', ')}`;
  }

  if (Object.keys(errors).length > 0) {
    return next(new ValidationError('Student skill mapping validation failed', errors));
  }
  next();
}

export function validateCertificate(req: Request, res: Response, next: NextFunction) {
  const { student_id, title, issuing_org, issue_date } = req.body;
  const errors: Record<string, string> = {};

  if (!student_id || isNaN(Number(student_id))) {
    errors.student_id = 'Valid student ID is required';
  }
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.title = 'Certificate title is required';
  }
  if (!issuing_org || typeof issuing_org !== 'string' || issuing_org.trim().length === 0) {
    errors.issuing_org = 'Issuing organization or company is required';
  }
  if (!issue_date || isNaN(Date.parse(issue_date))) {
    errors.issue_date = 'Valid issue date is required (YYYY-MM-DD)';
  }

  if (Object.keys(errors).length > 0) {
    return next(new ValidationError('Certificate validation failed', errors));
  }
  next();
}

export interface Student {
  id: number;
  roll_number: string;
  name: string;
  email: string;
  department: string;
  batch_year: number;
  cgpa: number;
  phone?: string | null;
  bio?: string | null;
  resume_url?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  skillsCount?: number;
  appsCount?: number;
  certsCount?: number;
  skills?: StudentSkill[];
  applications?: Application[];
  certificates?: Certificate[];
}

export interface Company {
  id: number;
  company_name: string;
  domain: string;
  website?: string | null;
  email: string;
  location: string;
  logo_url?: string | null;
  description?: string | null;
  contact_person?: string | null;
  created_at?: string;
  activeInternships?: number;
  totalInternships?: number;
  internships?: Internship[];
}

export interface Internship {
  id: number;
  company_id: number;
  company_name?: string;
  company_logo?: string | null;
  company_location?: string;
  company_website?: string | null;
  title: string;
  domain: string;
  role_type: 'Remote' | 'On-site' | 'Hybrid';
  location: string;
  duration_months: number;
  stipend_amount: number;
  description: string;
  requirements?: string | null;
  vacancies: number;
  deadline: string;
  status: 'ACTIVE' | 'CLOSING_SOON' | 'CLOSED';
  created_at?: string;
  applicants_count?: number;
  applications?: Application[];
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string | null;
  created_at?: string;
  studentCount?: number;
}

export interface StudentSkill {
  id?: number;
  student_skill_id?: number;
  student_id: number;
  skill_id: number;
  skill_name?: string;
  skill_category?: string;
  skill_description?: string | null;
  proficiency_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  certified: number | boolean;
  acquired_date?: string | null;
  created_at?: string;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'REJECTED';

export interface Application {
  id: number;
  student_id: number;
  internship_id: number;
  status: ApplicationStatus;
  applied_date: string;
  cover_note?: string | null;
  resume_link?: string | null;
  supervisor_remarks?: string | null;
  completion_score?: number | null;
  completion_feedback?: string | null;
  updated_at?: string;
  student_name?: string;
  student_roll?: string;
  student_email?: string;
  student_department?: string;
  student_cgpa?: number;
  student_avatar?: string;
  internship_title?: string;
  internship_domain?: string;
  role_type?: string;
  duration_months?: number;
  stipend_amount?: number;
  company_name?: string;
  company_logo?: string;
}

export interface Certificate {
  id: number;
  student_id: number;
  application_id?: number | null;
  title: string;
  issuing_org: string;
  issue_date: string;
  credential_id?: string | null;
  credential_url?: string | null;
  verified_by_dept: number | boolean;
  verified_at?: string | null;
  created_at?: string;
  student_name?: string;
  student_roll?: string;
  student_dept?: string;
  internship_title?: string;
  company_name?: string;
}

export interface DepartmentAnalytics {
  summary: {
    totalStudents: number;
    totalCompanies: number;
    totalInternships: number;
    activeInternships: number;
    totalApplications: number;
    completedInternships: number;
    acceptedOffers: number;
    placementRate: number;
    totalCertificates: number;
    verifiedCertificates: number;
  };
  statusBreakdown: { status: string; count: number }[];
  domainBreakdown: { domain: string; count: number }[];
  topSkills: { name: string; category: string; count: number }[];
}

export interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: any;
  pk: boolean;
}

export interface TableForeignKey {
  id: number;
  from: string;
  to: string;
  table: string;
  on_update: string;
  on_delete: string;
}

export interface TableSchemaInfo {
  table: string;
  rowCount: number;
  columns: TableColumn[];
  foreignKeys: TableForeignKey[];
}

export interface SqlQueryResult {
  success: boolean;
  type?: 'SELECT' | 'MUTATION';
  rowCount?: number;
  columns?: string[];
  rows?: any[];
  changes?: number;
  executionTimeMs?: number;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

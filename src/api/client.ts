import {
  Student,
  Company,
  Internship,
  Skill,
  StudentSkill,
  Application,
  Certificate,
  DepartmentAnalytics,
  TableSchemaInfo,
  SqlQueryResult,
} from '../types/index.ts';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    const errorMsg = data.error?.message || data.message || `HTTP Error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Students
  async getStudents(params?: { department?: string; search?: string }): Promise<Student[]> {
    const query = new URLSearchParams();
    if (params?.department) query.set('department', params.department);
    if (params?.search) query.set('search', params.search);
    const res = await request<{ data: Student[] }>(`/students?${query.toString()}`);
    return res.data;
  },

  async getStudentById(id: number): Promise<Student> {
    const res = await request<{ data: Student }>(`/students/${id}`);
    return res.data;
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    const res = await request<{ data: Student }>('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
    return res.data;
  },

  async updateStudent(id: number, studentData: Partial<Student>): Promise<Student> {
    const res = await request<{ data: Student }>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
    return res.data;
  },

  async deleteStudent(id: number): Promise<void> {
    await request(`/students/${id}`, { method: 'DELETE' });
  },

  async addStudentSkill(studentId: number, skillData: { skill_id: number; proficiency_level: string; certified?: boolean; acquired_date?: string }): Promise<StudentSkill> {
    const res = await request<{ data: StudentSkill }>(`/students/${studentId}/skills`, {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
    return res.data;
  },

  async removeStudentSkill(studentId: number, studentSkillId: number): Promise<void> {
    await request(`/students/${studentId}/skills/${studentSkillId}`, { method: 'DELETE' });
  },

  // Companies
  async getCompanies(params?: { domain?: string; search?: string }): Promise<Company[]> {
    const query = new URLSearchParams();
    if (params?.domain) query.set('domain', params.domain);
    if (params?.search) query.set('search', params.search);
    const res = await request<{ data: Company[] }>(`/companies?${query.toString()}`);
    return res.data;
  },

  async getCompanyById(id: number): Promise<Company> {
    const res = await request<{ data: Company }>(`/companies/${id}`);
    return res.data;
  },

  async createCompany(companyData: Partial<Company>): Promise<Company> {
    const res = await request<{ data: Company }>('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
    return res.data;
  },

  async updateCompany(id: number, companyData: Partial<Company>): Promise<Company> {
    const res = await request<{ data: Company }>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
    return res.data;
  },

  async deleteCompany(id: number): Promise<void> {
    await request(`/companies/${id}`, { method: 'DELETE' });
  },

  // Internships
  async getInternships(filters?: {
    domain?: string;
    role_type?: string;
    status?: string;
    search?: string;
    company_id?: number;
    min_stipend?: number;
  }): Promise<Internship[]> {
    const query = new URLSearchParams();
    if (filters?.domain) query.set('domain', filters.domain);
    if (filters?.role_type) query.set('role_type', filters.role_type);
    if (filters?.status) query.set('status', filters.status);
    if (filters?.search) query.set('search', filters.search);
    if (filters?.company_id) query.set('company_id', String(filters.company_id));
    if (filters?.min_stipend) query.set('min_stipend', String(filters.min_stipend));
    const res = await request<{ data: Internship[] }>(`/internships?${query.toString()}`);
    return res.data;
  },

  async getInternshipById(id: number): Promise<Internship> {
    const res = await request<{ data: Internship }>(`/internships/${id}`);
    return res.data;
  },

  async createInternship(internshipData: Partial<Internship>): Promise<Internship> {
    const res = await request<{ data: Internship }>('/internships', {
      method: 'POST',
      body: JSON.stringify(internshipData),
    });
    return res.data;
  },

  async updateInternship(id: number, internshipData: Partial<Internship>): Promise<Internship> {
    const res = await request<{ data: Internship }>(`/internships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(internshipData),
    });
    return res.data;
  },

  async deleteInternship(id: number): Promise<void> {
    await request(`/internships/${id}`, { method: 'DELETE' });
  },

  // Applications
  async getApplications(filters?: {
    status?: string;
    student_id?: number;
    internship_id?: number;
  }): Promise<Application[]> {
    const query = new URLSearchParams();
    if (filters?.status) query.set('status', filters.status);
    if (filters?.student_id) query.set('student_id', String(filters.student_id));
    if (filters?.internship_id) query.set('internship_id', String(filters.internship_id));
    const res = await request<{ data: Application[] }>(`/applications?${query.toString()}`);
    return res.data;
  },

  async submitApplication(appData: {
    student_id: number;
    internship_id: number;
    cover_note?: string;
    resume_link?: string;
  }): Promise<Application> {
    const res = await request<{ data: Application }>('/applications', {
      method: 'POST',
      body: JSON.stringify(appData),
    });
    return res.data;
  },

  async updateApplicationStatus(
    id: number,
    statusData: {
      status: string;
      supervisor_remarks?: string;
      completion_score?: number | null;
      completion_feedback?: string;
    }
  ): Promise<Application> {
    const res = await request<{ data: Application }>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
    return res.data;
  },

  async deleteApplication(id: number): Promise<void> {
    await request(`/applications/${id}`, { method: 'DELETE' });
  },

  // Skills
  async getSkills(params?: { category?: string; search?: string }): Promise<Skill[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const res = await request<{ data: Skill[] }>(`/skills?${query.toString()}`);
    return res.data;
  },

  async createSkill(skillData: { name: string; category: string; description?: string }): Promise<Skill> {
    const res = await request<{ data: Skill }>('/skills', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
    return res.data;
  },

  // Certificates
  async getCertificates(filters?: { student_id?: number; verified?: boolean }): Promise<Certificate[]> {
    const query = new URLSearchParams();
    if (filters?.student_id) query.set('student_id', String(filters.student_id));
    if (filters?.verified !== undefined) query.set('verified', String(filters.verified));
    const res = await request<{ data: Certificate[] }>(`/certificates?${query.toString()}`);
    return res.data;
  },

  async createCertificate(certData: {
    student_id: number;
    application_id?: number | null;
    title: string;
    issuing_org: string;
    issue_date: string;
    credential_id?: string;
    credential_url?: string;
  }): Promise<Certificate> {
    const res = await request<{ data: Certificate }>('/certificates', {
      method: 'POST',
      body: JSON.stringify(certData),
    });
    return res.data;
  },

  async verifyCertificate(id: number, verified: boolean): Promise<Certificate> {
    const res = await request<{ data: Certificate }>(`/certificates/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verified }),
    });
    return res.data;
  },

  async deleteCertificate(id: number): Promise<void> {
    await request(`/certificates/${id}`, { method: 'DELETE' });
  },

  // Analytics
  async getDepartmentAnalytics(): Promise<DepartmentAnalytics> {
    const res = await request<{ data: DepartmentAnalytics }>('/analytics/overview');
    return res.data;
  },

  // Database Explorer
  async getDatabaseSchema(): Promise<TableSchemaInfo[]> {
    const res = await request<{ data: TableSchemaInfo[] }>('/db/schema');
    return res.data;
  },

  async executeSqlQuery(sql: string): Promise<SqlQueryResult> {
    const res = await fetch('/api/db/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    return await res.json();
  },

  getMySQLDumpUrl(): string {
    return '/api/db/export-mysql';
  },
};

import React, { useState, useEffect } from 'react';
import { 
  Student, 
  Company, 
  Internship, 
  Skill, 
  StudentSkill, 
  Application, 
  Certificate, 
  DepartmentAnalytics, 
  ApplicationStatus 
} from './types/index.ts';
import { api } from './api/client.ts';
import { Navbar, ActiveTab } from './components/Navbar.tsx';
import { StudentProfileHeader } from './components/StudentProfileHeader.tsx';
import { StudentProfileModal } from './components/StudentProfileModal.tsx';
import { SkillManager } from './components/SkillManager.tsx';
import { InternshipCatalog } from './components/InternshipCatalog.tsx';
import { ApplicationTracker } from './components/ApplicationTracker.tsx';
import { CertificateManager } from './components/CertificateManager.tsx';
import { CompanyManager } from './components/CompanyManager.tsx';
import { DepartmentDashboard } from './components/DepartmentDashboard.tsx';
import { DatabaseExplorer } from './components/DatabaseExplorer.tsx';
import { GitWorkspace } from './components/GitWorkspace.tsx';
import { 
  GraduationCap, 
  Briefcase, 
  Award, 
  Layers, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('student');
  const [studentSubTab, setStudentSubTab] = useState<'skills' | 'browse' | 'applications' | 'certificates'>('browse');

  // Core Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [masterSkills, setMasterSkills] = useState<Skill[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [allCertificates, setAllCertificates] = useState<Certificate[]>([]);
  const [analytics, setAnalytics] = useState<DepartmentAnalytics | null>(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [prefillCertApp, setPrefillCertApp] = useState<Application | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [fetchedStudents, fetchedSkills, fetchedCompanies, fetchedInternships, fetchedApps, fetchedCerts, fetchedAnalytics] =
        await Promise.all([
          api.getStudents(),
          api.getSkills(),
          api.getCompanies(),
          api.getInternships(),
          api.getApplications(),
          api.getCertificates(),
          api.getDepartmentAnalytics(),
        ]);

      setStudents(fetchedStudents);
      setMasterSkills(fetchedSkills);
      setCompanies(fetchedCompanies);
      setInternships(fetchedInternships);
      setAllApplications(fetchedApps);
      setAllCertificates(fetchedCerts);
      setAnalytics(fetchedAnalytics);

      if (fetchedStudents.length > 0) {
        // Load detailed current student
        const detailed = await api.getStudentById(fetchedStudents[0].id);
        setCurrentStudent(detailed);
      }
    } catch (err: any) {
      console.error('Initialization error:', err);
      showToast('Error loading portal data: ' + (err.message || 'Server offline'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student: Student) => {
    try {
      const detailed = await api.getStudentById(student.id);
      setCurrentStudent(detailed);
    } catch (err: any) {
      showToast('Error fetching student details', 'error');
    }
  };

  const refreshStudent = async (id: number) => {
    try {
      const updated = await api.getStudentById(id);
      setCurrentStudent(updated);
      // Refresh list to update counts
      const list = await api.getStudents();
      setStudents(list);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshPortalData = async () => {
    try {
      const [fetchedInternships, fetchedApps, fetchedCerts, fetchedAnalytics, fetchedCompanies] =
        await Promise.all([
          api.getInternships(),
          api.getApplications(),
          api.getCertificates(),
          api.getDepartmentAnalytics(),
          api.getCompanies(),
        ]);
      setInternships(fetchedInternships);
      setAllApplications(fetchedApps);
      setAllCertificates(fetchedCerts);
      setAnalytics(fetchedAnalytics);
      setCompanies(fetchedCompanies);

      if (currentStudent) {
        await refreshStudent(currentStudent.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Student Profile Actions
  const handleSaveStudent = async (data: Partial<Student>) => {
    if (editingStudent) {
      await api.updateStudent(editingStudent.id, data);
      showToast('Student profile updated successfully');
      await refreshStudent(editingStudent.id);
    } else {
      const created = await api.createStudent(data);
      showToast(`Enrolled student ${created.name}`);
      const list = await api.getStudents();
      setStudents(list);
      await handleSelectStudent(created);
    }
  };

  // Skills Actions
  const handleAddSkillToStudent = async (skillData: {
    skill_id: number;
    proficiency_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    certified: boolean;
    acquired_date: string;
  }) => {
    if (!currentStudent) return;
    await api.addStudentSkill(currentStudent.id, skillData);
    showToast('Technical skill linked to student profile');
    await refreshStudent(currentStudent.id);
    const analyticsData = await api.getDepartmentAnalytics();
    setAnalytics(analyticsData);
  };

  const handleRemoveSkill = async (studentSkillId: number) => {
    if (!currentStudent) return;
    await api.removeStudentSkill(currentStudent.id, studentSkillId);
    showToast('Skill removed from profile');
    await refreshStudent(currentStudent.id);
    const analyticsData = await api.getDepartmentAnalytics();
    setAnalytics(analyticsData);
  };

  const handleCreateMasterSkill = async (skillData: { name: string; category: string; description: string }) => {
    await api.createSkill(skillData);
    showToast(`Registered skill "${skillData.name}" in master catalog`);
    const skillsList = await api.getSkills();
    setMasterSkills(skillsList);
  };

  // Applications Actions
  const handleApply = async (data: {
    student_id: number;
    internship_id: number;
    cover_note: string;
    resume_link: string;
  }) => {
    await api.submitApplication(data);
    showToast('Internship application submitted successfully!');
    await refreshPortalData();
    setStudentSubTab('applications');
  };

  const handleWithdrawApplication = async (appId: number) => {
    await api.deleteApplication(appId);
    showToast('Application withdrawn successfully');
    await refreshPortalData();
  };

  const handleUpdateApplicationStatus = async (
    appId: number,
    data: {
      status: ApplicationStatus;
      supervisor_remarks?: string;
      completion_score?: number | null;
      completion_feedback?: string;
    }
  ) => {
    await api.updateApplicationStatus(appId, data);
    showToast(`Application transitioned to ${data.status}`);
    await refreshPortalData();
  };

  // Certificates Actions
  const handleAddCertificate = async (certData: {
    student_id: number;
    application_id?: number | null;
    title: string;
    issuing_org: string;
    issue_date: string;
    credential_id?: string;
    credential_url?: string;
  }) => {
    await api.createCertificate(certData);
    showToast('Certificate uploaded and queued for department verification');
    await refreshPortalData();
  };

  const handleDeleteCertificate = async (id: number) => {
    await api.deleteCertificate(id);
    showToast('Certificate removed');
    await refreshPortalData();
  };

  const handleVerifyCertificate = async (id: number, verified: boolean) => {
    await api.verifyCertificate(id, verified);
    showToast(verified ? 'Certificate verified and stamped by department' : 'Certificate marked pending');
    await refreshPortalData();
  };

  // Company & Internship Management Actions
  const handleCreateCompany = async (companyData: Partial<Company>) => {
    await api.createCompany(companyData);
    showToast(`Registered company "${companyData.company_name}"`);
    await refreshPortalData();
  };

  const handleCreateInternship = async (internshipData: Partial<Internship>) => {
    await api.createInternship(internshipData);
    showToast(`Published internship role "${internshipData.title}"`);
    await refreshPortalData();
  };

  // Completed applications for current student (eligible for certificate linking)
  const studentCompletedApps = (currentStudent?.applications || []).filter(
    (a) => a.status === 'COMPLETED'
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-medium border animate-slideUp ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950 border-rose-500/50 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        students={students}
        currentStudent={currentStudent}
        onSelectStudent={handleSelectStudent}
        onOpenCreateStudent={() => {
          setEditingStudent(null);
          setIsStudentModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading Student Internship & Skill Portal...</p>
          </div>
        ) : (
          <>
            {/* VIEW 1: STUDENT PORTFOLIO */}
            {activeTab === 'student' && currentStudent && (
              <div className="space-y-6">
                {/* Student Profile Header Card */}
                <StudentProfileHeader
                  student={currentStudent}
                  onEdit={() => {
                    setEditingStudent(currentStudent);
                    setIsStudentModalOpen(true);
                  }}
                />

                {/* Sub-Navigation for Student Portal */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setStudentSubTab('browse')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                      studentSubTab === 'browse'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Browse Internships</span>
                  </button>

                  <button
                    onClick={() => setStudentSubTab('skills')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                      studentSubTab === 'skills'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>My Technical Skills ({currentStudent.skills?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setStudentSubTab('applications')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                      studentSubTab === 'applications'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Application Status Tracker ({currentStudent.applications?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setStudentSubTab('certificates')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                      studentSubTab === 'certificates'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Certificates & Credentials ({currentStudent.certificates?.length || 0})</span>
                  </button>
                </div>

                {/* Sub Tab Views */}
                {studentSubTab === 'browse' && (
                  <InternshipCatalog
                    internships={internships}
                    student={currentStudent}
                    studentApplications={currentStudent.applications || []}
                    onApplySubmit={handleApply}
                    onApplySuccess={refreshPortalData}
                  />
                )}

                {studentSubTab === 'skills' && (
                  <SkillManager
                    studentId={currentStudent.id}
                    studentSkills={currentStudent.skills || []}
                    masterSkills={masterSkills}
                    onAddSkill={handleAddSkillToStudent}
                    onRemoveSkill={handleRemoveSkill}
                    onCreateMasterSkill={handleCreateMasterSkill}
                  />
                )}

                {studentSubTab === 'applications' && (
                  <ApplicationTracker
                    applications={currentStudent.applications || []}
                    onWithdrawApplication={handleWithdrawApplication}
                    onOpenCertificateUpload={(app) => {
                      setPrefillCertApp(app);
                      setStudentSubTab('certificates');
                    }}
                  />
                )}

                {studentSubTab === 'certificates' && (
                  <CertificateManager
                    studentId={currentStudent.id}
                    certificates={currentStudent.certificates || []}
                    completedApplications={studentCompletedApps}
                    onAddCertificate={handleAddCertificate}
                    onDeleteCertificate={handleDeleteCertificate}
                    initialPrefillApp={prefillCertApp}
                    onClearPrefill={() => setPrefillCertApp(null)}
                  />
                )}
              </div>
            )}

            {/* VIEW 2: COMPANIES & POSTINGS */}
            {activeTab === 'companies' && (
              <CompanyManager
                companies={companies}
                internships={internships}
                onCreateCompany={handleCreateCompany}
                onCreateInternship={handleCreateInternship}
              />
            )}

            {/* VIEW 3: DEPARTMENT COORDINATOR */}
            {activeTab === 'department' && (
              <DepartmentDashboard
                analytics={analytics}
                applications={allApplications}
                certificates={allCertificates}
                onUpdateAppStatus={handleUpdateApplicationStatus}
                onVerifyCertificate={handleVerifyCertificate}
              />
            )}

            {/* VIEW 4: MYSQL RELATIONAL DATABASE */}
            {activeTab === 'database' && <DatabaseExplorer />}

            {/* VIEW 5: GIT & GITHUB WORKSPACE */}
            {activeTab === 'git' && <GitWorkspace />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Student Internship & Skill Tracking Portal</span>
            <span>•</span>
            <span>Department of Computer Science & Engineering</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>MySQL Relational Schema</span>
            <span>•</span>
            <span>REST API v1.0</span>
            <span>•</span>
            <span>Production Grade</span>
          </div>
        </div>
      </footer>

      {/* Student Enrollment / Edit Modal */}
      <StudentProfileModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        initialStudent={editingStudent}
      />
    </div>
  );
}

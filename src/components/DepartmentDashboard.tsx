import React, { useState } from 'react';
import { 
  Application, 
  Certificate, 
  DepartmentAnalytics, 
  ApplicationStatus 
} from '../types/index.ts';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Edit3, 
  Search, 
  Filter, 
  FileText,
  Star,
  Sparkles,
  Layers
} from 'lucide-react';

interface DepartmentDashboardProps {
  analytics: DepartmentAnalytics | null;
  applications: Application[];
  certificates: Certificate[];
  onUpdateAppStatus: (
    appId: number,
    data: {
      status: ApplicationStatus;
      supervisor_remarks?: string;
      completion_score?: number | null;
      completion_feedback?: string;
    }
  ) => Promise<void>;
  onVerifyCertificate: (certId: number, verified: boolean) => Promise<void>;
}

export const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({
  analytics,
  applications,
  certificates,
  onUpdateAppStatus,
  onVerifyCertificate,
}) => {
  const [activeSection, setActiveSection] = useState<'applications' | 'certificates' | 'analytics'>('applications');
  const [appSearch, setAppSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAppForEdit, setSelectedAppForEdit] = useState<Application | null>(null);

  // Status Modal Controlled Form State
  const [editStatus, setEditStatus] = useState<ApplicationStatus>('UNDER_REVIEW');
  const [supervisorRemarks, setSupervisorRemarks] = useState('');
  const [completionScore, setCompletionScore] = useState<number | ''>('');
  const [completionFeedback, setCompletionFeedback] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter applications with .filter()
  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesSearch =
      (app.student_name?.toLowerCase() || '').includes(appSearch.toLowerCase()) ||
      (app.student_roll?.toLowerCase() || '').includes(appSearch.toLowerCase()) ||
      (app.company_name?.toLowerCase() || '').includes(appSearch.toLowerCase()) ||
      (app.internship_title?.toLowerCase() || '').includes(appSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCerts = certificates.filter((c) => !c.verified_by_dept);

  const openEditModal = (app: Application) => {
    setSelectedAppForEdit(app);
    setEditStatus(app.status);
    setSupervisorRemarks(app.supervisor_remarks || '');
    setCompletionScore(app.completion_score !== null && app.completion_score !== undefined ? app.completion_score : '');
    setCompletionFeedback(app.completion_feedback || '');
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForEdit) return;
    setIsUpdating(true);
    try {
      await onUpdateAppStatus(selectedAppForEdit.id, {
        status: editStatus,
        supervisor_remarks: supervisorRemarks.trim() || undefined,
        completion_score: completionScore !== '' ? Number(completionScore) : null,
        completion_feedback: completionFeedback.trim() || undefined,
      });
      setSelectedAppForEdit(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update application');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Students</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{analytics.summary.totalStudents}</div>
            <div className="text-[11px] text-slate-500 mt-1">Enrolled & trackable</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Companies</span>
              <Building2 className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white">{analytics.summary.totalCompanies}</div>
            <div className="text-[11px] text-slate-500 mt-1">{analytics.summary.activeInternships} active roles</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Applications</span>
              <Briefcase className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">{analytics.summary.totalApplications}</div>
            <div className="text-[11px] text-slate-500 mt-1">{analytics.summary.completedInternships} completed</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Placement Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{analytics.summary.placementRate}%</div>
            <div className="text-[11px] text-slate-500 mt-1">Offers & completions</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Verification Queue</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400">{pendingCerts.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">{analytics.summary.verifiedCertificates} verified</div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSection('applications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeSection === 'applications'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Applications Pipeline ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('certificates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeSection === 'certificates'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificate Verification ({pendingCerts.length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveSection('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeSection === 'analytics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Department Metrics & Skills</span>
        </button>
      </div>

      {/* SECTION 1: Applications Pipeline Management Table */}
      {activeSection === 'applications' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search candidate name, roll, company..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Statuses</option>
                <option value="APPLIED">APPLIED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="SHORTLISTED">SHORTLISTED</option>
                <option value="INTERVIEW">INTERVIEW</option>
                <option value="OFFERED">OFFERED</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Role & Company</th>
                    <th className="p-3.5">Domain</th>
                    <th className="p-3.5">Applied Date</th>
                    <th className="p-3.5">Pipeline Status</th>
                    <th className="p-3.5">Score / Remarks</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-850/50 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={app.student_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={app.student_name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-white">{app.student_name}</div>
                            <div className="text-[11px] text-slate-400">
                              {app.student_roll} • CGPA {app.student_cgpa}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-white">{app.internship_title}</div>
                        <div className="text-slate-400">{app.company_name}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {app.internship_domain}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-400">
                        {app.applied_date ? app.applied_date.slice(0, 10) : 'Recent'}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            app.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : app.status === 'OFFERED' || app.status === 'ACCEPTED'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : app.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {app.completion_score !== null && app.completion_score !== undefined ? (
                          <span className="font-bold text-emerald-400">{app.completion_score}%</span>
                        ) : app.supervisor_remarks ? (
                          <span className="text-slate-400 truncate max-w-[120px] block" title={app.supervisor_remarks}>
                            {app.supervisor_remarks}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => openEditModal(app)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-medium text-xs transition inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Certificate Verification Queue */}
      {activeSection === 'certificates' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Department Certificate Verification Desk
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Review credential claims, examine certificate links, and grant verified status stamps for academic credits.
            </p>

            <div className="space-y-3">
              {certificates.map((cert) => {
                const isVerified = Boolean(cert.verified_by_dept);

                return (
                  <div
                    key={cert.id}
                    className="bg-slate-850 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white text-sm">{cert.title}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            isVerified
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                        <span>Issued by: <strong className="text-slate-300">{cert.issuing_org}</strong></span>
                        <span>Date: <strong className="text-slate-300">{cert.issue_date}</strong></span>
                        {cert.credential_id && (
                          <span>Credential ID: <code className="text-slate-300">{cert.credential_id}</code></span>
                        )}
                        {cert.student_name && (
                          <span>Student: <strong className="text-indigo-300">{cert.student_name} ({cert.student_roll})</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-medium border border-slate-700"
                        >
                          View Document
                        </a>
                      )}

                      <button
                        onClick={() => onVerifyCertificate(cert.id, !isVerified)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isVerified
                            ? 'bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {isVerified ? 'Revoke Verification' : 'Verify & Stamp'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Analytics & Skill Distribution */}
      {activeSection === 'analytics' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Skills Acquired */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Most Acquired Technical Skills
            </h3>
            <div className="space-y-3">
              {analytics.topSkills.map((sk) => (
                <div key={sk.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">{sk.name}</span>
                    <span className="text-indigo-400 font-medium">{sk.count} students ({sk.category})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"
                      style={{
                        width: `${Math.min(100, (sk.count / (analytics.summary.totalStudents || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internships by Domain */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Opportunities Distributed by Industry Domain
            </h3>
            <div className="space-y-3">
              {analytics.domainBreakdown.map((item) => (
                <div key={item.domain}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">{item.domain}</span>
                    <span className="text-emerald-400 font-medium">{item.count} postings</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{
                        width: `${Math.min(100, (item.count / (analytics.summary.totalInternships || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Update Application Status & Evaluation (Controlled Form) */}
      {selectedAppForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-white mb-1">
              Manage Application Status & Evaluation
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Candidate: <strong>{selectedAppForEdit.student_name}</strong> • Role: <strong>{selectedAppForEdit.internship_title}</strong>
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Application Pipeline State *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ApplicationStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="APPLIED">APPLIED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="SHORTLISTED">SHORTLISTED</option>
                  <option value="INTERVIEW">INTERVIEW</option>
                  <option value="OFFERED">OFFERED</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Supervisor & Coordinator Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Cleared technical interview with high remarks on React & Express architecture..."
                  value={supervisorRemarks}
                  onChange={(e) => setSupervisorRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {editStatus === 'COMPLETED' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    Internship Completion Grading & Feedback
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Final Completion Score (0 - 100)%
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      placeholder="e.g. 96.5"
                      value={completionScore}
                      onChange={(e) => setCompletionScore(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Faculty / Industry Feedback
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Excellent engineering rigor, completed all deliverables on schedule..."
                      value={completionFeedback}
                      onChange={(e) => setCompletionFeedback(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAppForEdit(null)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition"
                >
                  {isUpdating ? 'Saving...' : 'Update Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

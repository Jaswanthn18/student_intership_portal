import React, { useState } from 'react';
import { Certificate, Application } from '../types/index.ts';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Building2, 
  Calendar, 
  ShieldCheck,
  Search,
  FileCheck
} from 'lucide-react';

interface CertificateManagerProps {
  studentId: number;
  certificates: Certificate[];
  completedApplications: Application[];
  onAddCertificate: (certData: {
    student_id: number;
    application_id?: number | null;
    title: string;
    issuing_org: string;
    issue_date: string;
    credential_id?: string;
    credential_url?: string;
  }) => Promise<void>;
  onDeleteCertificate: (id: number) => Promise<void>;
  initialPrefillApp?: Application | null;
  onClearPrefill?: () => void;
}

export const CertificateManager: React.FC<CertificateManagerProps> = ({
  studentId,
  certificates,
  completedApplications,
  onAddCertificate,
  onDeleteCertificate,
  initialPrefillApp,
  onClearPrefill,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(Boolean(initialPrefillApp));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<'All' | 'Verified' | 'Pending'>('All');

  // Controlled Form State
  const [title, setTitle] = useState(
    initialPrefillApp ? `${initialPrefillApp.internship_title} Certificate of Completion` : ''
  );
  const [issuingOrg, setIssuingOrg] = useState(initialPrefillApp?.company_name || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [credentialId, setCredentialId] = useState(
    initialPrefillApp ? `CERT-${Date.now().toString().slice(-6)}` : ''
  );
  const [credentialUrl, setCredentialUrl] = useState(
    'https://drive.google.com/file/d/sample-internship-certificate.pdf'
  );
  const [linkedAppId, setLinkedAppId] = useState<number | ''>(
    initialPrefillApp?.id || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter certificates with .filter()
  const filteredCertificates = certificates.filter((cert) => {
    const isVer = Boolean(cert.verified_by_dept);
    const matchesVer =
      filterVerified === 'All' ||
      (filterVerified === 'Verified' && isVer) ||
      (filterVerified === 'Pending' && !isVer);

    const matchesSearch =
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuing_org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cert.credential_id || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesVer && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issuingOrg.trim() || !issueDate) {
      setErrorMsg('Please complete all required fields');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await onAddCertificate({
        student_id: studentId,
        application_id: linkedAppId ? Number(linkedAppId) : null,
        title: title.trim(),
        issuing_org: issuingOrg.trim(),
        issue_date: issueDate,
        credential_id: credentialId.trim() || undefined,
        credential_url: credentialUrl.trim() || undefined,
      });

      setIsModalOpen(false);
      setTitle('');
      setIssuingOrg('');
      setCredentialId('');
      if (onClearPrefill) onClearPrefill();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['All', 'Verified', 'Pending'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterVerified(tab)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  filterVerified === tab
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setErrorMsg(null);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add Certificate Information
        </button>
      </div>

      {/* Certificates Cards Grid - map() and conditional rendering */}
      {filteredCertificates.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">No certificates recorded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Upload internship completion certificates and technical skill credentials for academic department validation.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition"
          >
            Add First Certificate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCertificates.map((cert) => {
            const isVerified = Boolean(cert.verified_by_dept);

            return (
              <div
                key={cert.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-md flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base leading-snug">
                          {cert.title}
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-slate-300 font-medium">{cert.issuing_org}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Delete certificate "${cert.title}"?`)) {
                          onDeleteCertificate(cert.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {cert.internship_title && (
                    <div className="mb-3 px-3 py-1.5 bg-slate-850 rounded-lg border border-slate-800 text-[11px] text-indigo-300">
                      Linked to Internship: <span className="font-semibold text-white">{cert.internship_title}</span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-400 py-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Issue Date:
                      </span>
                      <span className="text-slate-200 font-medium">{cert.issue_date}</span>
                    </div>

                    {cert.credential_id && (
                      <div className="flex items-center justify-between">
                        <span>Credential ID:</span>
                        <span className="font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {cert.credential_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified by Department
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Verification
                      </span>
                    )}
                  </div>

                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Certificate
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Controlled Add Certificate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-white mb-1">
              Add Certificate Information
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Submit your internship completion or external technical skill credential.
            </p>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Certificate Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack Engineering Internship Certificate"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Issuing Organization / Company *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NexusCloud Technologies, AWS, Google Cloud"
                  value={issuingOrg}
                  onChange={(e) => setIssuingOrg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {completedApplications.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Link to Completed Internship (Optional)
                  </label>
                  <select
                    value={linkedAppId}
                    onChange={(e) => setLinkedAppId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- None / External Certificate --</option>
                    {completedApplications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.internship_title} ({app.company_name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AWS-994821"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Credential / Verification Link
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or https://coursera.org/verify/..."
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onClearPrefill) onClearPrefill();
                  }}
                  className="px-4 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Recording...' : 'Save Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

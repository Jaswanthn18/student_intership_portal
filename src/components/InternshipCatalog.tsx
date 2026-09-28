import React, { useState } from 'react';
import { Internship, Student, Application } from '../types/index.ts';
import { ApplyModal } from './ApplyModal.tsx';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Users, 
  Sparkles,
  Info
} from 'lucide-react';

interface InternshipCatalogProps {
  internships: Internship[];
  student: Student;
  studentApplications: Application[];
  onApplySuccess: () => Promise<void>;
  onApplySubmit: (data: {
    student_id: number;
    internship_id: number;
    cover_note: string;
    resume_link: string;
  }) => Promise<void>;
}

export const InternshipCatalog: React.FC<InternshipCatalogProps> = ({
  internships,
  student,
  studentApplications,
  onApplySuccess,
  onApplySubmit,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedRoleType, setSelectedRoleType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minStipend, setMinStipend] = useState<number>(0);

  const [selectedForApply, setSelectedForApply] = useState<Internship | null>(null);
  const [detailModalInternship, setDetailModalInternship] = useState<Internship | null>(null);

  // Domains available
  const domains = [
    'All',
    'Cloud & DevOps',
    'Data Science & AI',
    'Web Development',
    'Cybersecurity',
    'Mobile Development',
    'FinTech & Full Stack',
  ];

  // Map of student's skills for rapid matching
  const studentSkillNames = new Set(
    (student.skills || []).map((sk) => sk.skill_name?.toLowerCase())
  );

  // Map of existing applications by internship_id
  const appliedMap = new Map<number, Application>();
  studentApplications.forEach((app) => {
    appliedMap.set(app.internship_id, app);
  });

  // Filter internships using filter()
  const filteredInternships = internships.filter((item) => {
    const matchesDomain =
      selectedDomain === 'All' ||
      item.domain.toLowerCase().includes(selectedDomain.toLowerCase()) ||
      selectedDomain.toLowerCase().includes(item.domain.toLowerCase());

    const matchesRoleType =
      selectedRoleType === 'All' || item.role_type === selectedRoleType;

    const matchesStipend = item.stipend_amount >= minStipend;

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.requirements || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDomain && matchesRoleType && matchesStipend && matchesSearch;
  });

  const getStatusBadge = (appStatus?: string) => {
    if (!appStatus) return null;
    switch (appStatus) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case 'OFFERED':
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-3 h-3" /> {appStatus}
          </span>
        );
      case 'INTERVIEW':
      case 'SHORTLISTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Clock className="w-3 h-3" /> {appStatus.replace('_', ' ')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Applied ({appStatus})
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Domain Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        {/* Search & Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by role title, company name, skills (e.g. React, Kubernetes)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRoleType}
              onChange={(e) => setSelectedRoleType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Locations (Remote/Hybrid)</option>
              <option value="Remote">Remote Only</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site Only</option>
            </select>
          </div>
        </div>

        {/* Domain Filter Chips */}
        <div>
          <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            Filter by Domain:
          </div>
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDomain === domain
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs sm:text-sm text-slate-400">
          Showing <span className="font-semibold text-white">{filteredInternships.length}</span> verified internship opportunities
        </p>
      </div>

      {/* Internships Grid - Using map() and conditional rendering */}
      {filteredInternships.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">No internships match your filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting domain selection, search keywords, or clear filter constraints.
          </p>
          <button
            onClick={() => {
              setSelectedDomain('All');
              setSelectedRoleType('All');
              setSearchQuery('');
            }}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredInternships.map((internship) => {
            const existingApp = appliedMap.get(internship.id);
            const isDeadlinePast = new Date(internship.deadline) < new Date();

            return (
              <div
                key={internship.id}
                className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-all duration-200 shadow-md hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Company info & Domain */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={internship.company_logo || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80'}
                        alt={internship.company_name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-700 bg-slate-800 p-0.5"
                      />
                      <div>
                        <h4 className="font-semibold text-white text-base group-hover:text-indigo-300 transition">
                          {internship.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-medium text-slate-300">{internship.company_name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {internship.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 whitespace-nowrap">
                      {internship.domain}
                    </span>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {internship.description}
                  </p>

                  {/* Requirements & Skills match preview */}
                  {internship.requirements && (
                    <div className="bg-slate-850 rounded-xl p-3 mb-4 border border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Prerequisites & Skills:
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {internship.requirements}
                      </p>
                    </div>
                  )}

                  {/* Key metadata pills */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Stipend</div>
                      <div className="font-bold text-emerald-400">
                        ${Number(internship.stipend_amount).toLocaleString()}/mo
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Duration</div>
                      <div className="font-medium text-slate-200">
                        {internship.duration_months} Months ({internship.role_type})
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Deadline</div>
                      <div className={`font-medium ${isDeadlinePast ? 'text-rose-400' : 'text-slate-300'}`}>
                        {internship.deadline}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {existingApp ? (
                      getStatusBadge(existingApp.status)
                    ) : (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {internship.applicants_count ?? 0} applicants
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailModalInternship(internship)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition"
                    >
                      Details
                    </button>

                    {existingApp ? (
                      <button
                        disabled
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-medium cursor-default flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedForApply(internship)}
                        disabled={isDeadlinePast || internship.status === 'CLOSED'}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition"
                      >
                        {isDeadlinePast ? 'Closed' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {selectedForApply && (
        <ApplyModal
          isOpen={Boolean(selectedForApply)}
          onClose={() => setSelectedForApply(null)}
          internship={selectedForApply}
          student={student}
          onApply={async (data) => {
            await onApplySubmit(data);
            await onApplySuccess();
            setSelectedForApply(null);
          }}
        />
      )}

      {/* Detail Modal */}
      {detailModalInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={detailModalInternship.company_logo || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80'}
                  alt={detailModalInternship.company_name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{detailModalInternship.title}</h3>
                  <p className="text-xs text-indigo-400 font-medium">{detailModalInternship.company_name} • {detailModalInternship.domain}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalInternship(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-semibold text-white mb-1">Position Overview</h4>
                <p className="text-slate-300 leading-relaxed">{detailModalInternship.description}</p>
              </div>

              {detailModalInternship.requirements && (
                <div>
                  <h4 className="font-semibold text-white mb-1">Required Skills & Candidate Profile</h4>
                  <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                    {detailModalInternship.requirements}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-850 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Stipend</span>
                  <span className="font-bold text-emerald-400">${detailModalInternship.stipend_amount}/month</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Duration</span>
                  <span className="font-medium text-white">{detailModalInternship.duration_months} Months</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mode</span>
                  <span className="font-medium text-white">{detailModalInternship.role_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Deadline</span>
                  <span className="font-medium text-white">{detailModalInternship.deadline}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setDetailModalInternship(null)}
                className="px-4 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Close
              </button>
              {!appliedMap.has(detailModalInternship.id) && (
                <button
                  onClick={() => {
                    const chosen = detailModalInternship;
                    setDetailModalInternship(null);
                    setSelectedForApply(chosen);
                  }}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

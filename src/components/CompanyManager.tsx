import React, { useState } from 'react';
import { Company, Internship } from '../types/index.ts';
import { 
  Building2, 
  Plus, 
  MapPin, 
  ExternalLink, 
  Mail, 
  Briefcase, 
  Search, 
  Calendar, 
  DollarSign, 
  Sparkles,
  Users
} from 'lucide-react';

interface CompanyManagerProps {
  companies: Company[];
  internships: Internship[];
  onCreateCompany: (data: Partial<Company>) => Promise<void>;
  onCreateInternship: (data: Partial<Internship>) => Promise<void>;
}

export const CompanyManager: React.FC<CompanyManagerProps> = ({
  companies,
  internships,
  onCreateCompany,
  onCreateInternship,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);
  const [preselectedCompanyId, setPreselectedCompanyId] = useState<number | null>(null);

  // Controlled Company Form State
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('Web Development');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyContact, setCompanyContact] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [compLoading, setCompLoading] = useState(false);
  const [compError, setCompError] = useState<string | null>(null);

  // Controlled Internship Form State
  const [targetCompanyId, setTargetCompanyId] = useState<number | ''>('');
  const [roleTitle, setRoleTitle] = useState('');
  const [roleDomain, setRoleDomain] = useState('Cloud & DevOps');
  const [roleType, setRoleType] = useState<'Remote' | 'On-site' | 'Hybrid'>('Remote');
  const [roleLocation, setRoleLocation] = useState('San Francisco, CA');
  const [durationMonths, setDurationMonths] = useState(6);
  const [stipendAmount, setStipendAmount] = useState(3000);
  const [vacancies, setVacancies] = useState(2);
  const [deadline, setDeadline] = useState('2026-11-30');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [internLoading, setInternLoading] = useState(false);
  const [internError, setInternError] = useState<string | null>(null);

  const domains = ['All', 'Cloud & DevOps', 'Data Science & AI', 'Web Development', 'Cybersecurity', 'Mobile & Frontend', 'FinTech & Full Stack'];

  // Filter companies with .filter()
  const filteredCompanies = companies.filter((c) => {
    const matchesDomain = selectedDomain === 'All' || c.domain.includes(selectedDomain) || selectedDomain.includes(c.domain);
    const matchesSearch =
      c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompError(null);
    setCompLoading(true);
    try {
      if (!companyName.trim() || !companyEmail.trim() || !companyLocation.trim()) {
        throw new Error('Please fill all required company fields');
      }
      await onCreateCompany({
        company_name: companyName.trim(),
        domain: companyDomain,
        email: companyEmail.trim(),
        location: companyLocation.trim(),
        website: companyWebsite.trim() || null,
        contact_person: companyContact.trim() || null,
        description: companyDesc.trim() || null,
        logo_url: companyLogo.trim() || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
      });
      setIsCompanyModalOpen(false);
      setCompanyName('');
      setCompanyEmail('');
      setCompanyLocation('');
      setCompanyDesc('');
    } catch (err: any) {
      setCompError(err.message || 'Failed to create company');
    } finally {
      setCompLoading(false);
    }
  };

  const handleInternshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternError(null);
    setInternLoading(true);
    try {
      if (!targetCompanyId) throw new Error('Please select a company');
      if (!roleTitle.trim()) throw new Error('Role title is required');
      if (!description.trim()) throw new Error('Description is required');

      await onCreateInternship({
        company_id: Number(targetCompanyId),
        title: roleTitle.trim(),
        domain: roleDomain,
        role_type: roleType,
        location: roleLocation.trim(),
        duration_months: Number(durationMonths),
        stipend_amount: Number(stipendAmount),
        vacancies: Number(vacancies),
        deadline,
        description: description.trim(),
        requirements: requirements.trim() || null,
      });

      setIsInternshipModalOpen(false);
      setRoleTitle('');
      setDescription('');
      setRequirements('');
    } catch (err: any) {
      setInternError(err.message || 'Failed to post internship');
    } finally {
      setInternLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search partner companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs scrollbar-none">
            {domains.slice(0, 4).map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  selectedDomain === d
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsInternshipModalOpen(true);
              if (companies.length > 0) setTargetCompanyId(companies[0].id);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition"
          >
            <Briefcase className="w-4 h-4 text-indigo-400" />
            Post Internship
          </button>
          <button
            onClick={() => setIsCompanyModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Register Partner Company
          </button>
        </div>
      </div>

      {/* Companies List - map() */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => {
          const companyInternships = internships.filter((i) => i.company_id === company.id);

          return (
            <div
              key={company.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={company.logo_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80'}
                    alt={company.company_name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800 p-0.5"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">{company.company_name}</h3>
                    <p className="text-xs text-indigo-400 font-medium">{company.domain}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {company.location}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTargetCompanyId(company.id);
                    setIsInternshipModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Post Role
                </button>
              </div>

              {company.description && (
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {company.description}
                </p>
              )}

              {/* Associated internships list */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 flex items-center justify-between">
                  <span>Open Internships ({companyInternships.length})</span>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline flex items-center gap-1 normal-case font-normal"
                    >
                      <ExternalLink className="w-3 h-3" /> Website
                    </a>
                  )}
                </div>

                {companyInternships.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No active internship postings currently.</p>
                ) : (
                  <div className="space-y-1.5">
                    {companyInternships.map((intern) => (
                      <div
                        key={intern.id}
                        className="bg-slate-850 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white block">{intern.title}</span>
                          <span className="text-slate-400 text-[11px]">
                            {intern.role_type} • {intern.duration_months} mos • ${intern.stipend_amount}/mo
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {intern.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Register Company */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-white mb-1">Register Hiring Partner Company</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a new company to the university industry internship network.
            </p>

            {compError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4">
                {compError}
              </div>
            )}

            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Palantir, Datadog"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Primary Domain *</label>
                  <select
                    value={companyDomain}
                    onChange={(e) => setCompanyDomain(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="FinTech & Full Stack">FinTech & Full Stack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Location / HQ *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin, TX or Remote"
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="talent@company.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Logo Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={companyLogo}
                  onChange={(e) => setCompanyLogo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of engineering culture and business focus..."
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={compLoading}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition"
                >
                  {compLoading ? 'Registering...' : 'Register Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Post Internship */}
      {isInternshipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-white mb-1">Post New Internship Role</h3>
            <p className="text-xs text-slate-400 mb-4">
              Publish an internship opportunity for student applications.
            </p>

            {internError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4">
                {internError}
              </div>
            )}

            <form onSubmit={handleInternshipSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hiring Company *</label>
                <select
                  value={targetCompanyId}
                  onChange={(e) => setTargetCompanyId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.domain})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Golang Intern"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Domain *</label>
                  <select
                    value={roleDomain}
                    onChange={(e) => setRoleDomain(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="FinTech & Full Stack">FinTech & Full Stack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mode *</label>
                  <select
                    value={roleType}
                    onChange={(e) => setRoleType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Duration (mos)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Stipend ($/mo)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={stipendAmount}
                    onChange={(e) => setStipendAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Key responsibilities and day-to-day deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Requirements & Skills</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Familiarity with Docker, Linux CLI, and REST architectural patterns..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInternshipModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={internLoading}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition"
                >
                  {internLoading ? 'Publishing...' : 'Publish Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

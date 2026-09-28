import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../types/index.ts';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  XCircle, 
  Building2, 
  Calendar, 
  Award, 
  FileText, 
  Trash2,
  ChevronRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

interface ApplicationTrackerProps {
  applications: Application[];
  onWithdrawApplication: (id: number) => Promise<void>;
  onOpenCertificateUpload: (app: Application) => void;
}

const STATUS_STEPS: ApplicationStatus[] = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'ACCEPTED',
  'COMPLETED',
];

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onWithdrawApplication,
  onOpenCertificateUpload,
}) => {
  const [filterTab, setFilterTab] = useState<'All' | 'In Progress' | 'Offered/Accepted' | 'Completed'>('All');

  // Filter applications based on active filter tab using filter()
  const filteredApps = applications.filter((app) => {
    if (filterTab === 'All') return true;
    if (filterTab === 'In Progress') {
      return ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW'].includes(app.status);
    }
    if (filterTab === 'Offered/Accepted') {
      return ['OFFERED', 'ACCEPTED'].includes(app.status);
    }
    if (filterTab === 'Completed') {
      return app.status === 'COMPLETED';
    }
    return true;
  });

  const getStepIndex = (status: ApplicationStatus): number => {
    if (status === 'REJECTED') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: <Award className="w-3.5 h-3.5" />,
          label: 'Internship Completed & Certified',
        };
      case 'OFFERED':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          icon: <Sparkles className="w-3.5 h-3.5" />,
          label: 'Formal Offer Received',
        };
      case 'ACCEPTED':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'Offer Accepted & Onboarding',
        };
      case 'INTERVIEW':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Interview Round Scheduled',
        };
      case 'SHORTLISTED':
        return {
          bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
          icon: <TrendingUp className="w-3.5 h-3.5" />,
          label: 'Shortlisted by Committee',
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Application Under Review',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: <XCircle className="w-3.5 h-3.5" />,
          label: 'Application Not Selected',
        };
      case 'APPLIED':
      default:
        return {
          bg: 'bg-slate-700/60 text-slate-300 border-slate-600',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Application Submitted',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {(['All', 'In Progress', 'Offered/Accepted', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          Tracking <span className="font-semibold text-white">{filteredApps.length}</span> applications
        </div>
      </div>

      {/* Applications List - map() with pipeline rendering */}
      {filteredApps.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">No applications in this category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse internship opportunities and submit applications to start tracking your selection pipeline.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredApps.map((app) => {
            const currentStepIdx = getStepIndex(app.status);
            const badge = getStatusBadge(app.status);
            const isCompleted = app.status === 'COMPLETED';

            return (
              <div
                key={app.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition space-y-5"
              >
                {/* Header: Company, Role & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={app.company_logo || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80'}
                      alt={app.company_name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800 p-0.5"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {app.internship_title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium text-slate-300">{app.company_name}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">{app.internship_domain}</span>
                        {app.stipend_amount && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">${app.stipend_amount}/mo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper Bar (if not rejected) */}
                {app.status !== 'REJECTED' ? (
                  <div className="py-2">
                    <div className="hidden md:grid grid-cols-7 gap-2 text-center text-[10px] uppercase font-bold tracking-wider mb-2 text-slate-400">
                      {STATUS_STEPS.map((step, idx) => {
                        const isCurrent = idx === currentStepIdx;
                        const isPast = idx < currentStepIdx;
                        return (
                          <div
                            key={step}
                            className={`${
                              isCurrent
                                ? 'text-indigo-400'
                                : isPast
                                ? 'text-emerald-400'
                                : 'text-slate-600'
                            }`}
                          >
                            {step.replace('_', ' ')}
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress track */}
                    <div className="relative flex items-center justify-between">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 z-0 transition-all duration-500"
                        style={{
                          width: `${Math.max(0, (currentStepIdx / (STATUS_STEPS.length - 1)) * 100)}%`,
                        }}
                      />

                      {STATUS_STEPS.map((step, idx) => {
                        const isCurrent = idx === currentStepIdx;
                        const isPast = idx < currentStepIdx;

                        return (
                          <div
                            key={step}
                            className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                              isCurrent
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-md shadow-indigo-600/50'
                                : isPast
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {isPast ? '✓' : idx + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                    This application was not selected for this cycle. Keep refining your skills and applying to other roles.
                  </div>
                )}

                {/* Supervisor Remarks & Completion Score Box */}
                {(app.supervisor_remarks || app.completion_score !== null) && (
                  <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        Department & Supervisor Evaluation Notes
                      </div>

                      {app.completion_score !== null && app.completion_score !== undefined && (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          <Award className="w-3.5 h-3.5" />
                          Final Score: {app.completion_score}%
                        </div>
                      )}
                    </div>

                    {app.supervisor_remarks && (
                      <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        "{app.supervisor_remarks}"
                      </p>
                    )}

                    {app.completion_feedback && (
                      <p className="text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Feedback:</span> {app.completion_feedback}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer Metadata & Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Applied on: {app.applied_date ? app.applied_date.slice(0, 10) : 'Recent'}
                    </span>
                    {app.resume_link && (
                      <a
                        href={app.resume_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> Resume Link
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <button
                        onClick={() => onOpenCertificateUpload(app)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Log Completion Certificate
                      </button>
                    )}

                    {['APPLIED', 'UNDER_REVIEW'].includes(app.status) && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to withdraw this application?')) {
                            onWithdrawApplication(app.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Withdraw Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

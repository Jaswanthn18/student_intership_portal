import React, { useState } from 'react';
import { 
  GitBranch, 
  GitPullRequest, 
  AlertCircle, 
  FileCode, 
  CheckCircle2, 
  Clock, 
  Tag, 
  ExternalLink, 
  GitCommit, 
  BookOpen, 
  Copy, 
  Check,
  ShieldAlert
} from 'lucide-react';

interface Issue {
  id: number;
  title: string;
  labels: string[];
  status: 'OPEN' | 'CLOSED';
  author: string;
  assignee: string;
  createdAt: string;
  comments: number;
}

interface PullRequest {
  id: number;
  title: string;
  branch: string;
  base: string;
  author: string;
  status: 'MERGED' | 'OPEN';
  additions: number;
  deletions: number;
  description: string;
  changedFiles: string[];
}

export const GitWorkspace: React.FC = () => {
  const [subTab, setSubTab] = useState<'branches' | 'issues' | 'prs' | 'docs' | 'gitignore'>('branches');
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const branches = [
    { name: 'main', status: 'Default / Protected', commit: 'e92f1b4', desc: 'Production release branch, CI/CD automated pipeline' },
    { name: 'feature/student-profile', status: 'Merged', commit: '7a18d2c', desc: 'Student profile management, CGPA calculations, and skill junction' },
    { name: 'feature/internship-catalog', status: 'Merged', commit: '3f990a1', desc: 'Company posting marketplace with domain filters & keyword search' },
    { name: 'feature/application-workflow', status: 'Merged', commit: '8b45c22', desc: 'Status pipeline management: APPLIED to COMPLETED and evaluations' },
    { name: 'feature/certificate-verification', status: 'Merged', commit: '12ef490', desc: 'Certificate recording and coordinator verification stamps' },
    { name: 'feature/mysql-schema-and-apis', status: 'Merged', commit: '98cc003', desc: 'Relational MySQL schema DDL, foreign key cascades, and validation middleware' },
  ];

  const issues: Issue[] = [
    {
      id: 101,
      title: 'Enforce relational foreign key cascades on student deletion',
      labels: ['database', 'security'],
      status: 'CLOSED',
      author: 'lead-architect',
      assignee: 'dev-backend',
      createdAt: '2026-09-24',
      comments: 4,
    },
    {
      id: 102,
      title: 'Implement multi-domain filtering chip bar for internship marketplace',
      labels: ['frontend', 'enhancement'],
      status: 'CLOSED',
      author: 'product-lead',
      assignee: 'dev-frontend',
      createdAt: '2026-09-25',
      comments: 2,
    },
    {
      id: 103,
      title: 'Add centralized validation middleware for application status transitions',
      labels: ['backend', 'enhancement'],
      status: 'CLOSED',
      author: 'qa-engineer',
      assignee: 'dev-backend',
      createdAt: '2026-09-26',
      comments: 5,
    },
    {
      id: 104,
      title: 'Design department certificate verification stamp and audit trail',
      labels: ['feature', 'documentation'],
      status: 'CLOSED',
      author: 'dept-coordinator',
      assignee: 'dev-fullstack',
      createdAt: '2026-09-27',
      comments: 3,
    },
    {
      id: 105,
      title: 'Add interactive SQL query runner and MySQL DDL dump exporter',
      labels: ['database', 'enhancement'],
      status: 'CLOSED',
      author: 'faculty-evaluator',
      assignee: 'dev-fullstack',
      createdAt: '2026-09-28',
      comments: 6,
    },
  ];

  const pullRequests: PullRequest[] = [
    {
      id: 42,
      title: 'feat(db): Relational MySQL schema DDL & Foreign Key integrity',
      branch: 'feature/mysql-schema-and-apis',
      base: 'main',
      author: 'lead-architect',
      status: 'MERGED',
      additions: 420,
      deletions: 12,
      description: 'Defines 7 relational tables with ON DELETE CASCADE rules, unique constraints, and validation middleware.',
      changedFiles: ['database/schema.sql', 'database/seeds.sql', 'server/db.ts', 'server/middleware/validation.ts'],
    },
    {
      id: 43,
      title: 'feat(portal): Domain filtering, controlled forms, and application tracker',
      branch: 'feature/application-workflow',
      base: 'main',
      author: 'frontend-lead',
      status: 'MERGED',
      additions: 890,
      deletions: 45,
      description: 'Adds interactive domain pills, application status pipeline, and student skills management.',
      changedFiles: ['src/components/InternshipCatalog.tsx', 'src/components/ApplicationTracker.tsx', 'src/components/SkillManager.tsx'],
    },
    {
      id: 44,
      title: 'feat(cert): Certificate upload and department coordinator verification',
      branch: 'feature/certificate-verification',
      base: 'main',
      author: 'fullstack-dev',
      status: 'MERGED',
      additions: 380,
      deletions: 15,
      description: 'Department coordinator verification actions, credential links, and graduation completion status.',
      changedFiles: ['server/routes/certificates.ts', 'src/components/CertificateManager.tsx', 'src/components/DepartmentDashboard.tsx'],
    },
  ];

  const apiEndpoints = [
    { method: 'GET', path: '/api/students', desc: 'List students with optional search & department filter' },
    { method: 'POST', path: '/api/students', desc: 'Create a student record (validated by validateStudent middleware)' },
    { method: 'GET', path: '/api/students/:id', desc: 'Get student with aggregated skills, applications & certs' },
    { method: 'POST', path: '/api/students/:id/skills', desc: 'Link technical skill with proficiency level to student' },
    { method: 'GET', path: '/api/companies', desc: 'List hiring companies with active internship counts' },
    { method: 'GET', path: '/api/internships', desc: 'Query internships with domain, stipend, role_type filters' },
    { method: 'POST', path: '/api/applications', desc: 'Submit application (validates duplicate apply & deadline)' },
    { method: 'PATCH', path: '/api/applications/:id/status', desc: 'Manage status workflow, supervisor remarks & score' },
    { method: 'POST', path: '/api/certificates', desc: 'Upload/log student certificate information' },
    { method: 'PATCH', path: '/api/certificates/:id/verify', desc: 'Department coordinator verification stamp' },
    { method: 'GET', path: '/api/analytics/overview', desc: 'Department dashboard metrics and conversion rates' },
    { method: 'POST', path: '/api/db/query', desc: 'Interactive SQL query executor returning rows & time' },
  ];

  const handleCopyEndpoint = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(text);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              Git Version Control & Repository Governance
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Clean Git branching strategy, verified Pull Requests, GitHub Issue tracking, comprehensive REST API docs, and .gitignore configuration.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
          <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
          <span>Branch: <strong>main</strong> (Clean Tree)</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSubTab('branches')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            subTab === 'branches' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Feature Branches ({branches.length})</span>
        </button>

        <button
          onClick={() => setSubTab('prs')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            subTab === 'prs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Pull Requests ({pullRequests.length})</span>
        </button>

        <button
          onClick={() => setSubTab('issues')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            subTab === 'issues' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>GitHub Issues ({issues.length})</span>
        </button>

        <button
          onClick={() => setSubTab('docs')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            subTab === 'docs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>API Documentation</span>
        </button>

        <button
          onClick={() => setSubTab('gitignore')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            subTab === 'gitignore' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>.gitignore Configuration</span>
        </button>
      </div>

      {/* 1. Feature Branches View */}
      {subTab === 'branches' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            Active & Integrated Feature Branches
          </h3>
          <div className="space-y-3">
            {branches.map((b) => (
              <div
                key={b.name}
                className="bg-slate-850 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-indigo-300">
                      {b.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{b.desc}</p>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                  <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    commit {b.commit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Pull Requests View */}
      {subTab === 'prs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-purple-400" />
            Merged & Reviewed Pull Requests
          </h3>
          <div className="space-y-4">
            {pullRequests.map((pr) => (
              <div
                key={pr.id}
                className="bg-slate-850 border border-slate-800 rounded-xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Merged #{pr.id}
                    </span>
                    <h4 className="font-bold text-white text-sm">{pr.title}</h4>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    <span className="text-emerald-400">+{pr.additions}</span> /{' '}
                    <span className="text-rose-400">-{pr.deletions}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{pr.description}</p>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-indigo-300">
                      {pr.branch}
                    </span>
                    <span>➔</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                      {pr.base}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Changed files: {pr.changedFiles.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. GitHub Issues View */}
      {subTab === 'issues' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Project GitHub Issues & Traceability
          </h3>
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-slate-850 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      #{issue.id}
                    </span>
                    <h4 className="font-semibold text-white text-xs sm:text-sm">{issue.title}</h4>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>Opened by @{issue.author}</span>
                    <span>Assigned to @{issue.assignee}</span>
                    <span>{issue.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {issue.labels.map((lbl) => (
                    <span
                      key={lbl}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {lbl}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    RESOLVED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. API Documentation View */}
      {subTab === 'docs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              REST API Endpoint Reference
            </h3>
            <span className="text-xs text-slate-400">12 Endpoints Available</span>
          </div>

          <div className="space-y-2">
            {apiEndpoints.map((ep) => (
              <div
                key={ep.path + ep.method}
                className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded font-mono font-bold text-[10px] ${
                      ep.method === 'GET'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : ep.method === 'POST'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="font-mono text-white text-xs font-semibold">{ep.path}</code>
                </div>

                <div className="flex items-center gap-4 text-slate-400">
                  <span>{ep.desc}</span>
                  <button
                    onClick={() => handleCopyEndpoint(`${ep.method} ${ep.path}`)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                    title="Copy endpoint"
                  >
                    {copiedEndpoint === `${ep.method} ${ep.path}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. .gitignore Viewer */}
      {subTab === 'gitignore' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            Repository .gitignore Rules
          </h3>
          <p className="text-xs text-slate-400">
            Prevents leaking sensitive environment secrets, binary sqlite databases, build bundles, and editor caches.
          </p>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-indigo-300 leading-relaxed overflow-x-auto">
{`node_modules/
build/
dist/
coverage/
.DS_Store
*.log
.env*
!.env.example
*.sqlite
*.sqlite-journal
database/*.sqlite
.vscode/
.idea/`}
          </pre>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { TableSchemaInfo, SqlQueryResult } from '../types/index.ts';
import { api } from '../api/client.ts';
import { 
  Database, 
  Play, 
  Download, 
  Table, 
  Key, 
  Link2, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  Layers
} from 'lucide-react';

const PRESET_QUERIES = [
  {
    title: 'Applications Pipeline JOIN',
    desc: 'Joins Applications, Students, Internships, and Companies with foreign keys',
    sql: `SELECT 
  a.id AS app_id,
  s.name AS student_name,
  s.roll_number,
  c.company_name,
  i.title AS internship_title,
  i.stipend_amount,
  a.status,
  a.completion_score
FROM applications a
JOIN students s ON a.student_id = s.id
JOIN internships i ON a.internship_id = i.id
JOIN companies c ON i.company_id = c.id
ORDER BY a.applied_date DESC;`,
  },
  {
    title: 'Student Skills Junction (Many-to-Many)',
    desc: 'Relational query across Students, Student_Skills junction, and Skills catalog',
    sql: `SELECT 
  s.name AS student_name,
  s.department,
  sk.name AS skill_name,
  sk.category,
  ss.proficiency_level,
  ss.certified,
  ss.acquired_date
FROM student_skills ss
JOIN students s ON ss.student_id = s.id
JOIN skills sk ON ss.skill_id = sk.id
ORDER BY s.name ASC, ss.proficiency_level DESC;`,
  },
  {
    title: 'Company Postings & Applicants Aggregate',
    desc: 'Aggregates open vacancies and applicant volume per company',
    sql: `SELECT 
  c.company_name,
  c.location,
  COUNT(DISTINCT i.id) AS total_internships,
  COUNT(DISTINCT a.id) AS total_applications,
  SUM(i.vacancies) AS total_vacancies
FROM companies c
LEFT JOIN internships i ON c.id = i.company_id
LEFT JOIN applications a ON i.id = a.internship_id
GROUP BY c.id;`,
  },
  {
    title: 'Verified Certificates with Student Data',
    desc: 'List all verified credentials and certificates issued to students',
    sql: `SELECT 
  s.roll_number,
  s.name AS student_name,
  cert.title AS certificate_title,
  cert.issuing_org,
  cert.credential_id,
  cert.issue_date,
  cert.verified_by_dept
FROM certificates cert
JOIN students s ON cert.student_id = s.id
WHERE cert.verified_by_dept = 1;`,
  },
];

export const DatabaseExplorer: React.FC = () => {
  const [schema, setSchema] = useState<TableSchemaInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('students');
  const [sqlQuery, setSqlQuery] = useState<string>(PRESET_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loadingSchema, setLoadingSchema] = useState(true);

  useEffect(() => {
    loadSchema();
    handleExecuteQuery(PRESET_QUERIES[0].sql);
  }, []);

  const loadSchema = async () => {
    try {
      const data = await api.getDatabaseSchema();
      setSchema(data);
    } catch (err) {
      console.error('Failed to load database schema:', err);
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleExecuteQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    setIsRunning(true);
    try {
      const result = await api.executeSqlQuery(q);
      setQueryResult(result);
    } catch (err: any) {
      setQueryResult({
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: err.message || 'Error executing SQL query',
        },
      });
    } finally {
      setIsRunning(false);
    }
  };

  const currentTableInfo = schema.find((t) => t.table === selectedTable);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              MySQL Relational Database Engine & Schema Inspector
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ACID Compliant • Foreign Keys ON
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Centralized relational database tracking students, companies, internships, skills, applications, and certificates using standard relational foreign keys and cascade rules.
          </p>
        </div>

        <a
          href={api.getMySQLDumpUrl()}
          download="student_internship_portal_mysql.sql"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-white border border-slate-700 text-xs font-semibold shadow-sm transition whitespace-nowrap self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          Export MySQL Schema & Seeds Dump (.sql)
        </a>
      </div>

      {/* SQL Query Console Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Interactive SQL Terminal</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-2xl scrollbar-none">
            <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Presets:</span>
            {PRESET_QUERIES.map((preset) => (
              <button
                key={preset.title}
                onClick={() => {
                  setSqlQuery(preset.sql);
                  handleExecuteQuery(preset.sql);
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700 transition whitespace-nowrap"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* SQL Textarea */}
        <div className="relative">
          <textarea
            rows={5}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 shadow-inner"
            placeholder="Write standard SQL query (SELECT, INSERT, UPDATE, DELETE)..."
          />
          <button
            onClick={() => handleExecuteQuery()}
            disabled={isRunning}
            className="absolute right-3 bottom-3 flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 disabled:opacity-50 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Executing...' : 'Run Query'}
          </button>
        </div>

        {/* Query Output Results */}
        {queryResult && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            {queryResult.success ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {queryResult.type === 'SELECT'
                        ? `Returned ${queryResult.rowCount} rows`
                        : queryResult.message}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {queryResult.executionTimeMs} ms
                  </div>
                </div>

                {queryResult.type === 'SELECT' && queryResult.rows && queryResult.rows.length > 0 && (
                  <div className="border border-slate-800 rounded-xl overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead>
                        <tr className="bg-slate-850 text-slate-300 font-semibold border-b border-slate-800">
                          {queryResult.columns?.map((col) => (
                            <th key={col} className="p-2.5 font-mono text-[11px] whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {queryResult.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-850/50">
                            {queryResult.columns?.map((col) => (
                              <td key={col} className="p-2.5 text-slate-300 whitespace-nowrap max-w-xs truncate">
                                {row[col] !== null && row[col] !== undefined ? String(row[col]) : <em className="text-slate-600">NULL</em>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-0.5">SQL Execution Error</div>
                  <div className="font-mono text-[11px]">{queryResult.error?.message}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Relational Tables & Schema Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
        <div>
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-400" />
            Relational Schema Tables & Foreign Key Constraints
          </h3>
          <p className="text-xs text-slate-400">
            Click any table below to inspect its attributes, data types, primary keys, and foreign key reference cascades.
          </p>
        </div>

        {/* Table Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {schema.map((t) => (
            <button
              key={t.table}
              onClick={() => setSelectedTable(t.table)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedTable === t.table
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750 border border-slate-700'
              }`}
            >
              <span>{t.table}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 font-mono">
                {t.rowCount} rows
              </span>
            </button>
          ))}
        </div>

        {/* Selected Table Columns and Foreign Keys */}
        {currentTableInfo && (
          <div className="space-y-4 pt-2">
            {/* Columns Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <th className="p-3">Column Name</th>
                    <th className="p-3">Data Type</th>
                    <th className="p-3">Constraints / Keys</th>
                    <th className="p-3">Nullable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {currentTableInfo.columns.map((col) => (
                    <tr key={col.cid} className="hover:bg-slate-850/40">
                      <td className="p-3 font-mono font-medium text-white flex items-center gap-1.5">
                        {col.pk && (
                          <span title="Primary Key">
                            <Key className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}
                        {col.name}
                      </td>
                      <td className="p-3 font-mono text-indigo-300">{col.type}</td>
                      <td className="p-3 text-slate-400">
                        {col.pk ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            PRIMARY KEY
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 text-slate-400">
                        {col.notnull ? (
                          <span className="text-rose-400 font-semibold">NOT NULL</span>
                        ) : (
                          <span className="text-slate-500">NULL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Foreign Keys Description */}
            {currentTableInfo.foreignKeys.length > 0 && (
              <div className="bg-slate-850 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                  Foreign Key Constraints on <code className="text-indigo-300">{currentTableInfo.table}</code>:
                </div>
                <div className="space-y-1.5">
                  {currentTableInfo.foreignKeys.map((fk, idx) => (
                    <div key={idx} className="text-xs font-mono text-slate-300 flex items-center gap-2">
                      <span className="text-amber-400">{fk.from}</span>
                      <span className="text-slate-500">➔ REFERENCES</span>
                      <span className="text-indigo-400 font-semibold">{fk.table}({fk.to})</span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        ON DELETE {fk.on_delete}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

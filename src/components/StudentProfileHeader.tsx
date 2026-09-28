import React from 'react';
import { Student } from '../types/index.ts';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit3, 
  FileText, 
  CheckCircle, 
  Briefcase, 
  Award, 
  Layers
} from 'lucide-react';

interface StudentProfileHeaderProps {
  student: Student;
  onEdit: () => void;
}

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({ student, onEdit }) => {
  const getCgpaColor = (cgpa: number) => {
    if (cgpa >= 9.0) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (cgpa >= 8.0) return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left: Avatar & Bio */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={student.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={student.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-900" title="Enrolled & Active">
              <CheckCircle className="w-3.5 h-3.5 text-slate-950" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {student.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {student.roll_number}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCgpaColor(student.cgpa)}`}>
                CGPA: {Number(student.cgpa).toFixed(2)}
              </span>
            </div>

            <p className="text-sm font-medium text-indigo-400">
              {student.department} • Batch of {student.batch_year}
            </p>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl line-clamp-2">
              {student.bio || 'Passionate student seeking challenging industry internship roles to apply core technical skills.'}
            </p>

            {/* Contact details */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {student.email}
              </span>
              {student.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {student.phone}
                </span>
              )}
              {student.resume_url && (
                <a
                  href={student.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Resume
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions & Metrics Summary */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-medium transition shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            Edit Profile
          </button>

          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
            <div className="bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-center min-w-[80px]">
              <div className="text-base font-bold text-white">
                {student.skills?.length ?? student.skillsCount ?? 0}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Skills
              </div>
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-center min-w-[80px]">
              <div className="text-base font-bold text-indigo-400">
                {student.applications?.length ?? student.appsCount ?? 0}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Applied
              </div>
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-center min-w-[80px]">
              <div className="text-base font-bold text-emerald-400">
                {student.certificates?.length ?? student.certsCount ?? 0}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Certs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

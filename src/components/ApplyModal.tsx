import React, { useState } from 'react';
import { Internship, Student } from '../types/index.ts';
import { X, Send, Briefcase, Building2, User, FileText, CheckCircle2 } from 'lucide-react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  internship: Internship;
  student: Student;
  onApply: (data: {
    student_id: number;
    internship_id: number;
    cover_note: string;
    resume_link: string;
  }) => Promise<void>;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  internship,
  student,
  onApply,
}) => {
  const [coverNote, setCoverNote] = useState(
    `Hello ${internship.company_name} Talent Team,\n\nI am eager to apply for the ${internship.title} position. As a student in ${student.department} with a CGPA of ${student.cgpa}, my background in relevant technical domains aligns directly with your requirements.`
  );
  const [resumeLink, setResumeLink] = useState(student.resume_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (!resumeLink.trim()) {
        throw new Error('Please provide a valid resume or portfolio URL');
      }

      await onApply({
        student_id: student.id,
        internship_id: internship.id,
        cover_note: coverNote.trim(),
        resume_link: resumeLink.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Apply for Internship</h3>
              <p className="text-xs text-slate-400">
                {internship.title} • {internship.company_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Student & Role Context Card */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Applying As:</span>
              <span className="font-semibold text-white">
                {student.name} ({student.roll_number})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Department & CGPA:</span>
              <span className="text-indigo-300 font-medium">
                {student.department} • CGPA {student.cgpa}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Stipend & Duration:</span>
              <span className="text-emerald-400 font-semibold">
                ${internship.stipend_amount}/mo • {internship.duration_months} Months ({internship.role_type})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" /> Resume / CV Link *
            </label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/your-resume.pdf"
              value={resumeLink}
              onChange={(e) => setResumeLink(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Provide a public Google Drive, GitHub, or LinkedIn portfolio link.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Statement of Purpose / Cover Note
            </label>
            <textarea
              rows={4}
              required
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Submitting Application...' : 'Confirm & Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

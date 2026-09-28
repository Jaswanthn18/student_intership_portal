import React, { useState } from 'react';
import { StudentSkill, Skill } from '../types/index.ts';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Award, 
  Filter, 
  Search, 
  Calendar,
  Layers
} from 'lucide-react';

interface SkillManagerProps {
  studentId: number;
  studentSkills: StudentSkill[];
  masterSkills: Skill[];
  onAddSkill: (skillData: {
    skill_id: number;
    proficiency_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    certified: boolean;
    acquired_date: string;
  }) => Promise<void>;
  onRemoveSkill: (studentSkillId: number) => Promise<void>;
  onCreateMasterSkill: (skillData: { name: string; category: string; description: string }) => Promise<void>;
}

export const SkillManager: React.FC<SkillManagerProps> = ({
  studentId,
  studentSkills,
  masterSkills,
  onAddSkill,
  onRemoveSkill,
  onCreateMasterSkill,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNewMasterModalOpen, setIsNewMasterModalOpen] = useState(false);

  // Controlled Form State for Adding Skill to Student
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('');
  const [proficiencyLevel, setProficiencyLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [isCertified, setIsCertified] = useState<boolean>(false);
  const [acquiredDate, setAcquiredDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Controlled Form State for Defining a New Master Catalog Skill
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [masterSubmitting, setMasterSubmitting] = useState(false);

  // Categories extracted from student skills
  const categories = ['All', ...Array.from(new Set(masterSkills.map((s) => s.category)))];

  // Filtering student skills using .filter()
  const filteredSkills = studentSkills.filter((sk) => {
    const matchesCategory =
      selectedCategory === 'All' || sk.skill_category === selectedCategory;
    const matchesSearch =
      (sk.skill_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (sk.skill_category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Skills available to add (skills the student does not have yet)
  const availableSkills = masterSkills.filter(
    (ms) => !studentSkills.some((ss) => ss.skill_id === ms.id)
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) {
      setErrorMsg('Please select a skill from the catalog');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onAddSkill({
        skill_id: Number(selectedSkillId),
        proficiency_level: proficiencyLevel,
        certified: isCertified,
        acquired_date: acquiredDate,
      });
      setIsAddModalOpen(false);
      setSelectedSkillId('');
      setIsCertified(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMasterSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setMasterSubmitting(true);
    try {
      await onCreateMasterSkill({
        name: newSkillName.trim(),
        category: newSkillCategory,
        description: newSkillDesc.trim(),
      });
      setIsNewMasterModalOpen(false);
      setNewSkillName('');
      setNewSkillDesc('');
    } catch (err: any) {
      alert(err.message || 'Failed to create skill in catalog');
    } finally {
      setMasterSubmitting(false);
    }
  };

  const getProficiencyBadgeClass = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Advanced':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Intermediate':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'Beginner':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
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
              placeholder="Filter acquired skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-md scrollbar-none py-1">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewMasterModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            New Master Skill
          </button>
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              if (availableSkills.length > 0) setSelectedSkillId(availableSkills[0].id);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Add Skill to Profile
          </button>
        </div>
      </div>

      {/* Skills Grid - Using map() and conditional rendering */}
      {filteredSkills.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-10 text-center text-slate-400">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">No technical skills matched</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {studentSkills.length === 0
              ? 'This student profile has no technical skills recorded yet. Add from the master catalog!'
              : 'Try clearing your search query or switching categories.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition"
          >
            <Plus className="w-4 h-4" /> Add First Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((sk) => (
            <div
              key={sk.student_skill_id || sk.id || sk.skill_id}
              className="group bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition">
                      {sk.skill_name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {sk.skill_category}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${getProficiencyBadgeClass(
                      sk.proficiency_level
                    )}`}
                  >
                    {sk.proficiency_level}
                  </span>
                </div>

                {sk.skill_description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {sk.skill_description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {Boolean(sk.certified) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Award className="w-3 h-3" />
                      Certified
                    </span>
                  )}
                  {sk.acquired_date && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {sk.acquired_date}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    const idToRemove = sk.student_skill_id || sk.id;
                    if (idToRemove && confirm(`Remove "${sk.skill_name}" from student profile?`)) {
                      onRemoveSkill(idToRemove);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                  title="Remove skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Add Skill to Student Profile (Controlled Form) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100">
            <h3 className="text-base font-semibold text-white mb-1">Add Technical Skill</h3>
            <p className="text-xs text-slate-400 mb-4">
              Map a certified or learned skill to this student profile.
            </p>

            {errorMsg && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Technical Skill *
                </label>
                {availableSkills.length > 0 ? (
                  <select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>-- Choose a skill --</option>
                    {availableSkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    All skills in the master catalog are already added to this profile!
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Proficiency Level *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setProficiencyLevel(lvl)}
                      className={`py-1.5 text-xs font-medium rounded-lg border text-center transition ${
                        proficiencyLevel === lvl
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Acquired / Started Date
                </label>
                <input
                  type="date"
                  value={acquiredDate}
                  onChange={(e) => setAcquiredDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="certifiedCheck"
                  checked={isCertified}
                  onChange={(e) => setIsCertified(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500"
                />
                <label htmlFor="certifiedCheck" className="text-xs text-slate-300 cursor-pointer">
                  Student holds an official industry credential or course certificate for this skill
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableSkills.length === 0}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Linking...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Master Catalog Skill */}
      {isNewMasterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100">
            <h3 className="text-base font-semibold text-white mb-1">Add to Master Skills Catalog</h3>
            <p className="text-xs text-slate-400 mb-4">
              Define a new technical skill available for all students and internship postings.
            </p>

            <form onSubmit={handleCreateMasterSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GraphQL, Rust, PyTorch, Kubernetes"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Languages">Languages</option>
                  <option value="Database">Database</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Security">Security</option>
                  <option value="Design & UX">Design & UX</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Core concepts, tools, and industry applications..."
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewMasterModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={masterSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition"
                >
                  {masterSubmitting ? 'Registering...' : 'Register Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { api } from '../../api';
import Icon from '../../components/ui/Icon';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const TYPE_META = {
  pdf:   { label: 'PDF', color: 'red' }, word: { label: 'DOC', color: 'blue' },
  ppt:   { label: 'PPT', color: 'amber' }, video: { label: 'VID', color: 'green' },
  link:  { label: 'URL', color: 'purple' },
};

export default function BrowseCourses({ user, showToast }) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState('');
  const [viewCourse, setViewCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCourses(), api.getEnrollments()])
      .then(([c, e]) => { setCourses(c.filter(c => c.status === 'PUBLISHED')); setEnrollments(e); })
      .finally(() => setLoading(false));
  }, []);

  const getEnrollment = (courseId) => enrollments.find(e => e.courseId === courseId);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleEnroll = async (courseId) => {
    try {
      const enr = await api.enroll(courseId);
      setEnrollments(es => [...es, enr]);
      showToast('Enrolled successfully!');
    } catch (e) { showToast(e.message, 'error'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading…</div>;

  return (
    <div className="p-7 page-enter">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">Course Catalogue</h2>
        <p className="text-slate-400 text-sm mt-1">{courses.length} courses available</p>
      </div>

      <div className="relative mb-5">
        <Icon name="search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-brand-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map(c => {
          const enr = getEnrollment(c.id);
          return (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-navy-900">{c.title}</span>
                  </div>
                  <Badge variant="blue" className="text-[10px]">{c.category}</Badge>
                </div>
                {enr && (
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs text-slate-400 mb-1">{enr.progress}%</div>
                    <div className="w-16 progress-bar"><div className="progress-fill" style={{ width: `${enr.progress}%` }} /></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{c.description}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4">
                <span>{c.duration} min</span>
                <span>·</span>
                <span>Pass: {c.passScore}%</span>
                <span>·</span>
                <span>{(c.materials || []).length} materials</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setViewCourse(c)} className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  View Details
                </button>
                {!enr ? (
                  <button onClick={() => handleEnroll(c.id)} className="flex-1 py-2 rounded-xl bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">
                    Enroll
                  </button>
                ) : enr.completed ? (
                  <Badge variant="green" className="flex-1 justify-center py-2">Completed</Badge>
                ) : (
                  <Badge variant="amber" className="flex-1 justify-center py-2">In Progress</Badge>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="col-span-2 text-center py-12 text-slate-400 text-sm">No courses found.</div>}
      </div>

      {/* Course detail modal */}
      <Modal open={!!viewCourse} onClose={() => setViewCourse(null)} title={viewCourse?.title || ''} size="620px">
        {viewCourse && (
          <div>
            <p className="text-sm text-slate-600 mb-5">{viewCourse.description}</p>
            <div className="flex gap-4 text-xs text-slate-400 mb-5">
              <span><strong className="text-slate-600">Category:</strong> {viewCourse.category}</span>
              <span><strong className="text-slate-600">Duration:</strong> {viewCourse.duration} min</span>
              <span><strong className="text-slate-600">Pass Score:</strong> {viewCourse.passScore}%</span>
            </div>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {(viewCourse.tags || []).map(t => <Badge key={t} variant="blue" className="text-[10px]">{t}</Badge>)}
            </div>
            {viewCourse.materials?.length > 0 && (
              <>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Materials</h4>
                <div className="space-y-2">
                  {viewCourse.materials.map(m => {
                    const meta = TYPE_META[m.type] || { label: 'FILE', color: 'gray' };
                    return (
                      <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <Badge variant={meta.color} className="font-mono text-[10px]">{meta.label}</Badge>
                        <span className="text-sm text-slate-700 flex-1">{m.title}</span>
                        {m.url && m.url !== '#' && (
                          <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline text-xs">Open →</a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <div className="mt-5 pt-4 border-t border-slate-100">
              {!getEnrollment(viewCourse.id) ? (
                <button onClick={() => { handleEnroll(viewCourse.id); setViewCourse(null); }}
                  className="w-full py-3 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600">Enroll Now</button>
              ) : (
                <p className="text-center text-sm text-slate-500">You are enrolled in this course.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

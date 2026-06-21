import { useState, useEffect } from 'react';
import { api } from '../../api';
import Icon from '../../components/ui/Icon';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

export default function AdminDashboard({ showToast }) {
  const [summary, setSummary] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getReportSummary(), api.getEnrollments(), api.getCourses()])
      .then(([s, e, c]) => { setSummary(s); setEnrollments(e); setCourses(c); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading…</div>;

  const statCards = [
    { label: 'Active Users',        val: summary.users,        icon: 'users', color: '#1A56DB', bg: '#EEF3FF' },
    { label: 'Published Courses',   val: summary.courses,      icon: 'book',  color: '#0E7490', bg: '#E0F2FE' },
    { label: 'Certificates Issued', val: summary.certificates, icon: 'cert',  color: '#6D28D9', bg: '#F5F3FF' },
    { label: 'Training Sessions',   val: summary.training,     icon: 'log',   color: '#C0392B', bg: '#FDF2F2' },
  ];

  const inProgress = enrollments.filter(e => !e.completed);
  const publishedCourses = courses.filter(c => c.status === 'PUBLISHED');

  return (
    <div className="p-4 md:p-7 page-enter">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">Admin Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">HemoLabs Learning Management — Live Overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 flex items-center gap-3 md:gap-4 shadow-sm">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}>
              <Icon name={s.icon} size={20} />
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-light text-navy-900">{s.val}</div>
              <div className="text-[11px] md:text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion + In-progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-navy-900">Course Completion Rate</h3>
            <Badge variant="green">{summary.completionRate}%</Badge>
          </div>
          {publishedCourses.map(c => {
            const enr = enrollments.filter(e => e.courseId === c.id);
            const done = enr.filter(e => e.completed).length;
            const pct = enr.length ? Math.round(done / enr.length * 100) : 0;
            return (
              <div key={c.id} className="mb-3.5">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-slate-600 font-medium truncate flex-1 pr-3">{c.title.length > 36 ? c.title.slice(0, 36) + '…' : c.title}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{done}/{enr.length}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
          {publishedCourses.length === 0 && <p className="text-xs text-slate-400">No published courses yet.</p>}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-navy-900">In-Progress Enrollments</h3>
            <Badge variant="blue">{inProgress.length}</Badge>
          </div>
          <div className="space-y-3">
            {inProgress.slice(0, 6).map(e => (
              <div key={e.id} className="flex items-center gap-3">
                <Avatar initials={e.user?.avatar} size={30} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700 truncate">{e.user?.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{e.course?.title}</div>
                </div>
                <div className="text-xs text-slate-400 flex-shrink-0">{e.progress}%</div>
              </div>
            ))}
            {inProgress.length === 0 && <p className="text-xs text-slate-400">No active enrollments.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

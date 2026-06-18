import { useLocation } from 'react-router-dom';
import Badge from './ui/Badge';

const titles = {
  '/admin/dashboard':    'Dashboard',
  '/admin/courses':      'Course Management',
  '/admin/training':     'Training Logger',
  '/admin/certificates': 'Certificate Engine',
  '/admin/users':        'Staff Directory',
  '/admin/reports':      'Reports & Analytics',
  '/dashboard':          'My Dashboard',
  '/courses':            'Course Catalogue',
  '/certs':              'My Certificates',
  '/report':             'My Report',
};

export default function TopBar({ user }) {
  const { pathname } = useLocation();
  const title = titles[pathname] || 'HemoLabs LMS';
  return (
    <div className="h-14 bg-white border-b border-slate-100 px-7 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 0 3px rgba(16,185,129,.15)' }} />
        <span className="text-sm font-semibold text-navy-900">{title}</span>
      </div>
      <Badge variant={user.role === 'ADMIN' ? 'red' : 'blue'}>
        {user.role === 'ADMIN' ? 'Administrator' : 'Staff'}
      </Badge>
    </div>
  );
}

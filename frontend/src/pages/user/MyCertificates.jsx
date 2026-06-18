import { useState, useEffect } from 'react';
import { api } from '../../api';
import Icon from '../../components/ui/Icon';
import Badge from '../../components/ui/Badge';

export default function MyCertificates({ user, showToast }) {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCertificates().then(setCerts).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading…</div>;

  return (
    <div className="p-7 page-enter">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">My Certificates</h2>
        <p className="text-slate-400 text-sm mt-1">{certs.length} certificates earned</p>
      </div>

      {certs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Icon name="cert" size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">No certificates yet. Complete a course to earn one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {certs.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              {/* Certificate preview */}
              <div className="rounded-xl p-5 mb-4 text-white text-center" style={{ background: 'linear-gradient(135deg,#0D1B2A,#1A56DB)' }}>
                <div className="font-mono font-bold text-2xl mb-1">HML</div>
                <div className="text-[10px] uppercase tracking-widest opacity-60 mb-4">Certificate of Completion</div>
                <div className="text-xs opacity-70 mb-1">This certifies that</div>
                <div className="font-semibold text-base mb-1">{user.name}</div>
                <div className="text-xs opacity-70 mb-3">has successfully completed</div>
                <div className="text-sm font-medium px-4 leading-snug">{c.course?.title}</div>
                <div className="mt-4 font-mono text-[10px] opacity-40">{c.certNumber}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">{c.course?.category}</div>
                  <div className="text-[11px] text-slate-400">Issued {new Date(c.issuedAt).toLocaleDateString()}</div>
                </div>
                <Badge variant="green" className="text-sm font-semibold">{c.score}%</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

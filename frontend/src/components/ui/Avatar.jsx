const colors = ['#1A56DB','#0E7490','#6D28D9','#C0392B','#1A7A4A','#D97706'];
function colorFor(str) { return colors[(str?.charCodeAt(0) || 0) % colors.length]; }

export default function Avatar({ initials, size = 36, className = '' }) {
  return (
    <div className={`flex items-center justify-center rounded-full font-mono font-bold text-white flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: colorFor(initials), fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

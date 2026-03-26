// src/components/donor/ToastContainer.jsx

const icons = {
  success: "✅",
  error:   "❌",
  info:    "ℹ️",
};

const colors = {
  success: "bg-white border-l-4 border-[#2D6A4F] text-[#1A4731]",
  error:   "bg-white border-l-4 border-red-500  text-red-700",
  info:    "bg-white border-l-4 border-[#2563EB] text-[#1E3A5F]",
};

const ToastContainer = ({ toasts }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-lg min-w-[280px] max-w-sm pointer-events-auto ${colors[t.type]} animate-slideIn`}
          style={{ animation: "slideIn 0.3s ease both" }}
        >
          <span className="text-[18px] flex-shrink-0">{icons[t.type]}</span>
          <p className="text-[13px] font-semibold leading-snug">{t.message}</p>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;

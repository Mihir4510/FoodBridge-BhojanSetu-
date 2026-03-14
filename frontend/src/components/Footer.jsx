function Footer() {
  const cols = [
    {
      title: "Platform",
      links: ["How it Works", "For Donors", "For NGOs", "Admin Panel"],
    },
    {
      title: "Company",
      links: ["About Us", "Impact Report", "Blog", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Use", "Cookie Policy"],
    },
  ];

  return (
    <footer className="bg-[#1A1A2E] text-white px-6 md:px-16 pt-16 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 mb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D6A4F] to-[#40916C] flex items-center justify-center text-lg">
              🌿
            </div>
            <span className="font-playfair text-[20px] font-bold">BhojanSetu</span>
          </div>
          <p className="text-[14px] text-white/55 leading-[1.7] max-w-[260px]">
            Bridging surplus food with communities in need. Built for India, powered by compassion.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-[13px] font-semibold text-white/40 uppercase tracking-[1px] mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-[14px] text-white/65 hover:text-white transition-colors no-underline">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-[13px] text-white/35">
          © 2025 BhojanSetu. Built with <span className="text-[#E76F1A]">♥</span> by SyntaxSquad.
        </p>
        <p className="text-[13px] text-white/30">Making India's food system more equitable.</p>
      </div>
    </footer>
  );
}

export default Footer;
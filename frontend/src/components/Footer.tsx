export function Footer() {
  return (
    <footer className="relative border-t border-border-default bg-gradient-to-b from-surface-0 to-surface-2 px-6 py-16">
      {/* Background gradient accent */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-secondary-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <h3 className="text-heading3 font-bold text-text-primary mb-4 flex items-center gap-2">
              <span>◆</span>
              <span>VeriGraph</span>
            </h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Real-time coordinated misinformation detection powered by hybrid intelligence.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-label font-semibold text-text-primary uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-body-sm text-text-secondary">
              <li>
                <a href="#features" className="hover:text-primary-600 transition-colors duration-300">
                  Features
                </a>
              </li>
              <li>
                <a href="/analysis" className="hover:text-primary-600 transition-colors duration-300">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600 transition-colors duration-300">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-label font-semibold text-text-primary uppercase tracking-wider mb-4">Contact</h4>
            <p className="text-body-sm text-text-secondary mb-4">
              <a href="mailto:info@verigraph.ai" className="hover:text-primary-600 transition-colors duration-300">
                info@verigraph.ai
              </a>
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-md bg-surface-1 hover:bg-primary-600 text-text-secondary hover:text-white flex items-center justify-center text-label font-semibold transition-all duration-300 border border-border-light hover:border-primary-600"
              >
                X
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-md bg-surface-1 hover:bg-primary-600 text-text-secondary hover:text-white flex items-center justify-center text-label font-semibold transition-all duration-300 border border-border-light hover:border-primary-600"
              >
                Ⓜ
              </a>
            </div>
          </div>
        </div>

        {/* Divider & Bottom Section */}
        <div className="border-t border-border-default pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-caption text-text-tertiary">© 2026 VeriGraph AI. All rights reserved.</p>
            <div className="flex gap-6 text-caption text-text-tertiary">
              <a href="#" className="hover:text-text-secondary transition-colors duration-300">
                Privacy
              </a>
              <a href="#" className="hover:text-text-secondary transition-colors duration-300">
                Terms
              </a>
              <a href="#" className="hover:text-text-secondary transition-colors duration-300">
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

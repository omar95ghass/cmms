import React from 'react';

function Footer() {
  return (
    <footer className="fixed bottom-0 left-64 right-0 rtl:left-0 rtl:right-64 bg-medical-card border-t border-medical-border py-3 z-10 print:hidden">
      <div className="px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-medical-muted">
          <div className="flex items-center gap-2">
            <span className="font-medium text-medical-text">Sadek Hasan POS</span>
            <span>-</span>
            <span>Developed By Dr.Omar Alothman</span>
          </div>
          <div className="text-xs text-medical-muted">
            © {new Date().getFullYear()} MMS. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

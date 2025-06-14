
import React, { useState } from 'react';
import { AuthBranding } from './AuthBranding';
import { AuthTabs } from './AuthTabs';
import { ResetPasswordForm } from './ResetPasswordForm';

export function AuthForm() {
  const [forgotPassword, setForgotPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#017F66]/95 via-[#0057FF]/50 to-[#fff] px-2 py-7 select-none">
      <div className="flex flex-col md:flex-row w-full max-w-3xl bg-white/95 rounded-3xl shadow-2xl overflow-hidden animate-fade-in border-2 border-[--primary]/20">
        <div className="hidden md:flex flex-col items-center justify-center flex-1 relative">
          <AuthBranding />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white bg-opacity-95">
          {forgotPassword ? (
            <ResetPasswordForm onBack={() => setForgotPassword(false)} />
          ) : (
            <AuthTabs onForgot={() => setForgotPassword(true)} />
          )}
        </div>
      </div>
    </div>
  );
}

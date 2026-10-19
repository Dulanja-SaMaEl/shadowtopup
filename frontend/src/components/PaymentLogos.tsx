import React from 'react';
import { Wallet, Landmark } from 'lucide-react';

export function VisaLogo({ className = 'w-9 h-6' }: { className?: string }) {
  return (
    <div className={`${className} rounded-md bg-[#0b2447] border border-[#1b3b6f] flex items-center justify-center p-1 shadow-sm shrink-0 overflow-hidden`}>
      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain">
        <path d="M18.8 22.5L21.4 9.5H24.7L22.1 22.5H18.8ZM31.5 9.7C30.8 9.4 29.7 9.1 28.3 9.1C24.8 9.1 22.4 11 22.4 13.7C22.4 15.7 24.1 16.8 25.5 17.5C26.9 18.2 27.4 18.7 27.4 19.4C27.4 20.4 26.2 20.9 25 20.9C23.5 20.9 22.6 20.6 21.6 20.1L21 19.8L20.4 22.6C21.3 23 22.9 23.3 24.6 23.3C28.4 23.3 30.8 21.4 30.8 18.5C30.8 16.1 29.3 14.9 27.8 14.1C26.5 13.4 25.8 13 25.8 12.3C25.8 11.6 26.6 11.2 27.7 11.2C28.8 11.2 29.7 11.5 30.5 11.8L30.9 12L31.5 9.7ZM38.4 9.5H35.8C35 9.5 34.3 9.8 34 10.6L29 22.5H32.5L33.2 20.5H37.4L37.8 22.5H41L38.4 9.5ZM34.1 18L35.9 13.1L37 18H34.1ZM16.8 9.5L13.7 18.5L13.3 16.5C12.7 14.3 10.9 12.1 9 10.9L12 22.5H15.6L20.5 9.5H16.8Z" fill="#FFFFFF"/>
        <path d="M11 9.5H5.8L5.7 9.8C9.9 10.9 12.9 13.6 14 16.7L12.9 10.8C12.8 9.8 12 9.5 11 9.5Z" fill="#F7B600"/>
      </svg>
    </div>
  );
}

export function MastercardLogo({ className = 'w-9 h-6' }: { className?: string }) {
  return (
    <div className={`${className} rounded-md bg-[#141226] border border-white/10 flex items-center justify-center p-1 shadow-sm shrink-0 overflow-hidden`}>
      <svg viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain">
        <circle cx="13" cy="12" r="7" fill="#EB001B"/>
        <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
        <path d="M18 7.3a7 7 0 0 0-2.4 4.7 7 7 0 0 0 2.4 4.7 7 7 0 0 0 2.4-4.7A7 7 0 0 0 18 7.3z" fill="#FF5F00"/>
      </svg>
    </div>
  );
}

export function EzCashLogo({ className = 'w-9 h-6' }: { className?: string }) {
  return (
    <div className={`${className} rounded-md bg-[#FFCC00] border border-amber-300 flex items-center justify-center p-0.5 shadow-sm shrink-0 select-none overflow-hidden`}>
      <span className="text-[10px] font-black italic tracking-tighter text-[#E60000] font-sans leading-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
        eZ<span className="text-black font-extrabold not-italic tracking-normal ml-0.5 text-[9px]">Cash</span>
      </span>
    </div>
  );
}

export function ShadowWalletLogo({ className = 'w-9 h-6' }: { className?: string }) {
  return (
    <div className={`${className} rounded-md bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500 border border-purple-400/40 flex items-center justify-center shadow-sm shrink-0`}>
      <Wallet className="w-3.5 h-3.5 text-white drop-shadow" />
    </div>
  );
}

export function BankTransferLogo({ className = 'w-9 h-6' }: { className?: string }) {
  return (
    <div className={`${className} rounded-md bg-[#181a24] border border-slate-700 flex items-center justify-center shadow-sm shrink-0`}>
      <Landmark className="w-3.5 h-3.5 text-purple-300" />
    </div>
  );
}

export function GenieLogo({ className = 'w-9 h-6' }: { className?: string }) {
  return (
    <div className={`${className} rounded-md bg-[#25103f] border border-fuchsia-600/40 flex items-center justify-center p-0.5 shadow-sm shrink-0 select-none overflow-hidden`}>
      <span className="text-[10px] font-black tracking-tight text-[#ff2e93] font-sans leading-none">
        genie
      </span>
    </div>
  );
}

export function AcceptedPaymentStrip({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <VisaLogo className="w-9 h-6" />
      <MastercardLogo className="w-9 h-6" />
      <EzCashLogo className="w-12 h-6" />
      <GenieLogo className="w-11 h-6" />
      <BankTransferLogo className="w-9 h-6" />
      <ShadowWalletLogo className="w-9 h-6" />
    </div>
  );
}

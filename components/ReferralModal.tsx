
import React from 'react';
import * as Icons from './icons';
import { useDatabase } from '../context/DatabaseContext';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
  const { onlineHubSettings } = useDatabase();
  if (!isOpen) return null;

  const referralLink = "https://fitable.app/signup?ref=user123";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Copiata!");
  };

  const rewardSuffix = onlineHubSettings.referralRewardType === 'fixed' ? onlineHubSettings.referralRewardCurrency : onlineHubSettings.referralRewardType === 'percentage' ? '%' : ' Zile';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-card-dark rounded-[3rem] shadow-2xl overflow-hidden animate-scaleIn">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10"
        >
          <Icons.XIcon className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12 flex flex-col items-center text-center">
            {/* Illustration Mockup */}
            <div className="relative w-64 h-64 mb-8">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-yellow-400 rounded-full overflow-hidden shadow-xl flex items-center justify-center">
                    {/* Placeholder for the person image */}
                    <div className="text-6xl">🎁</div>
                </div>
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-white dark:bg-background-dark rounded-full p-1 shadow-lg flex items-center justify-center border-4 border-yellow-400">
                    <Icons.GiftIcon className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="absolute top-1/4 -left-4 w-12 h-12 rounded-full border-4 border-white dark:border-card-dark shadow-md overflow-hidden bg-primary-100 flex items-center justify-center font-bold">JD</div>
                <div className="absolute bottom-4 -right-2 w-10 h-10 rounded-full border-4 border-white dark:border-card-dark shadow-md overflow-hidden bg-orange-100 flex items-center justify-center font-bold text-xs">MA</div>
            </div>

            <h2 className="text-3xl font-black tracking-tighter text-text-light-primary dark:text-text-dark-primary leading-tight mb-4">
                Câștigă <span className="text-primary-500">{onlineHubSettings.referralRewardAmount}{rewardSuffix}</span> prin invitarea prietenilor
            </h2>
            
            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-10 max-w-sm leading-relaxed">
                Partajează link-ul tău unic cu alți pasionați de fitness! Când un prieten se înscrie și activează un abonament, ambii primiți {onlineHubSettings.referralRewardAmount}{rewardSuffix} bonus în portofelul Fitable.
            </p>

            <div className="w-full space-y-4">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-background-dark p-2 rounded-2xl border border-border-light dark:border-border-dark group transition-all focus-within:ring-2 focus-within:ring-primary-500">
                    <div className="flex-1 truncate px-4 font-mono text-xs text-text-light-secondary dark:text-text-dark-secondary">
                        {referralLink}
                    </div>
                    <button 
                        onClick={handleCopy}
                        className="bg-primary-500 text-white p-3 rounded-xl hover:bg-primary-600 transition-all active:scale-90"
                        title="Copy Link"
                    >
                        <Icons.LinkIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex gap-2 justify-center">
                    <button className="p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all active:scale-95">
                        <Icons.WhatsAppIcon className="w-6 h-6" />
                    </button>
                    <button className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95">
                        <Icons.UsersIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
        
        <div className="h-2 bg-primary-500 w-full"></div>
      </div>
    </div>
  );
};

export default ReferralModal;

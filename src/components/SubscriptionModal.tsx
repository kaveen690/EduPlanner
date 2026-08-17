import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Building2,
  Download,
  CreditCard,
  Crown,
  HelpCircle
} from 'lucide-react';
import { SubscriptionTier, SubscriptionPlan, UserProfile, Language } from '../types';
import { isRTL } from '../lib/i18n';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateSubscription: (tier: SubscriptionTier) => void;
  lang: Language;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Academic Free',
    priceMonthly: 0,
    priceYearly: 0,
    maxAiCallsPerDay: 10,
    maxStorageGB: 1,
    spssAdvanced: false,
    teamWorkspaces: false,
    dedicatedApiKeys: false,
    features: [
      '10 AI Generations per Day',
      'Standard Research & Report Generators',
      'Basic APA 7 Citation Formatter',
      '1 GB Cloud Storage',
      'Community Support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Researcher',
    priceMonthly: 19,
    priceYearly: 180,
    maxAiCallsPerDay: 500,
    maxStorageGB: 50,
    spssAdvanced: true,
    teamWorkspaces: false,
    dedicatedApiKeys: false,
    features: [
      'Unlimited AI Research Paper & Thesis Generators',
      'Deep Localized Context (Regional Educational Frameworks)',
      'Advanced SPSS Statistics & Interactive Data Charts',
      'Plagiarism & AI Content Originality Detector',
      'Multi-Format File Upload (PDF, Word, Excel, CSV)',
      'Multi-Provider AI (Google Gemini 2.5 + OpenAI GPT-4o)',
      '50 GB Cloud Storage',
      'Priority Academic Support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise & Institutional',
    priceMonthly: 49,
    priceYearly: 450,
    maxAiCallsPerDay: 10000,
    maxStorageGB: 1000,
    spssAdvanced: true,
    teamWorkspaces: true,
    dedicatedApiKeys: true,
    features: [
      'Everything in Pro Plan included',
      'Team Workspaces with Role Permissions (Admin/Editor/Viewer)',
      'Project Collaboration, Comments & Version History',
      'Executive Admin Dashboard & Usage Analytics',
      'Dedicated Custom API Keys & High Rate Limits',
      'Custom University & Institutional Model Fine-Tuning',
      '1 TB Enterprise Cloud Storage & Dedicated Database',
      '24/7 SLA Uptime Guarantee & Account Manager'
    ]
  }
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateSubscription,
  lang,
  onShowToast
}) => {
  if (!isOpen) return null;

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  const currentTier = currentUser?.subscriptionTier || 'pro';
  const rtl = isRTL(lang);

  const handleSelectPlan = (tier: SubscriptionTier) => {
    setLoadingTier(tier);
    setTimeout(() => {
      onUpdateSubscription(tier);
      setLoadingTier(null);
      onShowToast(
        'success',
        'Subscription Updated',
        `Your account has been upgraded to ${tier.toUpperCase()} Plan.`
      );
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header Banner */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">EduPlanner Subscription Plans</h3>
              <p className="text-xs text-amber-200">
                Choose the academic tier tailored for individual researchers, faculty, or institutional university departments.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Monthly vs Yearly Billing Toggle */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 shrink-0">
          <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`w-12 h-6 rounded-full p-1 transition-colors relative ${
              billingCycle === 'yearly' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
            Annual Billing
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
              Save 20%
            </span>
          </span>
        </div>

        {/* Plans Grid Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = currentTier === plan.id;
            const isPro = plan.id === 'pro';
            const price = billingCycle === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 border ${
                  isPro
                    ? 'bg-gradient-to-b from-indigo-50/80 via-white to-amber-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-amber-950/20 border-amber-500 shadow-xl scale-[1.02]'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Most Popular for Faculty
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${price}</span>
                      <span className="text-xs text-slate-500 font-semibold">/ month</span>
                      {billingCycle === 'yearly' && plan.priceYearly > 0 && (
                        <span className="text-[10px] text-slate-400 block font-medium">
                          (billed ${plan.priceYearly}/year)
                        </span>
                      )}
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  {/* Features List */}
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isPro ? 'text-amber-500' : 'text-emerald-500'}`} />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrent || loadingTier === plan.id}
                    className={`w-full py-3 rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-default'
                        : isPro
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30 font-extrabold'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {loadingTier === plan.id ? (
                      'Updating Subscription...'
                    ) : isCurrent ? (
                      'Current Active Plan'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> 256-Bit SSL Encrypted Payment & Cancellation Anytime
          </span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Need Institutional University Invoicing? Contact sales@eduplanner.edu
          </span>
        </div>
      </div>
    </div>
  );
};

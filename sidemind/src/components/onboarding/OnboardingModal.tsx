// SideMind · First-Time Onboarding Modal (3-step tour)

import React, { useState } from 'react';
import { storage } from '../../lib/storage';
import { useI18n } from '../../lib/i18n';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { lang } = useI18n();
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const STEPS = [
    {
      num: 1,
      titleEn: 'Context-Aware Assistance',
      titleVi: 'Trích xuất Ngữ cảnh Tự động',
      descEn:
        'SideMind automatically analyzes the active tab (YouTube videos, articles, PDFs, docs) to answer questions grounded in the current page.',
      descVi:
        'SideMind tự động nhận diện và bóc tách nội dung tab bạn đang đọc (Video YouTube, bài báo, tài liệu PDF) để trả lời chính xác dựa trên ngữ cảnh.',
      icon: '🧠',
    },
    {
      num: 2,
      titleEn: 'Slash Commands & Citations',
      titleVi: 'Lệnh Nhanh Slash & Trích dẫn',
      descEn:
        'Type / in the chat box to quickly summarize, translate, or explain. Click [1], [2] in responses to jump directly to the source on the webpage.',
      descVi:
        'Gõ phím / để tóm tắt nhanh, dịch bài hoặc giải thích. Bấm vào các số trích dẫn [1], [2] để tự động cuộn đến đoạn gốc trên trang web.',
      icon: '⚡',
    },
    {
      num: 3,
      titleEn: 'Multi-Model & Zero-Proxy',
      titleVi: 'Bảo mật Client-Side & Đa mô hình',
      descEn:
        'Supply your own API key for OpenAI, Claude, or Gemini. Keys are encrypted with AES-GCM-256 and never pass through any proxy server.',
      descVi:
        'Tự cung cấp khoá API cho OpenAI, Claude, hoặc Gemini. Khoá được mã hoá bằng AES-GCM-256 và không bao giờ đi qua bất kỳ server trung gian nào.',
      icon: '🛡️',
    },
  ];

  const current = STEPS[step - 1];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    storage.set('sidemind_onboarding_completed', true);
    onComplete();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(var(--shadow-rgb), 0.75)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: 'var(--paper)',
          border: '2px solid var(--ink)',
          padding: '24px',
          width: '100%',
          maxWidth: '340px',
          boxShadow: '6px 6px 0 var(--ink)',
        }}
      >
        <div className="row between" style={{ marginBottom: '16px' }}>
          <span className="badge badge-accent" style={{ fontSize: '10px' }}>
            STEP {step} OF 3
          </span>
          <button
            type="button"
            className="text-xs text-muted btn-ghost"
            onClick={finish}
            style={{ textDecoration: 'underline' }}
          >
            Skip
          </button>
        </div>

        <div style={{ fontSize: '32px', marginBottom: '12px' }}>{current.icon}</div>

        <h3 className="text-headline" style={{ fontSize: '18px', marginBottom: '8px' }}>
          {lang === 'vi' ? current.titleVi : current.titleEn}
        </h3>

        <p className="text-sm text-muted" style={{ lineHeight: 1.6, marginBottom: '24px' }}>
          {lang === 'vi' ? current.descVi : current.descEn}
        </p>

        <div className="row between">
          <div className="row gap-1">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: s === step ? 'var(--accent)' : 'var(--rule)',
                  display: 'inline-block',
                }}
              />
            ))}
          </div>

          <button type="button" className="btn btn-filled btn-sm" onClick={handleNext}>
            {step === 3 ? (lang === 'vi' ? 'Bắt đầu ngay ↗' : 'Get Started ↗') : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

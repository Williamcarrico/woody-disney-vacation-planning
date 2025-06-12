'use client';

export function GlobalStyles() {
    return (
        <style jsx global>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }

      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
        50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.3); }
      }

      .animate-float {
        animation: float 3s ease-in-out infinite;
      }

      .animate-glow {
        animation: glow 2s ease-in-out infinite;
      }

      /* Custom Disney-inspired color variables */
      :root {
        --disney-blue: #1e40af;
        --disney-purple: #7c3aed;
        --disney-gold: #fbbf24;
        --disney-pink: #ec4899;
        --disney-green: #10b981;
      }

      /* Smooth scrolling for the entire page */
      html {
        scroll-behavior: smooth;
      }

      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: rgba(30, 64, 175, 0.1);
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #1e40af, #7c3aed);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #3b82f6, #8b5cf6);
      }
    `}</style>
    );
}
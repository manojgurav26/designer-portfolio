"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SessionWarningModalProps {
  isVisible: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

export default function SessionWarningModal({
  isVisible,
  timeRemaining,
  onExtend,
  onLogout,
}: SessionWarningModalProps) {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const mins = Math.floor(timeRemaining / 60000);
    const secs = Math.floor((timeRemaining % 60000) / 1000);
    setMinutes(mins);
    setSeconds(secs);
  }, [timeRemaining]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl p-8 max-w-sm mx-4"
      >
        <div className="text-center">
          <div className="text-6xl font-bold text-red-600 mb-4">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Session Expiring Soon
          </h2>

          <p className="text-gray-600 mb-6">
            Your session will expire in {minutes} minute{minutes !== 1 ? "s" : ""} and {seconds} second{seconds !== 1 ? "s" : ""} due to inactivity.
          </p>

          <p className="text-sm text-gray-500 mb-6">
            Click "Continue Session" to stay logged in or "Logout" to exit securely.
          </p>

          <div className="flex gap-4">
            <button
              onClick={onExtend}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Session
            </button>
            <button
              onClick={onLogout}
              className="flex-1 bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

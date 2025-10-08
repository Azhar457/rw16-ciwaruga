"use client";

import { useEffect } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: <FaCheckCircle className="text-emerald-500" size={24} />,
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-800",
    border: "border-emerald-500", // Tambahkan border color
  },
  error: {
    icon: <FaExclamationCircle className="text-red-500" size={24} />,
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
    border: "border-red-500", // Tambahkan border color
  },
  info: {
    icon: <FaInfoCircle className="text-blue-500" size={24} />,
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
    border: "border-blue-500", // Tambahkan border color
  },
};

export default function Toast({
  id,
  message,
  type,
  onClose,
  duration = 30000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [id, onClose, duration]);

  // Fallback jika tipe tidak valid untuk mencegah crash
  const config = toastConfig[type] || toastConfig.info;

  return (
    <div
      className={`max-w-xl w-full rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 ${config.bg} ${config.border} transform transition-all animate-toast-in`}
    >
      <div className="p-4 flex items-start">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className={`text-sm font-medium ${config.text}`}>{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => onClose(id)}
            className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <span className="sr-only">Close</span>
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

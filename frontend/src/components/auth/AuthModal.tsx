"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import * as Dialog from "@radix-ui/react-dialog";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onLoginSuccess: (email: string, password: string) => Promise<void>;
  onRegisterSuccess: (email: string, password: string, fullName: string) => Promise<void>;
  onGoogleAuth: () => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
};

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
  onLoginSuccess,
  onRegisterSuccess,
  onGoogleAuth,
  onForgotPassword,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
          </Dialog.Overlay>

          <Dialog.Content asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              {/* Close Button */}
              <Dialog.Close asChild>
                <button
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors z-10"
                  aria-label="Cerrar"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </Dialog.Close>

              {/* Header con Branding */}
              <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-6 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                {/* Logo DUBSAR AI */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-end justify-center gap-0.5 mb-4"
                >
                  <span className="text-xl font-light tracking-[0.1em] text-gray-800 dark:text-white font-quicksand">
                    DUBSAR
                  </span>
                  <span className="text-blue-600 dark:text-blue-500 text-base font-extralight tracking-tight translate-y-0.5">
                    AI
                  </span>
                </motion.div>

                {/* Title */}
                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4 font-quicksand">
                  {activeTab === "login" ? "Bienvenido de nuevo" : "Crear cuenta"}
                </Dialog.Title>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg">
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                      activeTab === "login"
                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    onClick={() => setActiveTab("register")}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                      activeTab === "register"
                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    Registrarse
                  </button>
                </div>
              </div>

              {/* Forms Container */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <AnimatePresence mode="wait">
                  {activeTab === "login" ? (
                    <LoginForm
                      key="login"
                      onSubmit={onLoginSuccess}
                      onGoogleAuth={onGoogleAuth}
                      onSwitchToRegister={() => setActiveTab("register")}
                      onForgotPassword={() => setShowForgotPassword(true)}
                    />
                  ) : (
                    <RegisterForm
                      key="register"
                      onSubmit={onRegisterSuccess}
                      onGoogleAuth={onGoogleAuth}
                      onSwitchToLogin={() => setActiveTab("login")}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSubmit={onForgotPassword}
      />
    </>
  );
}
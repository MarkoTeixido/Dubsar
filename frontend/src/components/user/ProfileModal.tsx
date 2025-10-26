"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, AlertTriangle, Trash2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { AvatarPicker } from "./AvatarPicker";
import { DeleteAccountModal } from "./DeleteAccountModal";
import type { User as UserType } from "@/types/user";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdateProfile: (data: { fullName?: string; avatar?: string }) => Promise<void>;
  onLogout?: () => void;
  onDeleteAccount?: () => Promise<void>; // ⚡ AGREGADO
};

export function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onLogout,
  onDeleteAccount, // ⚡ AGREGADO
}: ProfileModalProps) {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || "");
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // ⚡ AGREGADO

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdateProfile({
        fullName: fullName.trim() || undefined,
        avatar: selectedAvatar || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    if (onLogout) {
      onLogout();
      setShowLogoutConfirm(false);
      onClose();
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // ⚡ NUEVO: Handler para eliminar cuenta
  const handleDeleteAccount = async () => {
    if (onDeleteAccount) {
      await onDeleteAccount();
    }
  };

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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
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
                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white text-center font-quicksand">
                  Mi Perfil
                </Dialog.Title>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Avatar Picker */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Avatar
                  </label>
                  <AvatarPicker
                    currentAvatar={selectedAvatar}
                    userName={fullName || user.email}
                    onAvatarChange={setSelectedAvatar}
                  />
                </div>

                {/* Full Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </motion.button>

                  {onLogout && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogoutClick}
                      className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      Cerrar sesión
                    </motion.button>
                  )}

                  {/* ⚡ NUEVO: Separador */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                  </div>

                  {/* ⚡ NUEVO: Eliminar Cuenta */}
                  {onDeleteAccount && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDeleteModalOpen(true)}
                      className="w-full py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-200 dark:border-red-800"
                    >
                      <Trash2 size={18} />
                      Eliminar cuenta
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <Dialog.Root open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
            <Dialog.Portal>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                />
              </Dialog.Overlay>

              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[60] p-6"
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
                    </div>
                  </div>

                  {/* Title */}
                  <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2 font-quicksand">
                    ¿Cerrar sesión?
                  </Dialog.Title>

                  {/* Description */}
                  <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                    ¿Estás seguro que querés cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tus conversaciones.
                  </Dialog.Description>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={cancelLogout}
                      className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={confirmLogout}
                      className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Cerrar sesión
                    </motion.button>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </AnimatePresence>

      {/* ⚡ NUEVO: Modal de confirmación para eliminar cuenta */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        userName={user.fullName}
      />
    </>
  );
}
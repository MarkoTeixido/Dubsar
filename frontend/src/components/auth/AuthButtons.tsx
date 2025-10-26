"use client";

type AuthButtonsProps = {
  onLoginClick: () => void;
  onRegisterClick: () => void;
};

export function AuthButtons({ onLoginClick, onRegisterClick }: AuthButtonsProps) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <button
        onClick={onLoginClick}
        className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        Iniciar sesión
      </button>

      <button
        onClick={onRegisterClick}
        className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
      >
        Registrarse
      </button>
    </div>
  );
}
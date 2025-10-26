"use client";

type MobileAuthButtonsProps = {
  onLoginClick: () => void;
  onRegisterClick: () => void;
};

export function MobileAuthButtons({
  onLoginClick,
  onRegisterClick,
}: MobileAuthButtonsProps) {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 justify-center">
        <button
          onClick={onLoginClick}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Iniciar sesión
        </button>

        <button
          onClick={onRegisterClick}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
        >
          Registrarse
        </button>
      </div>
    </div>
  );
}
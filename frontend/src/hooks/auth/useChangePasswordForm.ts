import { useState } from "react";

type ChangePasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ValidationError = {
  field: keyof ChangePasswordFormData;
  message: string;
} | null;

export function useChangePasswordForm() {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const updateField = (field: keyof ChangePasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validate = (): ValidationError => {
    if (!formData.currentPassword) {
      return { field: "currentPassword", message: "Por favor ingresa tu contraseña actual" };
    }

    if (!formData.newPassword) {
      return { field: "newPassword", message: "Por favor ingresa una nueva contraseña" };
    }

    if (formData.newPassword.length < 6) {
      return { field: "newPassword", message: "La contraseña debe tener al menos 6 caracteres" };
    }

    if (formData.currentPassword === formData.newPassword) {
      return { field: "newPassword", message: "La nueva contraseña debe ser diferente a la actual" };
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return { field: "confirmPassword", message: "Las contraseñas no coinciden" };
    }

    return null;
  };

  const handleSubmit = async (
    onSubmit: (currentPassword: string, newPassword: string) => Promise<void>
  ) => {
    setError("");
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError.message);
      return false;
    }

    setLoading(true);

    try {
      await onSubmit(formData.currentPassword, formData.newPassword);
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar contraseña");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError("");
    setSuccess(false);
    setLoading(false);
  };

  return {
    formData,
    updateField,
    loading,
    error,
    success,
    handleSubmit,
    reset,
  };
}
import { useState } from "react";

type ResetPasswordFormData = {
  newPassword: string;
  confirmPassword: string;
};

type ValidationError = {
  field: keyof ResetPasswordFormData;
  message: string;
} | null;

export function useResetPasswordForm() {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const updateField = (field: keyof ResetPasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validate = (): ValidationError => {
    if (!formData.newPassword) {
      return { field: "newPassword", message: "Por favor ingresa una contraseña" };
    }

    if (formData.newPassword.length < 6) {
      return { field: "newPassword", message: "La contraseña debe tener al menos 6 caracteres" };
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return { field: "confirmPassword", message: "Las contraseñas no coinciden" };
    }

    return null;
  };

  const handleSubmit = async (
    onSubmit: (newPassword: string) => Promise<void>
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
      await onSubmit(formData.newPassword);
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al resetear contraseña");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFormData({
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
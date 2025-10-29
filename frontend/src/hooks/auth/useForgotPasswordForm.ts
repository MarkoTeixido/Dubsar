import { useState } from "react";

type ForgotPasswordFormData = {
  email: string;
};

type ValidationError = {
  field: keyof ForgotPasswordFormData;
  message: string;
} | null;

export function useForgotPasswordForm() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const updateField = (field: keyof ForgotPasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);
  };

  const validate = (): ValidationError => {
    if (!formData.email.trim()) {
      return { field: "email", message: "Por favor ingresa tu correo electrónico" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { field: "email", message: "Por favor ingresa un correo válido" };
    }

    return null;
  };

  const handleSubmit = async (
    onSubmit: (email: string) => Promise<void>
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
      await onSubmit(formData.email);
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar solicitud");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFormData({ email: "" });
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
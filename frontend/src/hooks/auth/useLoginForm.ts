import { useState } from "react";

type LoginFormData = {
  email: string;
  password: string;
};

type ValidationError = {
  field: keyof LoginFormData;
  message: string;
} | null;

export function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Actualizar un campo específico
  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Limpiar error al escribir
  };

  // Validar formulario
  const validate = (): ValidationError => {
    if (!formData.email.trim()) {
      return { field: "email", message: "Por favor ingresa tu correo electrónico" };
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { field: "email", message: "Por favor ingresa un correo válido" };
    }

    if (!formData.password) {
      return { field: "password", message: "Por favor ingresa tu contraseña" };
    }

    return null;
  };

  // Submit del formulario
  const handleSubmit = async (
    onSubmit: (email: string, password: string) => Promise<void>
  ) => {
    setError("");

    // Validar antes de enviar
    const validationError = validate();
    if (validationError) {
      setError(validationError.message);
      return false;
    }

    setLoading(true);

    try {
      await onSubmit(formData.email, formData.password);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const reset = () => {
    setFormData({
      email: "",
      password: "",
    });
    setError("");
    setLoading(false);
  };

  return {
    formData,
    updateField,
    loading,
    error,
    handleSubmit,
    reset,
  };
}
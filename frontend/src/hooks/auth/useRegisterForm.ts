import { useState } from "react";

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
};

type ValidationError = {
  field: keyof RegisterFormData;
  message: string;
} | null;

export function useRegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Actualizar un campo específico
  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Limpiar error al escribir
  };

  // Validar formulario
  const validate = (): ValidationError => {
    if (!formData.fullName.trim()) {
      return { field: "fullName", message: "Por favor ingresa tu nombre completo" };
    }

    if (!formData.email.trim()) {
      return { field: "email", message: "Por favor ingresa tu correo electrónico" };
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { field: "email", message: "Por favor ingresa un correo válido" };
    }

    if (!formData.password) {
      return { field: "password", message: "Por favor ingresa una contraseña" };
    }

    if (formData.password.length < 6) {
      return { field: "password", message: "La contraseña debe tener al menos 6 caracteres" };
    }

    if (formData.password !== formData.confirmPassword) {
      return { field: "confirmPassword", message: "Las contraseñas no coinciden" };
    }

    return null;
  };

  // Submit del formulario
  const handleSubmit = async (
    onSubmit: (email: string, password: string, fullName: string) => Promise<void>
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
      await onSubmit(formData.email, formData.password, formData.fullName);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
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
      confirmPassword: "",
      fullName: "",
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
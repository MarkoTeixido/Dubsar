import { supabase } from "../../config/database.js";

/**
 * Servicio para operaciones de conversaciones en Supabase
 */
export const conversationService = {
  // Crear nueva conversación
  async create(userId, title = "Nueva conversación") {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ 
        title,
        user_id: userId 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener todas las conversaciones de un usuario
  async getAllByUser(userId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener una conversación por ID
  async getById(conversationId, userId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar título de conversación
  async updateTitle(conversationId, userId, title) {
    const { data, error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar timestamp de última actividad
  async updateTimestamp(conversationId) {
    const { error } = await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (error) throw error;
  },

  // Eliminar conversación
  async delete(conversationId, userId) {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  // Verificar si el usuario es dueño de la conversación
  async verifyOwnership(conversationId, userId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();

    if (error || !data) return false;
    return true;
  },
};
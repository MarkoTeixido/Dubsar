import { useState, useEffect } from "react";
import { conversations as conversationsApi } from "@/lib/api/conversations";
import { storage } from "@/lib/storage";

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
};

export function useConversations(isAuthenticated: boolean) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar conversaciones al inicio
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadConversations = async () => {
    try {
      if (isAuthenticated) {
        // Limpiar conversaciones anónimas ANTES de cargar las del usuario
        storage.clearAnonymousConversations();
        storage.setCurrentAnonymousId('');
        setCurrentConversationId(null); // Limpiar conversación actual primero
        
        // Cargar desde API
        const data = await conversationsApi.getConversations();
        setConversations(data);
        
        // Si no hay conversaciones en la BD, crear una nueva
        if (data.length === 0) {
          console.log("📝 Usuario nuevo, creando primera conversación...");
          const newConv = await conversationsApi.createConversation("Nueva conversación");
          setConversations([newConv]);
          setCurrentConversationId(newConv.id);
        } else {
          // Seleccionar la más reciente
          setCurrentConversationId(data[0].id);
        }
        
      } else {
        // Cargar desde localStorage
        const anonymousConvs = storage.getAnonymousConversations();
        const formattedConvs: Conversation[] = anonymousConvs.map((conv) => ({
          id: conv.id,
          title: conv.title,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
        }));
        
        setConversations(formattedConvs);
        
        // Restaurar conversación actual desde localStorage
        const savedCurrentId = storage.getCurrentAnonymousId();
        if (savedCurrentId && formattedConvs.find(c => c.id === savedCurrentId)) {
          setCurrentConversationId(savedCurrentId);
        } else if (formattedConvs.length > 0) {
          setCurrentConversationId(formattedConvs[0].id);
          storage.setCurrentAnonymousId(formattedConvs[0].id);
        }
      }
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
      
      // Si hay error de autenticación, limpiar todo
      if (error instanceof Error && error.message.includes('401')) {
        storage.clearAnonymousConversations();
        storage.setCurrentAnonymousId('');
        setConversations([]);
        setCurrentConversationId(null);
      }
    }
  };

  const createConversation = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Crear en API
        const newConversation = await conversationsApi.createConversation("Nueva conversación");
        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversationId(newConversation.id);
        return newConversation;
      } else {
        // Crear en localStorage
        const newId = storage.generateAnonymousId();
        const now = new Date().toISOString();
        const newConversation: Conversation = {
          id: newId,
          title: "Nueva conversación",
          created_at: now,
          updated_at: now,
        };

        storage.saveAnonymousConversation({
          ...newConversation,
          messages: [],
        });

        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversationId(newId);
        storage.setCurrentAnonymousId(newId);
        
        return newConversation;
      }
    } catch (error) {
      console.error("Error creando conversación:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      if (isAuthenticated) {
        // Eliminar desde API
        await conversationsApi.deleteConversation(id);
      } else {
        // Eliminar desde localStorage
        storage.deleteAnonymousConversation(id);
      }
      
      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      
      // Si borramos la conversación activa, seleccionar otra
      if (currentConversationId === id) {
        const remaining = conversations.filter((conv) => conv.id !== id);
        if (remaining.length > 0) {
          setCurrentConversationId(remaining[0].id);
          if (!isAuthenticated) {
            storage.setCurrentAnonymousId(remaining[0].id);
          }
        } else {
          setCurrentConversationId(null);
          if (!isAuthenticated) {
            storage.setCurrentAnonymousId("");
          }
        }
      }
    } catch (error) {
      console.error("Error eliminando conversación:", error);
      throw error;
    }
  };

  const updateConversationTitle = async (id: string, title: string) => {
    try {
      if (isAuthenticated) {
        // Actualizar en API
        await conversationsApi.updateConversationTitle(id, title);
      } else {
        // Actualizar en localStorage
        const conv = storage.getAnonymousConversation(id);
        if (conv) {
          storage.saveAnonymousConversation({
            ...conv,
            title,
            updated_at: new Date().toISOString(),
          });
        }
      }
      
      setConversations((prev) =>
        prev.map((conv) => (conv.id === id ? { ...conv, title } : conv))
      );
    } catch (error) {
      console.error("Error actualizando título:", error);
      throw error;
    }
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
    if (!isAuthenticated) {
      storage.setCurrentAnonymousId(id);
    }
  };

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId: selectConversation,
    createConversation,
    deleteConversation,
    updateConversationTitle,
    loading,
    loadConversations,
  };
}
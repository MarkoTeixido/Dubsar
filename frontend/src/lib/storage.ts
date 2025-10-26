const ANONYMOUS_CONVERSATIONS_KEY = 'dubsar_anonymous_conversations';
const CURRENT_ANONYMOUS_ID_KEY = 'dubsar_current_anonymous_id';
const ANONYMOUS_MESSAGE_COUNT_KEY = 'dubsar_anonymous_message_count';
const ANONYMOUS_CONVERSATION_COUNT_KEY = 'dubsar_anonymous_conversation_count';
const ANONYMOUS_FILES_KEY = 'dubsar_anonymous_files';

type AnonymousMessage = {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
};

type AnonymousConversation = {
  id: string;
  title: string;
  messages: AnonymousMessage[];
  created_at: string;
  updated_at: string;
};

// Tipo para archivos anónimos
export interface AnonymousFile {
  id: string;
  name: string;
  type: string;
  size: number;
  base64: string;
  conversationId: string;
  timestamp: string;
}

class StorageService {
  // Generar ID único para conversaciones anónimas
  generateAnonymousId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obtener todas las conversaciones anónimas
  getAnonymousConversations(): AnonymousConversation[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(ANONYMOUS_CONVERSATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Obtener una conversación anónima específica
  getAnonymousConversation(id: string): AnonymousConversation | null {
    const conversations = this.getAnonymousConversations();
    return conversations.find(conv => conv.id === id) || null;
  }

  // Guardar conversación anónima
  saveAnonymousConversation(conversation: AnonymousConversation): void {
    if (typeof window === 'undefined') return;
    
    const conversations = this.getAnonymousConversations();
    const index = conversations.findIndex(conv => conv.id === conversation.id);
    
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }
    
    localStorage.setItem(ANONYMOUS_CONVERSATIONS_KEY, JSON.stringify(conversations));
  }

  // Eliminar conversación anónima
  deleteAnonymousConversation(id: string): void {
    if (typeof window === 'undefined') return;
    
    const conversations = this.getAnonymousConversations();
    const filtered = conversations.filter(conv => conv.id !== id);
    localStorage.setItem(ANONYMOUS_CONVERSATIONS_KEY, JSON.stringify(filtered));
  }

  // Limpiar todas las conversaciones anónimas
  clearAnonymousConversations(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(ANONYMOUS_CONVERSATIONS_KEY);
    localStorage.removeItem(CURRENT_ANONYMOUS_ID_KEY);
    localStorage.removeItem(ANONYMOUS_MESSAGE_COUNT_KEY);
    localStorage.removeItem(ANONYMOUS_CONVERSATION_COUNT_KEY);
    // ⚡ NUEVO: Limpiar archivos también
    localStorage.removeItem(ANONYMOUS_FILES_KEY);
  }

  // Guardar ID de conversación actual
  setCurrentAnonymousId(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CURRENT_ANONYMOUS_ID_KEY, id);
  }

  // Obtener ID de conversación actual
  getCurrentAnonymousId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(CURRENT_ANONYMOUS_ID_KEY);
  }

  // Contar mensajes anónimos
  getMessageCount(): number {
    if (typeof window === 'undefined') return 0;
    const count = localStorage.getItem(ANONYMOUS_MESSAGE_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  }

  setMessageCount(count: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ANONYMOUS_MESSAGE_COUNT_KEY, count.toString());
  }

  incrementMessageCount(): void {
    const current = this.getMessageCount();
    this.setMessageCount(current + 1);
  }

  resetMessageCount(): void {
    this.setMessageCount(0);
  }

  // Contar conversaciones anónimas
  getConversationCount(): number {
    if (typeof window === 'undefined') return 0;
    const count = localStorage.getItem(ANONYMOUS_CONVERSATION_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  }

  setConversationCount(count: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ANONYMOUS_CONVERSATION_COUNT_KEY, count.toString());
  }

  incrementConversationCount(): void {
    const current = this.getConversationCount();
    this.setConversationCount(current + 1);
  }

  resetConversationCount(): void {
    this.setConversationCount(0);
  }

  hasReachedMessageLimit(): boolean {
    const MESSAGE_LIMIT = 15;
    return this.getMessageCount() >= MESSAGE_LIMIT;
  }

  hasReachedConversationLimit(): boolean {
    const CONVERSATION_LIMIT = 3;
    return this.getConversationCount() >= CONVERSATION_LIMIT;
  }

  // Obtener mensajes restantes
  getRemainingMessages(): number {
    const MESSAGE_LIMIT = 15;
    return Math.max(0, MESSAGE_LIMIT - this.getMessageCount());
  }

  // Obtener conversaciones restantes
  getRemainingConversations(): number {
    const CONVERSATION_LIMIT = 3;
    return Math.max(0, CONVERSATION_LIMIT - this.getConversationCount());
  }

  // Resetear límites
  resetLimits(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ANONYMOUS_MESSAGE_COUNT_KEY);
    localStorage.removeItem(ANONYMOUS_CONVERSATION_COUNT_KEY);
  }

  // ==========================================
  // MÉTODOS PARA ARCHIVOS ANÓNIMOS
  // ==========================================

  /**
   * Obtener todos los archivos anónimos
   */
  getAnonymousFiles(): AnonymousFile[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(ANONYMOUS_FILES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error al leer archivos anónimos:", error);
      return [];
    }
  }

  /**
   * Guardar archivo anónimo
   */
  saveAnonymousFile(file: AnonymousFile): void {
    if (typeof window === 'undefined') return;
    
    const files = this.getAnonymousFiles();
    files.push(file);
    localStorage.setItem(ANONYMOUS_FILES_KEY, JSON.stringify(files));
  }

  /**
   * Contar archivos anónimos totales
   */
  getFileCount(): number {
    return this.getAnonymousFiles().length;
  }

  /**
   * Verificar si puede subir más archivos (límite: 2)
   */
  canUploadFile(): boolean {
    const FILE_LIMIT = 2;
    return this.getFileCount() < FILE_LIMIT;
  }

  /**
   * Obtener archivos restantes
   */
  getRemainingFiles(): number {
    const FILE_LIMIT = 2;
    return Math.max(0, FILE_LIMIT - this.getFileCount());
  }

  /**
   * Verificar si ha alcanzado el límite de archivos
   */
  hasReachedFileLimit(): boolean {
    const FILE_LIMIT = 2;
    return this.getFileCount() >= FILE_LIMIT;
  }

  /**
   * Convertir File a Base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Guardar archivo de usuario anónimo (convierte a Base64)
   */
  async uploadAnonymousFile(
    file: File,
    conversationId: string
  ): Promise<AnonymousFile> {
    // Verificar límite
    if (!this.canUploadFile()) {
      throw new Error("Has alcanzado el límite de 2 archivos. Regístrate gratis para subir hasta 4 archivos.");
    }

    // Validar tamaño (30MB)
    const MAX_SIZE = 30 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("El archivo es demasiado grande. Máximo: 30MB");
    }

    // Convertir a Base64
    const base64 = await this.fileToBase64(file);

    // Crear objeto de archivo
    const anonymousFile: AnonymousFile = {
      id: `anon_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      base64,
      conversationId,
      timestamp: new Date().toISOString(),
    };

    // Guardar
    this.saveAnonymousFile(anonymousFile);

    return anonymousFile;
  }

  /**
   * Limpiar archivos anónimos
   */
  clearAnonymousFiles(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ANONYMOUS_FILES_KEY);
  }
}

export const storage = new StorageService();
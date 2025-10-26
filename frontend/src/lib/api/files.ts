import { ApiClient } from './client';

/**
 * FilesApi - Gestiona todos los endpoints de archivos
 */
class FilesApi extends ApiClient {
  async uploadFile(file: File, conversationId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);

    return this.postFormData('/files/upload', formData);
  }

  async getFileUploadStatus() {
    return this.get('/files/status');
  }
}

export const files = new FilesApi();
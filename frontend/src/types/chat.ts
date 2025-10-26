export type Message = {
  sender: "user" | "bot";
  text: string;
  isStreaming?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
};

export interface ChatHookReturn {
  messages: Message[];
  input: string;
  loading: boolean;
  copiedIndex: number | null;
  setInput: (value: string) => void;
  sendMessage: () => void;
  copyToClipboard: (text: string, index: number) => void;
  selectedFile: File | null;
  fileError: string | null;
  handleFileSelect: (file: File) => void;
  handleRemoveFile: () => void;
}
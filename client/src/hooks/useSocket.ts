import { useSocketContext } from "@/contexts/SocketContext";

export const useSocket = () => {
  const { socket, on, off, emit } = useSocketContext();

  return { on, off, emit, socket };
};

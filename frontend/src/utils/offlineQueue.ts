// Offline message queue system

interface QueuedMessage {
  id: string;
  chatId: string;
  content: string;
  timestamp: number;
  type: 'message' | 'file';
  tempId: string; // Temporary ID for optimistic updates
}

interface QueuedAction {
  id: string;
  type: 'send_message' | 'mark_read' | 'create_chat';
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = 'chatrix_offline_queue';
const MESSAGE_QUEUE_KEY = 'chatrix_message_queue';
const MAX_RETRIES = 3;

// Message Queue Management
export const addMessageToQueue = (message: Omit<QueuedMessage, 'id' | 'timestamp'>): string => {
  const queue = getMessageQueue();
  const queuedMessage: QueuedMessage = {
    ...message,
    id: generateId(),
    timestamp: Date.now()
  };
  
  queue.push(queuedMessage);
  localStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(queue));
  
  console.log('[OfflineQueue] Message added to queue:', queuedMessage);
  return queuedMessage.id;
};

export const getMessageQueue = (): QueuedMessage[] => {
  try {
    const queue = localStorage.getItem(MESSAGE_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('[OfflineQueue] Failed to parse message queue:', error);
    return [];
  }
};

export const removeMessageFromQueue = (messageId: string): void => {
  const queue = getMessageQueue().filter(msg => msg.id !== messageId);
  localStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(queue));
  console.log('[OfflineQueue] Message removed from queue:', messageId);
};

export const clearMessageQueue = (): void => {
  localStorage.removeItem(MESSAGE_QUEUE_KEY);
  console.log('[OfflineQueue] Message queue cleared');
};

// Action Queue Management
export const addActionToQueue = (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>): string => {
  const queue = getActionQueue();
  const queuedAction: QueuedAction = {
    ...action,
    id: generateId(),
    timestamp: Date.now(),
    retryCount: 0
  };
  
  queue.push(queuedAction);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  
  console.log('[OfflineQueue] Action added to queue:', queuedAction);
  return queuedAction.id;
};

export const getActionQueue = (): QueuedAction[] => {
  try {
    const queue = localStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('[OfflineQueue] Failed to parse action queue:', error);
    return [];
  }
};

export const removeActionFromQueue = (actionId: string): void => {
  const queue = getActionQueue().filter(action => action.id !== actionId);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  console.log('[OfflineQueue] Action removed from queue:', actionId);
};

export const incrementRetryCount = (actionId: string): void => {
  const queue = getActionQueue();
  const action = queue.find(a => a.id === actionId);
  if (action) {
    action.retryCount++;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
};

// Sync functionality
export const syncOfflineQueue = async (): Promise<void> => {
  if (!navigator.onLine) {
    console.log('[OfflineQueue] Cannot sync - still offline');
    return;
  }

  console.log('[OfflineQueue] Starting sync...');
  
  const actionQueue = getActionQueue();
  const messageQueue = getMessageQueue();
  
  // Process action queue
  for (const action of actionQueue) {
    if (action.retryCount >= MAX_RETRIES) {
      console.warn('[OfflineQueue] Max retries reached for action:', action.id);
      removeActionFromQueue(action.id);
      continue;
    }

    try {
      await processQueuedAction(action);
      removeActionFromQueue(action.id);
      console.log('[OfflineQueue] Action synced successfully:', action.id);
    } catch (error) {
      console.error('[OfflineQueue] Failed to sync action:', action.id, error);
      incrementRetryCount(action.id);
    }
  }

  // Process message queue
  for (const message of messageQueue) {
    try {
      await processQueuedMessage(message);
      removeMessageFromQueue(message.id);
      console.log('[OfflineQueue] Message synced successfully:', message.id);
    } catch (error) {
      console.error('[OfflineQueue] Failed to sync message:', message.id, error);
    }
  }

  console.log('[OfflineQueue] Sync completed');
};

// Process individual queued items
const processQueuedAction = async (action: QueuedAction): Promise<void> => {
  // This would integrate with your API service
  // For now, we'll just simulate the API call
  switch (action.type) {
    case 'send_message':
      // await api.post('/messages', action.data);
      break;
    case 'mark_read':
      // await api.put(`/chats/${action.data.chatId}/read`);
      break;
    case 'create_chat':
      // await api.post('/chats', action.data);
      break;
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

const processQueuedMessage = async (message: QueuedMessage): Promise<void> => {
  // This would integrate with your message sending API
  // For now, we'll just simulate the API call
  console.log('[OfflineQueue] Processing queued message:', message);
  // await api.post(`/chats/${message.chatId}/messages`, {
  //   content: message.content,
  //   type: message.type
  // });
};

// Utility functions
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Queue statistics
export const getQueueStats = () => {
  const actionQueue = getActionQueue();
  const messageQueue = getMessageQueue();
  
  return {
    totalActions: actionQueue.length,
    totalMessages: messageQueue.length,
    failedActions: actionQueue.filter(a => a.retryCount > 0).length,
    oldestAction: actionQueue.length > 0 ? Math.min(...actionQueue.map(a => a.timestamp)) : null,
    oldestMessage: messageQueue.length > 0 ? Math.min(...messageQueue.map(m => m.timestamp)) : null
  };
};

// Auto-sync when coming back online
let syncTimeout: NodeJS.Timeout;

export const initializeOfflineQueue = (): void => {
  // Sync when coming back online
  window.addEventListener('online', () => {
    console.log('[OfflineQueue] Back online, starting sync...');
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(syncOfflineQueue, 1000); // Delay to ensure connection is stable
  });

  // Periodic sync attempt (every 30 seconds when online)
  setInterval(() => {
    if (navigator.onLine) {
      const stats = getQueueStats();
      if (stats.totalActions > 0 || stats.totalMessages > 0) {
        console.log('[OfflineQueue] Periodic sync attempt');
        syncOfflineQueue();
      }
    }
  }, 30000);

  console.log('[OfflineQueue] Offline queue initialized');
}; 
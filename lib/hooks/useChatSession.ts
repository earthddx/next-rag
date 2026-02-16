"use client";

import React from "react";
import { useChat } from "@ai-sdk/react";

export function useChatSession() {
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = React.useState(true);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const sessionIdRef = React.useRef<string | null>(null);
  const isInitializingRef = React.useRef(false);

  // Update ref when sessionId changes
  React.useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const chat = useChat();

  // Override sendMessage to include sessionId
  const sendMessageWithSession = React.useCallback(async (message: { text: string }) => {
    const currentSessionId = sessionIdRef.current;
    console.log('🔄 Sending message with sessionId:', currentSessionId);

    if (!currentSessionId) {
      console.error('No sessionId available');
      return;
    }

    // Set streaming state
    setIsStreaming(true);

    // Create user message
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: message.text }],
    };

    // Add user message to UI immediately
    const updatedMessages = [...chat.messages, userMessage];
    chat.setMessages(updatedMessages);

    try {
      // Call API with sessionId
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          sessionId: currentSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      let assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: '' }],
      };

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          console.log('📨 Received line:', line.substring(0, 200)); // Log first 200 chars

          // Parse Server-Sent Events format
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6); // Remove 'data: ' prefix

            if (dataStr === '[DONE]') {
              console.log('✅ Stream completed');
              continue;
            }

            try {
              const data = JSON.parse(dataStr);
              console.log('✅ Parsed data type:', data.type, 'Full data:', data);

              // Handle different message types - check ALL possible text fields
              if (data.type === 'text-delta' || data.type === 'text' || data.type === 'text-start') {
                const textContent = data.textDelta || data.text || data.delta || data.content || '';
                if (textContent) {
                  console.log('📝 Adding text:', textContent);
                  assistantMessage.parts[0].text += textContent;
                  chat.setMessages([...updatedMessages, { ...assistantMessage }]);
                }
              } else if (data.type === 'tool-call' || data.type === 'tool-result') {
                console.log('🔧 Tool:', data);
              } else if (data.type.includes('text')) {
                // Log any other text-related types
                console.log('📄 Text-related message:', data);
              }
            } catch (e) {
              console.error('❌ Parse error:', e, 'Line:', line.substring(0, 200));
            }
          }
        }
      }

      // Final update
      const finalMessages = [...updatedMessages, assistantMessage];
      chat.setMessages(finalMessages);

      // Save all messages to database (including the new assistant response)
      try {
        await fetch(`/api/sessions/${currentSessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: finalMessages }),
        });
        console.log('💾 Messages saved to database');
      } catch (saveError) {
        console.error('❌ Failed to save messages:', saveError);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message to user
      const errorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: 'Sorry, there was an error processing your message.' }],
      };
      chat.setMessages([...updatedMessages, errorMessage]);
    } finally {
      // Always reset streaming state
      setIsStreaming(false);
    }
  }, [chat]);

  // Ensure session is created before allowing messages
  const isReady = !isLoadingSession && sessionId !== null;

  // Shared helper to POST a new session and apply its ID everywhere
  const applyNewSession = async (): Promise<string | null> => {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat" }),
    });

    if (!response.ok) return null;

    const { session } = await response.json();
    setSessionId(session.id);
    sessionIdRef.current = session.id;
    localStorage.setItem("currentSessionId", session.id);

    const url = new URL(window.location.href);
    url.searchParams.set("session", session.id);
    window.history.replaceState({}, "", url.toString());

    return session.id;
  };

  // Load or create session on mount
  React.useEffect(() => {
    const initSession = async () => {
      // Prevent duplicate initialization (React Strict Mode causes double-mount)
      if (isInitializingRef.current) {
        console.log('⏭️ Skipping duplicate session initialization');
        return;
      }

      isInitializingRef.current = true;

      try {
        // Check if there's a session ID in URL or localStorage
        const params = new URLSearchParams(window.location.search);
        const urlSessionId = params.get("session");
        const storageSessionId = localStorage.getItem("currentSessionId");
        const existingSessionId = urlSessionId || storageSessionId;

        if (existingSessionId) {
          // Try to load existing session
          const response = await fetch(`/api/sessions/${existingSessionId}`);

          if (response.ok) {
            const { session } = await response.json();
            setSessionId(session.id);
            sessionIdRef.current = session.id;
            localStorage.setItem("currentSessionId", session.id);
            console.log('✅ Loaded existing session:', session.id);

            // Load messages into chat
            if (session.messages && session.messages.length > 0) {
              const formattedMessages = session.messages.map((msg: any) => ({
                id: msg.id,
                role: msg.role,
                parts: [{ type: "text" as const, text: msg.content }],
                metadata: msg.metadata,
              }));
              chat.setMessages(formattedMessages);
              console.log('📥 Loaded', session.messages.length, 'messages from DB');
            }

            setIsLoadingSession(false);
            return;
          }
        }

        // Create new session if no existing session found
        const newId = await applyNewSession();
        if (newId) {
          console.log('✨ Created new session:', newId);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      } finally {
        setIsLoadingSession(false);
        isInitializingRef.current = false;
      }
    };

    initSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const createNewSession = async () => {
    try {
      const newId = await applyNewSession();
      if (newId) {
        chat.setMessages([]);
        console.log('🆕 Started new session:', newId);
      }
      return newId;
    } catch (error) {
      console.error("Error creating new session:", error);
    }
    return null;
  };

  return {
    ...chat,
    sendMessage: sendMessageWithSession,
    sessionId,
    isLoadingSession,
    isStreaming,
    isReady,
    createNewSession,
  };
}

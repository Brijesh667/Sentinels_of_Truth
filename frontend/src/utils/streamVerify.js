import { getStoredGuestId } from "../auth/AuthContext";

const RAW_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const BACKEND_URL = RAW_URL.replace(/\/+$/, "");

export async function streamVerify({
  query,
  signal,
  token,
  onProgress,
  onResult,
  onError,
  retryOnExpired,
}) {
  let hasTerminalEvent = false;

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      const guestId = getStoredGuestId();
      if (guestId) {
        headers["X-Guest-Id"] = guestId;
      }
    }

    const response = await fetch(`${BACKEND_URL}/get/validate-stream`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
      signal,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `Request failed with status ${response.status}` };
      }

      if (response.status === 401 && errorData?.code === "TOKEN_EXPIRED" && retryOnExpired) {
        const newToken = await retryOnExpired();
        if (newToken) {
          return streamVerify({
            query,
            signal,
            token: newToken,
            onProgress,
            onResult,
            onError,
            retryOnExpired: null, // do not retry recursively
          });
        }
      }

      hasTerminalEvent = true;
      onError?.(errorData, response.status);
      return;
    }

    if (!response.body) {
      hasTerminalEvent = true;
      onError?.({ error: "No response body received" }, response.status);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() || "";

      for (const block of blocks) {
        if (!block.trim()) continue;
        const lines = block.split("\n");
        let event = "message";
        let data = "";

        for (const line of lines) {
          if (line.startsWith(":")) {
            // Heartbeat ping comment
            continue;
          }
          if (line.startsWith("event:")) {
            event = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            data += (data ? "\n" : "") + line.slice(5).trim();
          }
        }

        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (event === "progress") {
              onProgress?.(parsed.stage);
            } else if (event === "result") {
              hasTerminalEvent = true;
              onResult?.(parsed);
            } else if (event === "error") {
              hasTerminalEvent = true;
              onError?.(parsed, response.status);
            }
          } catch (e) {
            console.error("Failed to parse SSE event data:", data, e);
          }
        }
      }
    }

    if (!hasTerminalEvent && !signal?.aborted) {
      onError?.({ error: "Connection closed unexpectedly before receiving a result." }, 0);
    }
  } catch (error) {
    if (signal?.aborted || error.name === "AbortError") {
      return;
    }
    onError?.({ error: error.message || "Network error" }, 0);
  }
}

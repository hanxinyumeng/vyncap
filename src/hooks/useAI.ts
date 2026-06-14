import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AIConfig } from '../types';

export function useAI(config: AIConfig) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askAI = useCallback(async (imageBase64: string, prompt?: string) => {
    if (!config.apiKey) {
      setError('请先配置 API Key');
      return;
    }

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const body = {
        model: config.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt || config.prompt },
              { type: 'image_url', image_url: { url: imageBase64 } },
            ],
          },
        ],
        max_tokens: 2048,
      };

      const endpoint = config.apiUrl.endsWith('/chat/completions')
        ? config.apiUrl
        : config.apiUrl.replace(/\/+$/, '') + '/chat/completions';

      const resp = await invoke<{ status: number; body: string }>('fetch_ai', {
        req: {
          url: endpoint,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify(body),
        },
      });

      if (resp.status < 200 || resp.status >= 300) {
        throw new Error(`API 错误 (${resp.status}): ${resp.body.substring(0, 200)}`);
      }

      const data = JSON.parse(resp.body);
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('API 返回内容为空');
      setAnswer(content);
    } catch (e: any) {
      setError(`${e.name}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const clearAnswer = useCallback(() => {
    setAnswer(null);
    setError(null);
  }, []);

  return { askAI, answer, loading, error, clearAnswer };
}

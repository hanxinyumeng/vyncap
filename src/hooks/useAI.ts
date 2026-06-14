import { useState, useCallback, useEffect } from 'react';
import { AIConfig } from '../types';

const STORAGE_KEY = 'ai-config';

const defaultConfig: AIConfig = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  model: 'gpt-4o',
  prompt: '请根据截图内容回答问题。如果截图中有题目，请给出详细解答。',
};

export function useAI() {
  const [config, setConfig] = useState<AIConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });

  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const askAI = useCallback(async (imageBase64: string) => {
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
              { type: 'text', text: config.prompt },
              { type: 'image_url', image_url: { url: imageBase64 } },
            ],
          },
        ],
        max_tokens: 2048,
      };

      console.log('[AI] Request URL:', config.apiUrl);
      console.log('[AI] Model:', config.model);
      console.log('[AI] API Key:', config.apiKey.substring(0, 8) + '...');
      console.log('[AI] Body size:', JSON.stringify(body).length, 'bytes');

      const resp = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      console.log('[AI] Response status:', resp.status, resp.statusText);

      if (!resp.ok) {
        const errText = await resp.text();
        console.error('[AI] Error response:', errText);
        throw new Error(`API 错误 (${resp.status}): ${errText.substring(0, 200)}`);
      }

      const data = await resp.json();
      console.log('[AI] Response data:', JSON.stringify(data).substring(0, 300));
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('API 返回内容为空');
      setAnswer(content);
    } catch (e: any) {
      console.error('[AI] Exception:', e);
      console.error('[AI] Exception name:', e.name);
      console.error('[AI] Exception message:', e.message);
      setError(`${e.name}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const clearAnswer = useCallback(() => {
    setAnswer(null);
    setError(null);
  }, []);

  return { config, setConfig, askAI, answer, loading, error, clearAnswer };
}

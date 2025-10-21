import { useEffect, useState } from 'react';
import { getTelegramWebApp, getTelegramUser, initTelegramWebApp } from '@/integrations/telegram/telegram-webapp';

export const useTelegram = () => {
  const [webApp, setWebApp] = useState(getTelegramWebApp());
  const [user, setUser] = useState(getTelegramUser());

  useEffect(() => {
    const app = initTelegramWebApp();
    setWebApp(app);
    setUser(getTelegramUser());
  }, []);

  return {
    webApp,
    user,
    isInTelegram: !!webApp,
  };
};

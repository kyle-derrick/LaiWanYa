const NICKNAME_KEY = 'nickname';

export const getNickname = (): string | null => localStorage.getItem(NICKNAME_KEY);
export const setNickname = (name: string): void => localStorage.setItem(NICKNAME_KEY, name);
export const clearNickname = (): void => localStorage.removeItem(NICKNAME_KEY);

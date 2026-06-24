import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getNickname, setNickname } from '../utils/storage';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [nickname, setNicknameState] = useState(getNickname() || '');
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(nickname);

  const currentLang = i18n.language.startsWith('zh') ? 'zh' : 'en';

  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === 'zh' ? 'en' : 'zh');
  };

  const handleSaveNickname = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setNickname(trimmed);
      setNicknameState(trimmed);
      setEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveNickname();
    if (e.key === 'Escape') {
      setTempName(nickname);
      setEditing(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 no-underline">
          🎮 {t('appTitle')}
        </Link>

        {/* Right: Nickname + Language */}
        <div className="flex items-center gap-4">
          {/* Nickname */}
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
                maxLength={20}
                autoFocus
              />
              <button
                onClick={handleSaveNickname}
                className="px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('save')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                👤 <span className="font-medium">{nickname || t('nicknamePlaceholder')}</span>
              </span>
              <button
                onClick={() => {
                  setTempName(nickname);
                  setEditing(true);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {t('changeNickname')}
              </button>
            </div>
          )}

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700"
          >
            {currentLang === 'zh' ? 'EN' : '中'}
          </button>

          {/* Back to home (show when not on home) */}
          {window.location.pathname !== '/' && (
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {t('backToHome')}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

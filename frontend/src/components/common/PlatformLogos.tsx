import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// 1. WhatsApp Authentic Launcher Logo
export const WhatsAppLogo: React.FC<LogoProps> = ({ size = 36, style, className }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: 'linear-gradient(135deg, #25D366, #128C7E)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)',
      flexShrink: 0,
      ...style
    }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
      <path 
        fill="#FFFFFF" 
        d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
      />
    </svg>
  </div>
);

// 2. Instagram Authentic Launcher Logo
export const InstagramLogo: React.FC<LogoProps> = ({ size = 36, style, className }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(214, 36, 159, 0.35)',
      flexShrink: 0,
      ...style
    }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.2" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="#FFFFFF" />
    </svg>
  </div>
);

// 3. Google Messages / SMS Authentic Logo
export const MessagesLogo: React.FC<LogoProps> = ({ size = 36, style, className }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: 'linear-gradient(135deg, #1A73E8, #1557B0)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(26, 115, 232, 0.35)',
      flexShrink: 0,
      ...style
    }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
      <path 
        d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" 
        fill="#FFFFFF" 
      />
      <circle cx="7.5" cy="10" r="1.5" fill="#1A73E8" />
      <circle cx="12" cy="10" r="1.5" fill="#1A73E8" />
      <circle cx="16.5" cy="10" r="1.5" fill="#1A73E8" />
    </svg>
  </div>
);

// 4. Gmail / Email Authentic Launcher Logo
export const EmailLogo: React.FC<LogoProps> = ({ size = 36, style, className }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: '#FFFFFF',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(234, 67, 53, 0.25)',
      flexShrink: 0,
      ...style
    }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v.2l10 6.3 10-6.3V6z" />
      <path fill="#EA4335" d="M22 6.2l-10 6.3L2 6.2V18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6.2z" />
      <path fill="#FBBC05" d="M2 6.2V18c0 1.1.9 2 2 2h2V10.5L2 6.2z" />
      <path fill="#34A853" d="M22 6.2V18c0 1.1-.9 2-2 2h-2V10.5l4-4.3z" />
    </svg>
  </div>
);

// 5. Chrome / Web Browser Authentic Logo
export const WebBrowserLogo: React.FC<LogoProps> = ({ size = 36, style, className }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: '#FFFFFF',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(66, 133, 244, 0.25)',
      flexShrink: 0,
      ...style
    }}
  >
    <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#EA4335" />
      <path d="M12 2a10 10 0 0 1 8.66 15l-5-8.66H7.34L12 2z" fill="#FBBC05" />
      <path d="M12 22a10 10 0 0 1-8.66-15l5 8.66h8.32L12 22z" fill="#34A853" />
      <circle cx="12" cy="12" r="4.5" fill="#FFFFFF" />
      <circle cx="12" cy="12" r="3.2" fill="#4285F4" />
    </svg>
  </div>
);

// 6. Google Photos / Media Gallery Authentic Logo
export const PhotosLogo: React.FC<LogoProps> = ({ size = 36, style, className }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: '#FFFFFF',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(251, 188, 5, 0.25)',
      flexShrink: 0,
      ...style
    }}
  >
    <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 12V6.5A5.5 5.5 0 0 0 6.5 12H12z" />
      <path fill="#4285F4" d="M12 12h5.5A5.5 5.5 0 0 0 12 6.5V12z" />
      <path fill="#34A853" d="M12 12v5.5A5.5 5.5 0 0 0 17.5 12H12z" />
      <path fill="#FBBC05" d="M12 12H6.5A5.5 5.5 0 0 0 12 17.5V12z" />
    </svg>
  </div>
);

// 7. YouTube / Video Stream Authentic Logo
export const VideosLogo: React.FC<LogoProps> = ({ size = 36, style, className }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: 'linear-gradient(135deg, #FF0000, #CC0000)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(255, 0, 0, 0.35)',
      flexShrink: 0,
      ...style
    }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
      <path 
        d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9C2 8.87 2 12 2 12s0 3.13.42 4.81a2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9c.42-1.68.42-4.81.42-4.81s0-3.13-.42-4.81z" 
        fill="#FF0000"
      />
      <polygon points="9.6,15.6 15.6,12 9.6,8.4" fill="#FFFFFF" />
    </svg>
  </div>
);

// 8. Google News / Articles Authentic Logo
export const NewsLogo: React.FC<LogoProps> = ({ size = 36, style, className }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: '#FFFFFF',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(66, 133, 244, 0.25)',
      flexShrink: 0,
      ...style
    }}
  >
    <svg width={size * 0.64} height={size * 0.64} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
      <path fill="#FFFFFF" d="M6 7h7v4H6zm0 5h7v1H6zm0 2h7v1H6zm8-7h4v1h-4zm0 2h4v1h-4zm0 2h4v1h-4zm0 2h4v1h-4z" />
      <path fill="#EA4335" d="M6 16h12v2H6z" />
    </svg>
  </div>
);

// 9. Files / Google Drive / Secure Storage Logo
export const FilesLogo: React.FC<LogoProps> = ({ size = 36, style, className }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: '#FFFFFF',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0, 172, 71, 0.25)',
      flexShrink: 0,
      ...style
    }}
  >
    <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24">
      <path fill="#FFBA00" d="M7.7 3.5h8.6l6 10.4-4.3 7.5H9.4l-6-10.4 4.3-7.5z" opacity="0" />
      <path fill="#FFBA00" d="M16.3 3.5H7.7L3.4 11l4.3 7.4 8.6-14.9z" />
      <path fill="#0066DA" d="M20.6 13.9l-4.3-7.4H7.7l4.3 7.4h8.6z" />
      <path fill="#00AC47" d="M7.7 18.4H20.6L16.3 11H3.4l4.3 7.4z" />
    </svg>
  </div>
);

// 10. Social Profiles Launcher Logo
export const SocialProfilesLogo: React.FC<LogoProps> = ({ size = 36, style, className }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.35)',
      flexShrink: 0,
      ...style
    }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#FFFFFF" />
    </svg>
  </div>
);

// Helper function to get the authentic logo by channel/modality ID
export const getPlatformLogo = (id: string, size = 38) => {
  switch (id.toLowerCase()) {
    case 'whatsapp':
      return <WhatsAppLogo size={size} />;
    case 'instagram':
      return <InstagramLogo size={size} />;
    case 'messages':
    case 'sms':
    case 'message':
      return <MessagesLogo size={size} />;
    case 'email':
    case 'mail':
    case 'gmail':
      return <EmailLogo size={size} />;
    case 'web':
    case 'url':
    case 'urls':
    case 'browser':
      return <WebBrowserLogo size={size} />;
    case 'photos':
    case 'photo':
    case 'image':
    case 'gallery':
      return <PhotosLogo size={size} />;
    case 'videos':
    case 'video':
    case 'youtube':
      return <VideosLogo size={size} />;
    case 'news':
    case 'article':
      return <NewsLogo size={size} />;
    case 'files':
    case 'file':
    case 'drive':
    case 'vault':
      return <FilesLogo size={size} />;
    case 'social':
    case 'profile':
    case 'profiles':
      return <SocialProfilesLogo size={size} />;
    default:
      return <MessagesLogo size={size} />;
  }
};

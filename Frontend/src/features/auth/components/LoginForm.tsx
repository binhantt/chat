import { useEffect, useRef, useState } from 'react';
import { Alert, Card, Spin, Typography } from 'antd';
import { SafetyOutlined, GoogleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/auth.store';

const { Title, Text } = Typography;

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_SCRIPT_ID = 'google-gsi-client';
const GOOGLE_BUTTON_WIDTH = 340;

const cardStyles = {
  width: 'min(92vw, 460px)',
  borderRadius: 28,
  border: '1px solid rgba(255, 255, 255, 0.44)',
  background: 'rgba(255, 255, 255, 0.92)',
  boxShadow: '0 28px 80px rgba(2, 6, 23, 0.38)',
  backdropFilter: 'blur(18px)',
};

const cardBodyStyles = {
  padding: 'clamp(20px, 2.4vw, 28px)',
};

const headerStyles = {
  textAlign: 'center' as const,
  marginBottom: 18,
};

const eyebrowStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 12px',
  borderRadius: 999,
  background: 'rgba(37, 99, 235, 0.08)',
  color: '#1d4ed8',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

const titleStyles = {
  marginTop: 12,
  marginBottom: 8,
  color: '#0f172a',
  lineHeight: 1.08,
};

const subtitleStyles = {
  color: '#475569',
  lineHeight: 1.55,
  fontSize: 14,
  margin: 0,
};

const alertStyles = {
  marginBottom: 14,
  borderRadius: 16,
};

const googleWrapStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 52,
};

const googleSlotStyles = {
  width: '100%',
  maxWidth: GOOGLE_BUTTON_WIDTH,
  minHeight: 44,
  display: 'flex',
  justifyContent: 'center',
};

const noteStyles = {
  marginTop: 14,
  textAlign: 'center' as const,
  color: '#64748b',
  fontSize: 13,
  lineHeight: 1.55,
};

const hintStyles = {
  marginTop: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  color: '#94a3b8',
  fontSize: 12,
};

export default function LoginForm() {
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const { loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    let active = true;

    const initializeGoogleSignIn = () => {
      if (!active || !window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            clearError();
            await loginWithGoogle(response.credential);
          } catch (err: any) {
            console.error('Google login error:', err.message);
          }
        },
        auto_select: false,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: GOOGLE_BUTTON_WIDTH,
        shape: 'pill',
        text: 'continue_with',
      });
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript && window.google?.accounts?.id) {
      setGoogleScriptLoaded(true);
      initializeGoogleSignIn();
      return () => {
        active = false;
      };
    }

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = GOOGLE_SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (!active) return;
        setGoogleScriptLoaded(true);
        initializeGoogleSignIn();
      };

      document.head.appendChild(script);
    }

    return () => {
      active = false;
    };
  }, []);

  return (
    <Spin spinning={isLoading} tip="Đang đăng nhập...">
      <Card bordered={false} style={cardStyles} bodyStyle={cardBodyStyles}>
        <div style={headerStyles}>
          <div style={eyebrowStyles}>
            <SafetyOutlined />
            Đăng nhập bằng Google
          </div>
          <Title level={2} style={titleStyles}>
            Chọn tài khoản Google của bạn
          </Title>
          <Text style={subtitleStyles}>
            Nhanh hơn, gọn hơn và phù hợp nếu hệ thống chỉ cho phép đăng nhập
            bằng Gmail.
          </Text>
        </div>

        {error && (
          <Alert
            message="Đăng nhập thất bại"
            description={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={alertStyles}
          />
        )}

        <div style={googleWrapStyles}>
          <div ref={googleButtonRef} style={googleSlotStyles} />
        </div>

        {!googleScriptLoaded && (
          <div style={hintStyles}>
            <GoogleOutlined />
            <span>Đang chuẩn bị nút đăng nhập Google...</span>
          </div>
        )}

        <Text style={noteStyles}>
          Chỉ cần một tài khoản Google để truy cập đầy đủ vào hệ thống.
        </Text>
      </Card>
    </Spin>
  );
}

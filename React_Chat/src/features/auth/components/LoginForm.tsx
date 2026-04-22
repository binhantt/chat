import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Alert,
  Row,
  Col,
  Divider,
  Spin,
  Typography,
} from 'antd';
import { GoogleOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/auth.store';
import type { FormInstance } from 'antd';

const { Title, Text } = Typography;

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginForm() {
  const [form] = Form.useForm<FormInstance>();
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const { login, loginWithGoogle, isLoading, error, clearError } =
    useAuthStore();

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleScriptLoaded(true);
      initializeGoogleSignIn();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize Google Sign-In
  const initializeGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      });

      const googleButton = document.getElementById('google-signin-button');
      if (googleButton) {
        window.google.accounts.id.renderButton(googleButton, {
          theme: 'filled_black',
          size: 'large',
          width: '100%',
        });
      }
    }
  };

  // Handle Google login response
  const handleGoogleResponse = async (response: any) => {
    try {
      clearError();
      await loginWithGoogle(response.credential);
    } catch (err: any) {
      console.error('Google login error:', err.message);
    }
  };

  // Handle email/password login
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      clearError();
      await login(values.email, values.password);
    } catch (err: any) {
      console.error('Login error:', err.message);
    }
  };

  return (
    <Spin spinning={isLoading} tip="Logging in...">
      <Card style={{ maxWidth: 420, width: '100%', margin: '0 auto', borderRadius: 12, boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)' }}>
        <Row justify="center" style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Welcome to Chat
          </Title>
        </Row>

        {error && (
          <Alert
            message="Login Failed"
            description={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
          disabled={isLoading}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: 'Please enter your email',
              },
              {
                type: 'email',
                message: 'Please enter a valid email',
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your.email@example.com"
              size="large"
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: 'Please enter your password',
              },
              {
                min: 6,
                message: 'Password must be at least 6 characters',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
              disabled={isLoading}
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <Divider>OR</Divider>

        <div
          id="google-signin-button"
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        />

        {!googleScriptLoaded && (
          <Row justify="center">
            <Text type="secondary">Loading Google Sign-In...</Text>
          </Row>
        )}

        <Divider />

        <Row justify="center">
          <Text type="secondary">
            Don&apos;t have an account?{' '}
            <a href="/register" style={{ color: '#1890ff' }}>
              Sign up here
            </a>
          </Text>
        </Row>
      </Card>
    </Spin>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Row, Col } from 'antd';
import { useAuthStore } from '../store/auth.store';
import LoginForm from '../components/LoginForm';

const { Content } = Layout;

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();

  // Redirect to chat if already logged in
  useEffect(() => {
    if (user && accessToken) {
      navigate('/chat/tro-chuyen', { replace: true });
    }
  }, [user, accessToken, navigate]);

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'  }}>
      <Content>
        <Row
          gutter={4}
          justify="center"
          align="middle"
          style={{ minHeight: '100vh' , width : "50vw" , outline : "none" }}
        >
          <Col xs={24} sm={20} md={16} lg={12} xl={10}>
            <LoginForm />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

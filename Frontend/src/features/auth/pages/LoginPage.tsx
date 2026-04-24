import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Col,
  Grid,
  Layout,
  Row,
  Tag,
  Typography,
} from 'antd';
import {
  GoogleOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/auth.store';
import LoginForm from '../components/LoginForm';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const pageStyles = {
  minHeight: '100vh',
  height: '100vh',
  position: 'relative' as const,
  overflow: 'hidden',
  background:
    'radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 30%), radial-gradient(circle at 85% 20%, rgba(99, 102, 241, 0.18), transparent 24%), linear-gradient(135deg, #08111f 0%, #0d1728 52%, #12233a 100%)',
};

const contentStyles = {
  height: '100vh',
  padding: 'clamp(16px, 3vw, 36px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative' as const,
};

const shellStyles = {
  width: '100%',
  maxWidth: 1240,
  margin: '0 auto',
};

const leftPanelStyles = {
  paddingRight: 'clamp(0px, 2vw, 24px)',
};

const brandStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  marginBottom: 22,
};

const brandMarkStyles = {
  width: 54,
  height: 54,
  borderRadius: 18,
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #60a5fa, #2563eb)',
  color: '#fff',
  fontWeight: 800,
  fontSize: 18,
  boxShadow: '0 18px 40px rgba(37, 99, 235, 0.35)',
};

const eyebrowStyles = {
  display: 'block',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.18em',
  fontSize: 11,
  color: 'rgba(226, 232, 240, 0.72)',
  marginBottom: 4,
};

const brandNameStyles = {
  margin: 0,
  color: '#fff',
  lineHeight: 1.1,
};

const headlineStyles = {
  margin: 0,
  color: '#fff',
  maxWidth: '12ch',
  lineHeight: 1.02,
  fontSize: 'clamp(2.3rem, 3.2vw, 3.8rem)',
  letterSpacing: '-0.03em',
};

const accentStyles = {
  display: 'inline-block',
  background: 'linear-gradient(90deg, #93c5fd 0%, #e0f2fe 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const copyStyles = {
  marginTop: 16,
  marginBottom: 20,
  color: 'rgba(226, 232, 240, 0.84)',
  fontSize: '0.98rem',
  lineHeight: 1.65,
  maxWidth: 560,
};

const benefitsStyles = {
  display: 'grid',
  gap: 10,
  maxWidth: 520,
};

const benefitCardStyles = {
  padding: 14,
  borderRadius: 18,
  border: '1px solid rgba(148, 163, 184, 0.18)',
  background: 'rgba(15, 23, 42, 0.42)',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 14px 34px rgba(2, 6, 23, 0.18)',
  color: '#fff',
};

const benefitRowStyles = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
};

const benefitIconStyles = {
  width: 34,
  height: 34,
  borderRadius: 11,
  display: 'grid',
  placeItems: 'center',
  color: '#bfdbfe',
  background: 'rgba(59, 130, 246, 0.18)',
  flex: '0 0 auto',
  marginTop: 2,
};

const benefitTitleStyles = {
  margin: 0,
  color: '#fff',
  fontSize: 15,
  lineHeight: 1.3,
};

const benefitDescriptionStyles = {
  marginTop: 4,
  color: 'rgba(226, 232, 240, 0.78)',
  lineHeight: 1.45,
  fontSize: 13,
};

const panelStyles = {
  display: 'flex',
  justifyContent: 'center',
};

const panelFrameStyles = {
  width: '100%',
  maxWidth: 460,
};

const smallTagStyles = {
  marginBottom: 14,
  padding: '5px 12px',
  borderRadius: 999,
  border: '1px solid rgba(148, 163, 184, 0.26)',
  background: 'rgba(15, 23, 42, 0.46)',
  color: '#dbeafe',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, isInitialized } = useAuthStore();
  const screens = Grid.useBreakpoint();
  const showLeftPanel = !!screens.lg;

  useEffect(() => {
    if (isInitialized && user) {
      navigate('/chat/tro-chuyen', { replace: true });
    }
  }, [isInitialized, user, navigate]);

  return (
    <Layout style={pageStyles}>
      <Content style={contentStyles}>
        <Row
          align="middle"
          gutter={[32, 24]}
          justify={showLeftPanel ? 'space-between' : 'center'}
          style={shellStyles}
        >
          {showLeftPanel && (
            <Col xs={24} lg={12} style={leftPanelStyles}>
              <div style={brandStyles}>
                <div style={brandMarkStyles}>C</div>
                <div>
                  <Text style={eyebrowStyles}>Không gian chat</Text>
                  <Title level={3} style={brandNameStyles}>
                    ConvoSpace
                  </Title>
                </div>
              </div>

              <Tag style={smallTagStyles}>
                <GoogleOutlined /> Chỉ dùng tài khoản Google
              </Tag>

              <Title level={1} style={headlineStyles}>
                Vào lại <span style={accentStyles}>không gian làm việc</span>{' '}
                của bạn.
              </Title>

              <Paragraph style={copyStyles}>
                Đăng nhập nhanh bằng Gmail để vào hệ thống một cách an toàn,
                gọn gàng và đúng chuẩn doanh nghiệp.
              </Paragraph>

              <div style={benefitsStyles}>
                <Card bordered={false} style={benefitCardStyles} bodyStyle={{ padding: 0 }}>
                  <div style={benefitRowStyles}>
                    <div style={benefitIconStyles}>
                      <SafetyCertificateOutlined />
                    </div>
                    <div>
                      <Title level={5} style={benefitTitleStyles}>
                        An toàn hơn
                      </Title>
                      <Text style={benefitDescriptionStyles}>
                        Không cần nhớ mật khẩu riêng, chỉ xác thực bằng Google.
                      </Text>
                    </div>
                  </div>
                </Card>

                <Card bordered={false} style={benefitCardStyles} bodyStyle={{ padding: 0 }}>
                  <div style={benefitRowStyles}>
                    <div style={benefitIconStyles}>
                      <ThunderboltOutlined />
                    </div>
                    <div>
                      <Title level={5} style={benefitTitleStyles}>
                        Nhanh hơn
                      </Title>
                      <Text style={benefitDescriptionStyles}>
                        Một thao tác là vào ngay, không thêm bước thừa.
                      </Text>
                    </div>
                  </div>
                </Card>

                <Card bordered={false} style={benefitCardStyles} bodyStyle={{ padding: 0 }}>
                  <div style={benefitRowStyles}>
                    <div style={benefitIconStyles}>
                      <LockOutlined />
                    </div>
                    <div>
                      <Title level={5} style={benefitTitleStyles}>
                        Rõ ràng
                      </Title>
                      <Text style={benefitDescriptionStyles}>
                        Giao diện tập trung, dễ hiểu và đồng bộ với sản phẩm.
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>
            </Col>
          )}

          <Col xs={24} lg={10} xl={9} style={panelStyles}>
            <div style={panelFrameStyles}>
              <LoginForm />
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

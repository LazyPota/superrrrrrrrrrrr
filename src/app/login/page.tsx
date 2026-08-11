'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Form, Input, Button, Alert, Typography, Tag, Space } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined, ShopOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { loginUser } from '../../lib/store';

const { Title, Text, Paragraph } = Typography;

export default function LoginPage() {
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number>(0);

  async function onFinish(values: any) {
    setFormError('');

    const now = Date.now();
    if (lockedUntil > now) {
      const remainSec = Math.ceil((lockedUntil - now) / 1000);
      setFormError(`⏳ Terlalu banyak percobaan gagal. Coba lagi dalam ${remainSec} detik.`);
      return;
    }

    setLoading(true);

    const result = await loginUser(values.email.trim().toLowerCase(), values.password);

    if (!result.ok) {
      const newFailed = failedAttempts + 1;
      setFailedAttempts(newFailed);
      if (newFailed >= 5) {
        setLockedUntil(Date.now() + 60000);
        setFormError('🔒 Akun terkunci sementara! 5x percobaan gagal. Tunggu 60 detik.');
        setFailedAttempts(0);
      } else {
        setFormError(`${result.error} (Percobaan ${newFailed}/5)`);
      }
      setLoading(false);
      return;
    }

    setFailedAttempts(0);
    setLoading(false);
    router.push('/');
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <Card 
          className="animate-slide-up"
          style={{ 
            width: '100%', 
            maxWidth: 460, 
            borderRadius: 24, 
            boxShadow: '0 20px 50px rgba(0, 51, 153, 0.1)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '12px 8px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ 
              width: 56, 
              height: 56, 
              borderRadius: 18, 
              background: 'linear-gradient(135deg, #0b192c 0%, #0052cc 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 20px rgba(0,82,204,0.3)',
              border: '1px solid rgba(0, 242, 254, 0.3)'
            }}>
              <ShopOutlined style={{ fontSize: 28, color: '#00f2fe' }} />
            </div>

            <Tag color="blue" icon={<SafetyCertificateOutlined />} style={{ marginBottom: 10, padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>
              Khusus Mahasiswa PresUniv
            </Tag>

            <Title level={2} style={{ margin: '4px 0 6px 0', fontWeight: 800, fontSize: 24 }}>Masuk Akun Kampus</Title>
            <Text type="secondary" style={{ fontSize: 14 }}>Selamat datang kembali di PresUMart</Text>
          </div>

          {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 20, borderRadius: 12 }} />}

          <Form form={form} layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              label="Email Kampus (@student.president.ac.id)"
              name="email"
              rules={[
                { required: true, message: 'Email kampus wajib diisi!' },
                { type: 'email', message: 'Format email tidak valid!' },
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="nama@student.president.ac.id" style={{ borderRadius: 12 }} />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Password wajib diisi!' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Masukkan password" style={{ borderRadius: 12 }} />
            </Form.Item>

            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading} 
              icon={<LoginOutlined />} 
              className="btn-gradient-primary"
              style={{ height: 48, fontSize: 16, fontWeight: 700, borderRadius: 14, marginTop: 8 }}
            >
              Masuk Sekarang
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
            <Text type="secondary">Belum punya akun kampus? </Text>
            <Link href="/register" style={{ fontWeight: 700, color: '#0052cc' }}>Daftar Akun Baru</Link>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  );
}

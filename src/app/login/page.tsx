'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Form, Input, Button, Alert, Typography, Space, Tag } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { loginUser } from '../../lib/store';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  function onFinish(values) {
    setFormError('');
    setLoading(true);

    const result = loginUser(values.email.trim().toLowerCase(), values.password);

    if (!result.ok) {
      setFormError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push('/');
  }

  function handleQuickLogin(email, password) {
    form.setFieldsValue({ email, password });
    onFinish({ email, password });
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#f8fafc' }}>
        <Card style={{ width: '100%', maxWidth: 440, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <ShopOutlined style={{ fontSize: 40, color: '#0052cc', marginBottom: 8 }} />
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Masuk PresUMart</Title>
            <Text type="secondary">Selamat datang kembali, Mahasiswa PresUniv!</Text>
          </div>

          {/* Quick Demo Accounts Helper */}
          <Card size="small" style={{ marginBottom: 24, background: '#f0f9ff', borderColor: '#bae6fd', borderRadius: 12 }}>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6, color: '#0369a1' }}>
              💡 Pilihan Akun Demo Uji Coba:
            </Text>
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <div>
                  <Text strong>1. Rina S. (Penjual)</Text>
                  <div style={{ color: '#0284c7' }}>rina.s@student.president.ac.id</div>
                </div>
                <Button size="small" type="primary" ghost onClick={() => handleQuickLogin('rina.s@student.president.ac.id', 'password123')}>
                  Masuk Penjual
                </Button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
                <div>
                  <Text strong>2. Ahmad R. (Pembeli IT 2026)</Text>
                  <div style={{ color: '#0284c7' }}>ahmad.r@student.president.ac.id</div>
                </div>
                <Button size="small" type="primary" onClick={() => handleQuickLogin('ahmad.r@student.president.ac.id', 'password123')}>
                  Masuk Pembeli
                </Button>
              </div>
            </Space>
          </Card>

          {formError && <Alert title={formError} type="error" showIcon style={{ marginBottom: 20, borderRadius: 8 }} />}

          <Form form={form} layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              label="Email Kampus Resmi"
              name="email"
              rules={[
                { required: true, message: 'Email wajib diisi!' },
                { type: 'email', message: 'Format email tidak valid!' },
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="nama@student.president.ac.id" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Password wajib diisi!' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Masukkan password" />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<LoginOutlined />} style={{ height: 44, fontSize: 16, marginTop: 8 }}>
              Masuk
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
            <Text type="secondary">Belum punya akun? </Text>
            <Link href="/register" style={{ fontWeight: 600, color: '#0052cc' }}>Daftar Akun Baru</Link>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  );
}

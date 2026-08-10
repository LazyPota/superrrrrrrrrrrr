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

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number>(0);

  async function onFinish(values) {
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
      <main style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#f8fafc' }}>
        <Card style={{ width: '100%', maxWidth: 440, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <ShopOutlined style={{ fontSize: 40, color: '#0052cc', marginBottom: 8 }} />
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Masuk PresUMart</Title>
            <Text type="secondary">Selamat datang kembali, Mahasiswa PresUniv!</Text>
          </div>



          {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 20, borderRadius: 8 }} />}

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

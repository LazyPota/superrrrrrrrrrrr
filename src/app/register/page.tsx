'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Form, Input, Select, Button, Alert, Row, Col, Typography, Tag, Space } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, UserAddOutlined, SafetyCertificateOutlined, BookOutlined } from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { registerUser } from '../../lib/store';
import MAJORS from '../../lib/majors';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const router = useRouter();

  async function onFinish(values: any) {
    setFormError('');

    // Anti-bot honeypot check
    if (honeypot) {
      // Bot trapped!
      setLoading(false);
      setFormError('Pendaftaran gagal. Terdeteksi aktivitas otomatis.');
      return;
    }

    // Rate throttle: max 1 submission every 5 seconds per browser session
    const now = Date.now();
    if (now - lastSubmitTime < 5000) {
      setFormError('Mohon tunggu beberapa detik sebelum mencoba mendaftar lagi.');
      return;
    }
    setLastSubmitTime(now);

    const emailLower = values.email.trim().toLowerCase();
    
    if (!emailLower.endsWith('@student.president.ac.id') && !emailLower.endsWith('@president.ac.id')) {
      setFormError('Pendaftaran khusus email kampus President University (@student.president.ac.id / @president.ac.id).');
      return;
    }

    if (values.password.length < 8) {
      setFormError('Password minimal 8 karakter untuk keamanan akun.');
      return;
    }

    setLoading(true);

    const result = await registerUser({
      name: values.name.trim(),
      email: emailLower,
      password: values.password,
      major: values.major,
      batch: values.batch,
    });

    if (!result.ok) {
      setFormError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push('/');
  }

  const batches = [];
  for (let y = new Date().getFullYear() + 1; y >= 2015; y--) {
    batches.push(y);
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <Card 
          className="animate-slide-up"
          style={{ 
            width: '100%', 
            maxWidth: 540, 
            borderRadius: 24, 
            boxShadow: '0 20px 50px rgba(0, 51, 153, 0.1)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '12px 8px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img 
              src="/logo.png" 
              alt="PresUMart Logo" 
              style={{ 
                height: 64, 
                width: 'auto',
                objectFit: 'contain',
                marginBottom: 12,
                filter: 'drop-shadow(3px 3px 0px #000000)'
              }} 
            />
            <br />
            <Tag color="blue" icon={<SafetyCertificateOutlined />} style={{ marginBottom: 10, padding: '4px 14px', borderRadius: 20, fontWeight: 700 }}>
              Khusus Komunitas President University
            </Tag>
            <Title level={2} style={{ margin: '4px 0 6px 0', fontWeight: 800, fontSize: 26 }}>Daftar Akun PresUMart</Title>
            <Text type="secondary" style={{ fontSize: 14 }}>Isi identitas mahasiswamu dengan benar untuk mulai jual beli</Text>
          </div>

          {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 20, borderRadius: 12 }} />}

          <Form layout="vertical" onFinish={onFinish} size="large">
            {/* Anti-bot Honeypot Field (Hidden from human users) */}
            <div style={{ display: 'none', visibility: 'hidden', position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input
                type="text"
                name="website_url_verification"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
            <Form.Item
              label="Nama Lengkap Mahasiswa"
              name="name"
              rules={[
                { required: true, message: 'Nama lengkap wajib diisi!' },
                { min: 3, message: 'Nama minimal 3 karakter!' },
              ]}
            >
              <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Contoh: Ahmad Fauzi" style={{ borderRadius: 12 }} />
            </Form.Item>

            <Form.Item
              label="Email Kampus Resmi (@student.president.ac.id)"
              name="email"
              rules={[
                { required: true, message: 'Email kampus wajib diisi!' },
                { type: 'email', message: 'Format email tidak valid!' },
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="nama@student.president.ac.id" style={{ borderRadius: 12 }} />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={14}>
                <Form.Item
                  label="Major / Program Studi"
                  name="major"
                  rules={[{ required: true, message: 'Pilih major!' }]}
                >
                  <Select 
                    placeholder="Pilih Major" 
                    options={MAJORS.map(m => ({ label: m, value: m }))} 
                    style={{ borderRadius: 12 }} 
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={10}>
                <Form.Item
                  label="Angkatan"
                  name="batch"
                  initialValue="2024"
                  rules={[{ required: true, message: 'Pilih angkatan!' }]}
                >
                  <Select 
                    options={batches.map(b => ({ label: `Angkatan ${b}`, value: String(b) }))} 
                    style={{ borderRadius: 12 }} 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: 'Password wajib diisi!' },
                    { min: 8, message: 'Minimal 8 karakter!' },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Minimal 8 karakter" style={{ borderRadius: 12 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Konfirmasi Password"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Konfirmasi password wajib!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Password tidak cocok!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Ulangi password" style={{ borderRadius: 12 }} />
                </Form.Item>
              </Col>
            </Row>

            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading} 
              icon={<UserAddOutlined />} 
              className="btn-gradient-primary"
              style={{ height: 48, fontSize: 16, fontWeight: 700, borderRadius: 14, marginTop: 12 }}
            >
              Daftar Akun Kampus
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
            <Text type="secondary">Sudah memiliki akun? </Text>
            <Link href="/login" style={{ fontWeight: 700, color: '#0052cc' }}>Masuk Sekarang</Link>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  );
}

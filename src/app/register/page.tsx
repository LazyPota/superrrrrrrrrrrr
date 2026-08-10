'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Form, Input, Select, Button, Alert, Row, Col, Typography, Tag } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, UserAddOutlined, IdcardOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { registerUser } from '../../lib/store';
import MAJORS from '../../lib/majors';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onFinish(values) {
    setFormError('');
    const emailLower = values.email.trim().toLowerCase();
    // SECURITY V7: Use endsWith() to prevent bypass like hacker@president.ac.id.evil.com
    if (!emailLower.endsWith('@student.president.ac.id') && !emailLower.endsWith('@president.ac.id')) {
      setFormError('Pendaftaran khusus email kampus President University (@student.president.ac.id / @president.ac.id).');
      return;
    }

    // SECURITY: Password strength check
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
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#f8fafc' }}>
        <Card style={{ width: '100%', maxWidth: 540, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Tag color="blue" icon={<SafetyCertificateOutlined />} style={{ marginBottom: 8, padding: '2px 10px', fontSize: 12 }}>
              Khusus Komunitas President University
            </Tag>
            <Title level={3} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Daftar Akun PresUMart</Title>
            <Text type="secondary">Isi data identitas mahasiswamu dengan benar</Text>
          </div>

          {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 20, borderRadius: 8 }} />}

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              label="Nama Lengkap"
              name="name"
              rules={[
                { required: true, message: 'Nama lengkap wajib diisi!' },
                { min: 3, message: 'Nama minimal 3 karakter!' },
              ]}
            >
              <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Contoh: Ahmad Fauzi" />
            </Form.Item>

            <Form.Item
              label="Email Kampus Resmi (@president.ac.id)"
              name="email"
              rules={[
                { required: true, message: 'Email kampus wajib diisi!' },
                { type: 'email', message: 'Format email tidak valid!' },
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="nama@student.president.ac.id" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: 'Password wajib diisi!' },
                    { min: 8, message: 'Minimal 8 karakter untuk keamanan!' },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Minimal 6 karakter" />
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
                  <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Ulangi password" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Major / Program Studi"
                  name="major"
                  rules={[{ required: true, message: 'Pilih major!' }]}
                >
                  <Select placeholder="Pilih Major" options={MAJORS.map(m => ({ label: m, value: m }))} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Angkatan / Batch"
                  name="batch"
                  rules={[{ required: true, message: 'Pilih angkatan!' }]}
                >
                  <Select placeholder="Pilih Angkatan" options={batches.map(b => ({ label: `Angkatan ${b}`, value: String(b) }))} />
                </Form.Item>
              </Col>
            </Row>

            <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<UserAddOutlined />} style={{ height: 44, fontSize: 16, marginTop: 8 }}>
              Daftar Sekarang
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
            <Text type="secondary">Sudah memiliki akun? </Text>
            <Link href="/login" style={{ fontWeight: 600, color: '#0052cc' }}>Masuk di sini</Link>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  );
}

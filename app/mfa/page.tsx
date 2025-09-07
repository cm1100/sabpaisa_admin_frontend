'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StyledCard as Card, CentralTitle, CentralText, CentralButton as Button, StyledSpace as Space, CentralAlert as Alert, CentralProgress as Progress, Tabs, List, Tag, App } from '@/components/ui';
import { SafetyOutlined, MobileOutlined, MailOutlined, KeyOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import MFAApi from '@/services/api/MFAApiService';

// Typography components imported directly from centralized UI
const Link = ({ children, onClick, href, ...props }: any) => <a onClick={onClick} href={href} {...props} style={{ cursor: 'pointer' }}>{children}</a>;
// TabPane is available in Tabs object

const MFAPage: React.FC = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeMethod, setActiveMethod] = useState<'totp' | 'sms' | 'email'>('totp');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const [setupDeviceId, setSetupDeviceId] = useState<number | null>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [setupQr, setSetupQr] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Preload backup codes count (optional)
    (async () => {
      try {
        await MFAApi.getBackupCodesCount();
      } catch {}
    })();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '')) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (fullCode: string) => {
    setLoading(true);
    setError(null);
    try {
      if (setupDeviceId) {
        const resp = await MFAApi.verifySetup(setupDeviceId, fullCode);
        if (resp.success) {
          message.success('MFA setup completed');
          setSetupDeviceId(null);
          setSetupSecret(null);
          setSetupQr(null);
          setCode(['', '', '', '', '', '']);
          return;
        }
        setError(resp.error || 'Invalid verification code');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }
      // Fallback demo verify
      await new Promise(resolve => setTimeout(resolve, 400));
      setError('Please start MFA setup first.');
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = () => {
    setTimeLeft(30);
    setError(null);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const startSetup = async () => {
    try {
      setLoading(true);
      const resp = await MFAApi.setup('Authenticator');
      if (resp.success && resp.data) {
        setSetupDeviceId(resp.data.device_id);
        setSetupSecret(resp.data.secret);
        setSetupQr(resp.data.qr_code);
        message.success('MFA setup initiated. Scan the QR code.');
      } else {
        setError(resp.error || 'Failed to start MFA setup');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to start MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const renderCodeInput = () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', margin: 'var(--spacing-xl) 0' }}>
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleCodeChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={loading}
          style={{
            width: 50,
            height: 60,
            fontSize: 'var(--font-size-24)',
            textAlign: 'center',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--border-radius-sm)',
            outline: 'none',
            transition: 'var(--transition-base)',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            ...(digit && {
              borderColor: 'var(--color-primary)',
              background: 'var(--color-primary-bg)'
            })
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-primary)';
            e.target.style.boxShadow = 'var(--shadow-primary-focus)';
          }}
          onBlur={(e) => {
            if (!e.target.value) {
              e.target.style.borderColor = 'var(--color-border)';
            }
            e.target.style.boxShadow = 'none';
          }}
        />
      ))}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--glass-bg-gradient)',
      padding: 'var(--spacing-lg)'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-card-xl)',
          background: 'var(--glass-bg-card)',
          backdropFilter: 'var(--glass-backdrop-filter)',
          border: 'var(--glass-border)'
        }}
        bodyStyle={{ padding: 'var(--spacing-xxxxl)' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--glass-bg-primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-lg)',
              boxShadow: 'var(--shadow-primary)'
            }}>
            <SafetyOutlined style={{ fontSize: 'var(--font-size-40)', color: 'var(--color-white)' }} />
            </div>
            <CentralTitle level={2} style={{ margin: 0, color: 'var(--color-text-primary)' }}>Two-Factor Authentication</CentralTitle>
            <CentralText type="secondary">
              Enter the verification code to continue
            </CentralText>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Tabs
            activeKey={activeMethod}
            onChange={(key) => setActiveMethod(key as any)}
            centered
          >
            <Tabs.TabPane
              tab={
                <span>
                  <KeyOutlined />
                  Authenticator App
                </span>
              }
              key="totp"
            >
              <div style={{ textAlign: 'center', padding: 'var(--spacing-lg) 0' }}>
                {!setupQr ? (
                  <>
                    <CentralText type="secondary">Set up MFA using an authenticator app</CentralText>
                    <Button type="primary" onClick={startSetup} loading={loading}>Start Setup</Button>
                  </>
                ) : (
                  <>
                    <CentralText strong>Scan this QR code in your Authenticator app</CentralText>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
                      <img src={`data:image/png;base64,${setupQr}`} width={180} height={180} alt="MFA QR" />
                    </div>
                    <CentralText type="secondary">Secret: {setupSecret}</CentralText>
                    <CentralText>Then enter the 6‑digit code below</CentralText>
                    {renderCodeInput()}
                  </>
                )}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <span>
                  <MobileOutlined />
                  SMS
                </span>
              }
              key="sms"
            >
              <div style={{ textAlign: 'center', padding: 'var(--spacing-lg) 0' }}>
                <CentralText>Enter the code sent to your phone ending in ***4567</CentralText>
                {renderCodeInput()}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <span>
                  <MailOutlined />
                  Email
                </span>
              }
              key="email"
            >
              <div style={{ textAlign: 'center', padding: 'var(--spacing-lg) 0' }}>
                <CentralText>Enter the code sent to your email</CentralText>
                {renderCodeInput()}
              </div>
            </Tabs.TabPane>
          </Tabs>

          <div style={{ textAlign: 'center' }}>
            <Progress
              percent={(timeLeft / 30) * 100}
              showInfo={false}
              strokeColor={{
                '0%': 'var(--color-primary)',
                '100%': 'var(--color-primary-dark)'
              }}
              style={{ marginBottom: 'var(--spacing-sm)' }}
            />
            <CentralText type="secondary">
              Code expires in {timeLeft} seconds
            </CentralText>
          </div>

          <Button
            block
            size="large"
            icon={<ReloadOutlined />}
            onClick={resendCode}
            disabled={timeLeft > 25}
            style={{ height: 48 }}
          >
            Resend Code
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Link onClick={() => router.push('/login')}>
              Use a different account
            </Link>
          </div>

          <div style={{
            textAlign: 'center',
            paddingTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--color-border-secondary)'
          }}>
            <CentralText type="secondary" style={{ fontSize: 12 }}>
              Having trouble? Contact{' '}
              <Link href="mailto:support@sabpaisa.com">support@sabpaisa.com</Link>
            </CentralText>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default MFAPage;

'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, List, Tag, CentralButton as Button, App, CentralPageContainer } from '@/components/ui';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import ReportsApiService, { GeneratedReport, ReportTemplate } from '@/services/api/ReportsApiService';
import Link from 'next/link';

export default function ReportsLandingPage() {
  const { message } = App.useApp();
  const [generated, setGenerated] = useState<GeneratedReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [g, t] = await Promise.all([
          ReportsApiService.listGenerated().catch(() => [] as any),
          ReportsApiService.listTemplates().catch(() => [] as any),
        ]);
        setGenerated(g as any);
        setTemplates(t as any);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onDownload = async (r: GeneratedReport) => {
    try {
      const blob = await ReportsApiService.download(r.report_id);
      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement('a');
      a.href = url;
      a.download = r.file_path?.split('/').pop() || 'report';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      message.error(e?.message || 'Download failed');
    }
  };

  return (
    <CentralPageContainer withBackground title="Reports">
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
        <ResponsiveRow gutter={16}>
        <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
          <StyledCard data-testid="reports-landing">
          {/* message context via App */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <Link href="/reports/export"><Button type="primary">Export Center</Button></Link>
            <Link href="/reports/builder"><Button>Report Builder</Button></Link>
            <Link href="/reports/scheduled"><Button>Scheduled Reports</Button></Link>
            <Link href="/reports/templates"><Button>Templates</Button></Link>
          </div>
          <CentralTitle level={5}>Recent Generated Reports</CentralTitle>
          <List
            size="small"
            dataSource={generated}
            renderItem={(item) => (
              <List.Item actions={[<a key="d" onClick={() => onDownload(item)}>Download</a>] }>
                <CentralText>
                  <Tag>{item.status}</Tag>
                  {item.template_name || 'Report'} • {new Date(item.generated_at).toLocaleString()} • {item.file_path?.split('/').pop()}
                </CentralText>
              </List.Item>
            )}
          />
          <CentralTitle level={5} style={{ marginTop: 16 }}>Templates</CentralTitle>
          <List
            size="small"
            dataSource={templates}
            renderItem={(t) => (
              <List.Item>
                <CentralText>
                  <Tag>{t.report_type}</Tag>
                  {t.name} • {t.format.toUpperCase()}
                </CentralText>
              </List.Item>
            )}
          />
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>
      </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}

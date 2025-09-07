'use client';

import React, { useEffect, useState } from 'react';
import CentralPageContainer from '@/components/ui/CentralPageContainer';
import { StyledCard, CentralButton, StyledSpace, CentralProTable, message } from '@/components/ui';
import { builderService, CustomDashboardDTO } from '@/services/api/BuilderApiService';
import { useRouter } from 'next/navigation';

const SavedDashboardsPage: React.FC = () => {
  const [items, setItems] = useState<CustomDashboardDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    try {
      const list = await builderService.listDashboards();
      setItems(list);
    } catch (e: any) {
      message.error(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const validateOne = async (id: number) => {
    try {
      const r = await builderService.validateDashboard(id);
      if (r.ok) message.success('Validation OK'); else message.error(r.error || 'Validation failed');
    } catch (e: any) {
      message.error(e?.message || 'Validation failed');
    }
  };

  const deleteOne = async (id: number) => {
    try {
      await builderService.deleteDashboard(id);
      message.success('Deleted');
      load();
    } catch (e: any) {
      message.error(e?.message || 'Delete failed');
    }
  };

  return (
    <CentralPageContainer withBackground title="My Dashboards">
      <StyledCard>
        <CentralProTable
          rowKey={(r: any) => r.id}
          loading={loading}
          search={false}
          options={false}
          dataSource={items}
          columns={[
            { title: 'Title', dataIndex: 'title' },
            { title: 'Updated', dataIndex: 'updated_at' },
            { title: 'Actions', key: 'actions', valueType: 'option', render: (_: any, r: CustomDashboardDTO) => [
              <CentralButton key="view" type="link" onClick={() => router.push(`/dashboard/custom/${r.id}`)}>Open</CentralButton>,
              <CentralButton key="edit" type="link" onClick={() => router.push(`/dashboard/custom/${r.id}/edit`)}>Edit</CentralButton>,
              <CentralButton key="validate" type="link" onClick={() => validateOne(Number(r.id))}>Validate</CentralButton>,
              <CentralButton key="delete" type="link" danger onClick={() => deleteOne(Number(r.id))}>Delete</CentralButton>,
            ] },
          ]}
          pagination={{ pageSize: 10 }}
          className="transaction-table"
        />
      </StyledCard>
    </CentralPageContainer>
  );
};

export default SavedDashboardsPage;

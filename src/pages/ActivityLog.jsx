import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Table from '../components/Table/Table';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';

function ActivityLog() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    username: '',
    action: '',
    date_from: '',
    date_to: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    actions: [],
    usernames: []
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchLogs();
  }, []);

  useEffect(() => {
    // Debounce filter changes
    const timeoutId = setTimeout(() => {
      fetchLogs();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/activity-logs/filters');
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.username) params.append('username', filters.username);
      if (filters.action) params.append('action', filters.action);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      
      const response = await api.get(`/activity-logs?${params.toString()}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      username: '',
      action: '',
      date_from: '',
      date_to: '',
    });
  };

  const columns = [
    {
      header: t('activityLog.action'),
      accessor: 'action',
    },
    {
      header: t('activityLog.user'),
      accessor: 'username',
    },
    {
      header: t('activityLog.timestamp'),
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleString(),
    },
    {
      header: t('activityLog.details'),
      accessor: 'details',
    },
  ];

  if (loading && logs.length === 0) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-medical-text mb-6 flex items-center gap-2">
        <i className="fas fa-clipboard-list text-primary-600"></i>
        {t('activityLog.title')}
      </h1>

      {/* Filters */}
      <div className="crystal-card mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('activityLog.filters') || 'الفلاتر'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Username Filter */}
          <div>
            <label className="block text-sm font-medium text-medical-text mb-2">
              {t('activityLog.user')}
            </label>
            <select
              className="crystal-input"
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
            >
              <option value="">{t('common.all') || 'الكل'}</option>
              {filterOptions.usernames.map((username) => (
                <option key={username} value={username}>
                  {username}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-medical-text mb-2">
              {t('activityLog.action')}
            </label>
            <select
              className="crystal-input"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">{t('common.all') || 'الكل'}</option>
              {filterOptions.actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-medium text-medical-text mb-2">
              {t('activityLog.dateFrom') || 'من تاريخ'}
            </label>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label className="block text-sm font-medium text-medical-text mb-2">
              {t('activityLog.dateTo') || 'إلى تاريخ'}
            </label>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filters.username || filters.action || filters.date_from || filters.date_to) && (
          <div className="mt-4">
            <Button variant="secondary" icon="fa-times" onClick={clearFilters}>
              {t('activityLog.clearFilters') || 'مسح الفلاتر'}
            </Button>
          </div>
        )}
      </div>

      <Table
        columns={columns}
        data={logs}
        emptyMessage={t('common.noData')}
      />
    </div>
  );
}

export default ActivityLog;

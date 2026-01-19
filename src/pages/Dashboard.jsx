import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button/Button';

function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayVisits: 0,
    pendingTests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-medical-text flex items-center gap-2">
          <i className="fas fa-chart-line text-primary-600"></i>
          {t('dashboard.title')}
        </h1>
        <Link to="/patients/new">
          <Button icon="fa-user-plus">{t('patient.addPatient')}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="crystal-card hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-medical-muted">
              {t('dashboard.totalPatients')}
            </h3>
            <i className="fas fa-users text-primary-600 text-xl"></i>
          </div>
          <p className="text-3xl font-bold text-primary-600">{stats.totalPatients}</p>
        </div>
        <div className="crystal-card hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-medical-muted">
              {t('dashboard.todayVisits')}
            </h3>
            <i className="fas fa-calendar-check text-primary-600 text-xl"></i>
          </div>
          <p className="text-3xl font-bold text-primary-600">{stats.todayVisits}</p>
        </div>
        <div className="crystal-card hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-medical-muted">
              {t('dashboard.pendingTests')}
            </h3>
            <i className="fas fa-flask text-primary-600 text-xl"></i>
          </div>
          <p className="text-3xl font-bold text-primary-600">{stats.pendingTests}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

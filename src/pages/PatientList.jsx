import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Table from '../components/Table/Table';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';

function PatientList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Only search when user types (minimum 2 characters)
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchPatients();
      }, 500); // Debounce search

      return () => clearTimeout(timeoutId);
    } else if (searchTerm.length === 0) {
      // Clear results when search is empty
      setPatients([]);
    }
  }, [searchTerm]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/patients?search=${encodeURIComponent(searchTerm)}`);
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: t('patient.patientId'),
      accessor: 'patient_id',
    },
    {
      header: t('patient.fullName'),
      accessor: 'full_name',
    },
    {
      header: t('patient.phone'),
      accessor: 'phone',
    },
    {
      header: t('patient.dateOfBirth'),
      accessor: 'date_of_birth',
      render: (row) => new Date(row.date_of_birth).toLocaleDateString(),
    },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            variant="secondary"
            className="text-sm px-3 py-1"
            icon="fa-eye"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patients/${row.id}`);
            }}
          >
            {t('common.view')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-medical-text flex items-center gap-2">
          <i className="fas fa-users text-primary-600"></i>
          {t('patient.patientList')}
        </h1>
        <Button onClick={() => navigate('/patients/new')} icon="fa-user-plus">
          {t('patient.addPatient')}
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder={t('patient.searchPlaceholder') || 'ابحث عن المريض باستخدام المعرف أو الاسم (أدخل على الأقل حرفين)...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon="fa-search"
        />
        {searchTerm.length > 0 && searchTerm.length < 2 && (
          <p className="mt-2 text-sm text-medical-muted">
            {t('patient.searchMinChars') || 'يرجى إدخال على الأقل حرفين للبحث'}
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">{t('common.loading')}</div>
      ) : (
        <Table
          columns={columns}
          data={patients}
          onRowClick={(row) => navigate(`/patients/${row.id}`)}
          emptyMessage={
            searchTerm.length >= 2
              ? t('patient.noPatientsFound') || 'لم يتم العثور على مرضى'
              : t('patient.searchToFindPatients') || 'ابدأ البحث باستخدام معرف المريض أو الاسم'
          }
        />
      )}
    </div>
  );
}

export default PatientList;

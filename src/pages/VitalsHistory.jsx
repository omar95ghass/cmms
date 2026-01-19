import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Button from '../components/Button/Button';

function VitalsHistory() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await api.get(`/patients/${id}/vitals`);
      setPatient(response.data.patient);
      setVitals(response.data.vitals || []);
    } catch (error) {
      console.error('Error fetching vitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  return (
    <div className="print-content">
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block print-header mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <img src="/logo.png" alt="Logo" className="h-12 w-auto mb-2" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-primary-600">{t('vitals.title')}</h1>
            <p className="text-sm text-medical-muted">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Screen View */}
      <div className="print:hidden mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to={`/patients/${id}`}>
            <Button variant="secondary" icon="fa-arrow-right rtl:fa-arrow-left">
              {t('common.back')}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-medical-text flex items-center gap-2">
            <i className="fas fa-heartbeat text-primary-600"></i>
            {t('vitals.title')} - {patient?.full_name}
          </h1>
        </div>
        <Button icon="fa-print" onClick={handlePrint}>
          {t('common.print')}
        </Button>
      </div>

      {/* Patient Info */}
      <div className="crystal-card mb-6 print:shadow-none print:border-0">
        <h2 className="text-lg font-semibold mb-4 text-primary-600">{t('patient.patientDetails')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-medical-muted">{t('patient.patientId')}:</span>
            <p className="font-medium">{patient?.patient_id}</p>
          </div>
          <div>
            <span className="text-medical-muted">{t('patient.fullName')}:</span>
            <p className="font-medium">{patient?.full_name}</p>
          </div>
          <div>
            <span className="text-medical-muted">{t('patient.dateOfBirth')}:</span>
            <p className="font-medium">{patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '-'}</p>
          </div>
          <div>
            <span className="text-medical-muted">{t('patient.gender')}:</span>
            <p className="font-medium">{patient?.gender ? t(`patient.${patient.gender}`) : '-'}</p>
          </div>
        </div>
      </div>

      {/* Vitals List */}
      {vitals.length === 0 ? (
        <div className="crystal-card text-center py-12">
          <i className="fas fa-heartbeat text-4xl text-medical-muted mb-4"></i>
          <p className="text-medical-muted">{t('common.noData')}</p>
        </div>
      ) : (
        <div className="crystal-card print:shadow-none print:border-0">
          <h2 className="text-lg font-semibold mb-4 text-primary-600">{t('vitals.visitHistory') || 'سجل العلامات الحيوية'}</h2>
          <div className="space-y-6">
            {vitals.map((vital, index) => (
              <div key={vital.id} className="border-b border-medical-border pb-4 last:border-0 print:break-inside-avoid">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-medical-text flex items-center gap-2">
                    <i className="fas fa-calendar text-primary-600"></i>
                    {new Date(vital.created_at).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </h3>
                  <span className="text-xs text-medical-muted">#{vitals.length - index}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {vital.weight && (
                    <div className="print:break-inside-avoid">
                      <span className="text-xs text-medical-muted block mb-1">{t('vitals.weight')}</span>
                      <p className="font-medium">{vital.weight} kg</p>
                    </div>
                  )}
                  {vital.height && (
                    <div className="print:break-inside-avoid">
                      <span className="text-xs text-medical-muted block mb-1">{t('vitals.height')}</span>
                      <p className="font-medium">{vital.height} cm</p>
                    </div>
                  )}
                  {vital.blood_pressure && (
                    <div className="print:break-inside-avoid">
                      <span className="text-xs text-medical-muted block mb-1">{t('vitals.bloodPressure')}</span>
                      <p className="font-medium">{vital.blood_pressure}</p>
                    </div>
                  )}
                  {vital.temperature && (
                    <div className="print:break-inside-avoid">
                      <span className="text-xs text-medical-muted block mb-1">{t('vitals.temperature')}</span>
                      <p className="font-medium">{vital.temperature} °C</p>
                    </div>
                  )}
                </div>
                {vital.notes && (
                  <div className="mt-4 print:break-inside-avoid">
                    <span className="text-xs text-medical-muted block mb-1">{t('vitals.notes')}</span>
                    <p className="text-sm text-medical-text bg-medical-light p-3 rounded-lg">{vital.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Footer */}
      <div className="hidden print:block print-footer mt-8 pt-4 border-t border-medical-border text-xs text-medical-muted text-center">
        <p className="mb-2">تم توليد هذا التقرير بناء على قاعدة البيانات الخاصة بنظام MMS بشكل مؤتمت بالكامل</p>
        <p className="font-medium">Developed By Dr.Omar AlOthman</p>
      </div>
    </div>
  );
}

export default VitalsHistory;

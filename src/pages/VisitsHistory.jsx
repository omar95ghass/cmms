import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Button from '../components/Button/Button';

function VisitsHistory() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await api.get(`/patients/${id}/visits`);
      setPatient(response.data.patient);
      setVisits(response.data.visits || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
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
      {/* Print Header */}
      <div className="hidden print:block print-header mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <img src="/logo.png" alt="Logo" className="h-12 w-auto mb-2" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-primary-600">{t('visit.visitHistory')}</h1>
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
            <i className="fas fa-stethoscope text-primary-600"></i>
            {t('visit.visitHistory')} - {patient?.full_name}
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

      {/* Visits List */}
      {visits.length === 0 ? (
        <div className="crystal-card text-center py-12">
          <i className="fas fa-stethoscope text-4xl text-medical-muted mb-4"></i>
          <p className="text-medical-muted">{t('common.noData')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {visits.map((visit, index) => (
            <div key={visit.id} className="crystal-card print:shadow-none print:border print:break-inside-avoid">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-primary-600 flex items-center gap-2 mb-2">
                    <i className="fas fa-calendar-check"></i>
                    {new Date(visit.visit_date).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  {visit.doctor_name && (
                    <p className="text-sm text-medical-muted flex items-center gap-2">
                      <i className="fas fa-user-md text-primary-600"></i>
                      <span className="font-medium">{t('visit.doctor') || 'الطبيب'}:</span>
                      <span>{visit.doctor_name}</span>
                    </p>
                  )}
                </div>
                <span className="text-xs text-medical-muted bg-primary-100 text-primary-700 px-2 py-1 rounded">
                  {t('visit.title')} #{visits.length - index}
                </span>
              </div>

              <div className="space-y-4">
                <div className="print:break-inside-avoid">
                  <h4 className="font-semibold text-medical-text mb-2 flex items-center gap-2">
                    <i className="fas fa-comment-medical text-primary-600"></i>
                    {t('visit.complaint')}
                  </h4>
                  <p className="text-sm text-medical-text bg-medical-light p-3 rounded-lg whitespace-pre-wrap">
                    {visit.complaint}
                  </p>
                </div>

                {visit.diagnosis && (
                  <div className="print:break-inside-avoid">
                    <h4 className="font-semibold text-medical-text mb-2 flex items-center gap-2">
                      <i className="fas fa-diagnoses text-primary-600"></i>
                      {t('visit.diagnosis')}
                    </h4>
                    <p className="text-sm text-medical-text bg-medical-light p-3 rounded-lg whitespace-pre-wrap">
                      {visit.diagnosis}
                    </p>
                  </div>
                )}

                {visit.summary && (
                  <div className="print:break-inside-avoid">
                    <h4 className="font-semibold text-medical-text mb-2 flex items-center gap-2">
                      <i className="fas fa-file-medical text-primary-600"></i>
                      {t('visit.summary')}
                    </h4>
                    <p className="text-sm text-medical-text bg-medical-light p-3 rounded-lg whitespace-pre-wrap">
                      {visit.summary}
                    </p>
                  </div>
                )}

                {visit.treatment_plan && (
                  <div className="print:break-inside-avoid">
                    <h4 className="font-semibold text-medical-text mb-2 flex items-center gap-2">
                      <i className="fas fa-prescription-bottle-alt text-primary-600"></i>
                      {t('visit.treatmentPlan')}
                    </h4>
                    <p className="text-sm text-medical-text bg-medical-light p-3 rounded-lg whitespace-pre-wrap">
                      {visit.treatment_plan}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
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

export default VisitsHistory;

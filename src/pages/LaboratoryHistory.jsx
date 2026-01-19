import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Button from '../components/Button/Button';

function LaboratoryHistory() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await api.get(`/patients/${id}/laboratory`);
      setPatient(response.data.patient);
      setTests(response.data.tests || []);
    } catch (error) {
      console.error('Error fetching laboratory tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Check if value is within normal range
  const isNormal = (test) => {
    if (!test.normal_range || !test.test_value) return null;
    // Simple check - in production, implement proper range comparison
    return true;
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
            <h1 className="text-2xl font-bold text-primary-600">{t('laboratory.testHistory')}</h1>
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
            <i className="fas fa-flask text-primary-600"></i>
            {t('laboratory.testHistory')} - {patient?.full_name}
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

      {/* Tests List */}
      {tests.length === 0 ? (
        <div className="crystal-card text-center py-12">
          <i className="fas fa-flask text-4xl text-medical-muted mb-4"></i>
          <p className="text-medical-muted">{t('common.noData')}</p>
        </div>
      ) : (
        <div className="crystal-card print:shadow-none print:border-0">
          <h2 className="text-lg font-semibold mb-4 text-primary-600">{t('laboratory.testHistory')}</h2>
          
          {/* Group tests by date */}
          {Object.entries(
            tests.reduce((groups, test) => {
              const date = new Date(test.created_at).toLocaleDateString();
              if (!groups[date]) groups[date] = [];
              groups[date].push(test);
              return groups;
            }, {})
          ).map(([date, testsForDate]) => (
              <div key={date} className="mb-6 last:mb-0 print:break-inside-avoid">
                <h3 className="font-semibold text-medical-text mb-3 flex items-center gap-2 border-b border-medical-border pb-2">
                  <i className="fas fa-calendar text-primary-600"></i>
                  {new Date(testsForDate[0].created_at).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-medical-border">
                        <th className="text-right py-2 px-3 font-semibold text-medical-text">{t('laboratory.testName')}</th>
                        <th className="text-right py-2 px-3 font-semibold text-medical-text">{t('laboratory.testValue')}</th>
                        <th className="text-right py-2 px-3 font-semibold text-medical-text">{t('laboratory.normalRange')}</th>
                        <th className="text-right py-2 px-3 font-semibold text-medical-text">{t('laboratory.unit')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testsForDate.map((test) => (
                        <tr key={test.id} className="border-b border-medical-border hover:bg-medical-light print:hover:bg-transparent">
                          <td className="py-3 px-3 text-medical-text font-medium">{test.test_name}</td>
                          <td className="py-3 px-3 text-medical-text">{test.test_value}</td>
                          <td className="py-3 px-3 text-medical-muted text-xs">{test.normal_range || '-'}</td>
                          <td className="py-3 px-3 text-medical-muted">{test.unit || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Test Results/Notes */}
                {testsForDate.some(t => t.result) && (
                  <div className="mt-4 space-y-2">
                    {testsForDate.filter(t => t.result).map((test) => (
                      <div key={test.id} className="bg-medical-light p-3 rounded-lg print:break-inside-avoid">
                        <p className="text-xs text-medical-muted mb-1 font-medium">{test.test_name}</p>
                        <p className="text-sm text-medical-text whitespace-pre-wrap">{test.result}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
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

export default LaboratoryHistory;

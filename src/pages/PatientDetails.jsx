import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/Button/Button';

function PatientDetails() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const response = await api.get(`/patients/${id}`);
      setPatient(response.data);
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  if (!patient) {
    return <div className="text-center py-12">{t('common.noData')}</div>;
  }

  const tabs = [
    { id: 'basic', label: t('patient.basicInfo') || 'المعلومات الأساسية', icon: 'fa-user' },
    { id: 'personal', label: t('patient.personalInfo') || 'المعلومات الشخصية', icon: 'fa-id-card' },
    { id: 'contact', label: t('patient.contactInfo') || 'معلومات الاتصال', icon: 'fa-address-book' },
  ];

  const renderField = (label, value, icon = null) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-medical-light transition-colors">
        {icon && <i className={`fas ${icon} text-primary-600 mt-1`}></i>}
        <div className="flex-1">
          <span className="text-sm text-medical-muted block mb-1">{label}</span>
          <p className="font-medium text-medical-text">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-medical-text flex items-center gap-2">
          <i className="fas fa-user-circle text-primary-600"></i>
          {t('patient.patientDetails')}
        </h1>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="secondary" icon="fa-edit" onClick={() => navigate(`/patients/${id}/edit`)}>
            {t('common.edit')}
          </Button>
          <Link to="/patients">
            <Button variant="secondary" icon={document.documentElement.dir === 'rtl' ? 'fa-arrow-right' : 'fa-arrow-left'}>
              {t('common.back')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="crystal-card">
          <h2 className="text-lg font-semibold mb-4">{t('patient.title')}</h2>
          
          {/* Tabs */}
          <div className="flex border-b border-medical-border mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-medical-muted hover:text-medical-text'
                }`}
              >
                <i className={`fas ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {activeTab === 'basic' && (
              <>
                {renderField(t('patient.patientId'), patient.patient_id, 'fa-hashtag')}
                {renderField(t('patient.firstName'), patient.first_name, 'fa-user')}
                {renderField(t('patient.lastName'), patient.last_name, 'fa-user')}
                {renderField(t('patient.fatherName'), patient.father_name, 'fa-user')}
                {renderField(
                  t('patient.fullName'),
                  `${patient.first_name || ''} ${patient.father_name || ''} ${patient.last_name || ''}`.trim() || patient.full_name,
                  'fa-user-circle'
                )}
                {renderField(t('patient.dateOfBirth'), patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : null, 'fa-calendar')}
                {renderField(t('patient.age'), patient.date_of_birth ? `${calculateAge(patient.date_of_birth)} ${t('common.years') || 'سنة'}` : null, 'fa-birthday-cake')}
                {renderField(t('patient.gender'), patient.gender ? t(`patient.${patient.gender}`) : null, 'fa-venus-mars')}
              </>
            )}

            {activeTab === 'personal' && (
              <>
                {renderField(t('patient.maritalStatus'), patient.marital_status ? t(`patient.maritalStatus.${patient.marital_status}`) : null, 'fa-heart')}
                {renderField(t('patient.profession'), patient.profession, 'fa-briefcase')}
                {renderField(t('patient.country'), patient.country, 'fa-globe')}
                {renderField(t('patient.nationality'), patient.nationality, 'fa-flag')}
                {renderField(t('patient.city'), patient.city, 'fa-city')}
                {renderField(t('patient.address'), patient.address, 'fa-map-marker-alt')}
                {renderField(t('patient.idNumber'), patient.id_number, 'fa-id-card')}
                {renderField(t('patient.idMRZ'), patient.id_mrz, 'fa-barcode')}
                {renderField(t('patient.idPassportNumber'), patient.id_passport_number, 'fa-passport')}
                {renderField(t('patient.idPlaceOfIssue'), patient.id_place_of_issue, 'fa-map-pin')}
              </>
            )}

            {activeTab === 'contact' && (
              <>
                {renderField(t('patient.phone'), patient.phone, 'fa-phone')}
                {renderField(t('patient.email'), patient.email, 'fa-envelope')}
                {renderField(t('common.createdAt'), patient.created_at ? new Date(patient.created_at).toLocaleString() : null, 'fa-clock')}
                {renderField(t('common.updatedAt'), patient.updated_at ? new Date(patient.updated_at).toLocaleString() : null, 'fa-edit')}
              </>
            )}
          </div>
        </div>

        <div className="crystal-card">
          <h2 className="text-lg font-semibold mb-4">{t('common.actions')}</h2>
          <div className="space-y-2">
            {/* Admin: All actions */}
            {user?.role === 'admin' && (
              <>
                <Link to={`/patients/${id}/vitals`} className="block">
                  <Button variant="secondary" className="w-full" icon="fa-heartbeat">
                    {t('vitals.title')}
                  </Button>
                </Link>
                <Link to={`/patients/${id}/visits`} className="block">
                  <Button variant="secondary" className="w-full" icon="fa-stethoscope">
                    {t('visit.addVisit')}
                  </Button>
                </Link>
                <Link to={`/patients/${id}/laboratory`} className="block">
                  <Button variant="secondary" className="w-full" icon="fa-flask">
                    {t('laboratory.addTest')}
                  </Button>
                </Link>
              </>
            )}
            
            {/* Nurse: Vitals only */}
            {user?.role === 'nurse' && (
              <Link to={`/patients/${id}/vitals`} className="block">
                <Button variant="secondary" className="w-full" icon="fa-heartbeat">
                  {t('vitals.title')}
                </Button>
              </Link>
            )}
            
            {/* Doctor: Visits only */}
            {user?.role === 'doctor' && (
              <Link to={`/patients/${id}/visits`} className="block">
                <Button variant="secondary" className="w-full" icon="fa-stethoscope">
                  {t('visit.addVisit')}
                </Button>
              </Link>
            )}
            
            {/* Laboratory: Tests only */}
            {user?.role === 'laboratory' && (
              <Link to={`/patients/${id}/laboratory`} className="block">
                <Button variant="secondary" className="w-full" icon="fa-flask">
                  {t('laboratory.addTest')}
                </Button>
              </Link>
            )}
            
            {/* Reception: No medical actions, only view */}
          </div>
        </div>

        {/* Documents Section - All Roles */}
        <div className="crystal-card mt-6">
          <h2 className="text-lg font-semibold mb-4">{t('patient.documents') || 'وثائق المريض'}</h2>
          <Link to={`/patients/${id}/documents`} className="block mb-3">
            <Button variant="secondary" className="w-full" icon="fa-file-upload">
              {t('patient.manageDocuments') || 'إدارة وثائق المريض'}
            </Button>
          </Link>
          {/* Medical Report - Admin and Reception only */}
          {(user?.role === 'admin' || user?.role === 'reception') && (
            <Link to={`/patients/${id}/report`} className="block">
              <Button variant="primary" className="w-full" icon="fa-file-medical">
                {t('report.generateReport') || 'توليد تقرير طبي متكامل'}
              </Button>
            </Link>
          )}
        </div>

        {/* View History Section - All Roles */}
        <div className="crystal-card mt-6">
          <h2 className="text-lg font-semibold mb-4">{t('patient.medicalHistory') || 'السجل الطبي'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link to={`/patients/${id}/vitals/history`} className="block">
              <Button variant="secondary" className="w-full" icon="fa-heartbeat">
                {t('vitals.visitHistory') || 'سجل العلامات الحيوية'}
              </Button>
            </Link>
            <Link to={`/patients/${id}/visits/history`} className="block">
              <Button variant="secondary" className="w-full" icon="fa-stethoscope">
                {t('visit.visitHistory') || 'سجل الزيارات الطبية'}
              </Button>
            </Link>
            <Link to={`/patients/${id}/laboratory/history`} className="block">
              <Button variant="secondary" className="w-full" icon="fa-flask">
                {t('laboratory.testHistory') || 'سجل الفحوصات المخبرية'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDetails;

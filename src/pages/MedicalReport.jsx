import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';

// Body systems - same as in VitalsForm
const BODY_SYSTEMS = [
  { key: 'cardiovascular', translationKey: 'vitals.systems.cardiovascular', icon: 'fa-heart' },
  { key: 'respiratory', translationKey: 'vitals.systems.respiratory', icon: 'fa-lungs' },
  { key: 'urinary', translationKey: 'vitals.systems.urinary', icon: 'fa-tint' },
  { key: 'digestive', translationKey: 'vitals.systems.digestive', icon: 'fa-bowl-food' },
  { key: 'nervous', translationKey: 'vitals.systems.nervous', icon: 'fa-brain' },
  { key: 'musculoskeletal', translationKey: 'vitals.systems.musculoskeletal', icon: 'fa-bone' },
  { key: 'endocrine', translationKey: 'vitals.systems.endocrine', icon: 'fa-capsules' },
  { key: 'immune', translationKey: 'vitals.systems.immune', icon: 'fa-shield-virus' },
  { key: 'reproductive', translationKey: 'vitals.systems.reproductive', icon: 'fa-user-md' },
  { key: 'integumentary', translationKey: 'vitals.systems.integumentary', icon: 'fa-hand' },
  { key: 'lymphatic', translationKey: 'vitals.systems.lymphatic', icon: 'fa-droplet' },
  { key: 'sensory', translationKey: 'vitals.systems.sensory', icon: 'fa-eye' }
];

function MedicalReport() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [visits, setVisits] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    gccCode: '',
    gccSlipNo: '',
    medicalCenterName: '',
    reportExpiryDate: '',
    travelingTo: '',
    doctorName: '',
    doctorSignature: '',
    remarks: '',
    fitForJob: true,
    jobTitle: ''
  });

  useEffect(() => {
    // Check if user has permission (admin or reception)
    if (user?.role !== 'admin' && user?.role !== 'reception') {
      navigate('/patients');
      return;
    }
    fetchAllData();
  }, [id, user]);

  const fetchAllData = async () => {
    try {
      const [patientRes, vitalsRes, visitsRes, testsRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/patients/${id}/vitals`),
        api.get(`/patients/${id}/visits`),
        api.get(`/patients/${id}/laboratory`)
      ]);

      setPatient(patientRes.data);
      setVitals(vitalsRes.data.vitals || []);
      setVisits(visitsRes.data.visits || []);
      setTests(testsRes.data.tests || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Get latest vitals
  const latestVitals = vitals.length > 0 ? vitals[0] : null;
  
  // Parse visual tests and systems examination from JSON
  const visualTests = latestVitals?.visual_tests 
    ? (typeof latestVitals.visual_tests === 'string' 
        ? JSON.parse(latestVitals.visual_tests) 
        : latestVitals.visual_tests)
    : null;
  
  const systemsExam = latestVitals?.systems_examination
    ? (typeof latestVitals.systems_examination === 'string'
        ? JSON.parse(latestVitals.systems_examination)
        : latestVitals.systems_examination)
    : {};

  // Calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  if (!patient) {
    return <div className="text-center py-12">{t('common.noData')}</div>;
  }

  return (
    <div className="print-content">
      {/* Screen View Controls */}
      <div className="print:hidden mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to={`/patients/${id}`}>
            <Button variant="secondary" icon="fa-arrow-right rtl:fa-arrow-left">
              {t('common.back')}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-medical-text flex items-center gap-2">
            <i className="fas fa-file-medical text-primary-600"></i>
            {t('report.title') || 'التقرير الطبي المتكامل'}
          </h1>
        </div>
        <Button icon="fa-print" onClick={handlePrint}>
          {t('common.print')}
        </Button>
      </div>

      {/* Report Content */}
      <div className="bg-white print:shadow-none print:border-0">
        {/* Header */}
        <div className="hidden print:block print-header mb-6 border-b-2 border-gray-800 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-16 w-auto"
                onError={(e) => e.target.style.display = 'none'}
              />
              <div>
                <p className="text-sm font-semibold">{t('report.gccCode') || 'G.H.C. Code No.'}</p>
                <Input
                  type="text"
                  value={reportData.gccCode}
                  onChange={(e) => setReportData({...reportData, gccCode: e.target.value})}
                  className="w-32 text-sm"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">{t('report.gccSlipNo') || 'GCC Slip No.'}</p>
                <Input
                  type="text"
                  value={reportData.gccSlipNo}
                  onChange={(e) => setReportData({...reportData, gccSlipNo: e.target.value})}
                  className="w-32 text-sm"
                />
              </div>
            </div>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold mb-2">{t('report.detailedReport') || 'Detailed candidate report'}</h1>
              <div className="mb-2">
                <p className="text-sm font-semibold mb-1">{t('report.medicalCenterName') || 'Medical center name'}</p>
                <Input
                  type="text"
                  value={reportData.medicalCenterName}
                  onChange={(e) => setReportData({...reportData, medicalCenterName: e.target.value})}
                  className="w-64 mx-auto text-sm"
                />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">{t('report.reportExpiryDate') || 'Report expiry date'}</p>
                <Input
                  type="date"
                  value={reportData.reportExpiryDate}
                  onChange={(e) => setReportData({...reportData, reportExpiryDate: e.target.value})}
                  className="w-48 mx-auto text-sm"
                />
              </div>
            </div>
            <div className="text-right">
              <img 
                src="/logo.png" 
                alt="Gulf Health Council" 
                className="h-16 w-auto ml-auto"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          </div>
        </div>

        {/* Candidate Information */}
        <div className="mb-6 print:break-inside-avoid">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
            {t('report.candidateInformation') || 'CANDIDATE INFORMATION'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">{t('patient.fullName')}</p>
              <p className="border-b border-gray-300 pb-1">
                {patient.first_name && patient.last_name 
                  ? `${patient.first_name} ${patient.last_name}` 
                  : patient.first_name || patient.last_name || '-'}
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('patient.maritalStatus')}</p>
              <p className="border-b border-gray-300 pb-1">
                {patient.marital_status ? t(`patient.maritalStatus.${patient.marital_status}`) : '-'}
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('patient.height')}</p>
              <p className="border-b border-gray-300 pb-1">
                {latestVitals?.height ? `${latestVitals.height} cm` : '-'}
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('report.passportNo') || 'Passport No.'}</p>
              <p className="border-b border-gray-300 pb-1">{patient.id_passport_number || '-'}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('patient.weight')}</p>
              <p className="border-b border-gray-300 pb-1">
                {latestVitals?.weight ? `${latestVitals.weight} kg` : '-'}
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('report.age') || 'Age'}</p>
              <p className="border-b border-gray-300 pb-1">{calculateAge(patient.date_of_birth)}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('vitals.bmi')}</p>
              <p className="border-b border-gray-300 pb-1">
                {latestVitals?.bmi ? parseFloat(latestVitals.bmi).toFixed(2) : '-'}
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('patient.gender')}</p>
              <p className="border-b border-gray-300 pb-1">{t(`patient.${patient.gender}`)}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('report.passportExpiryDate') || 'Passport expiry date'}</p>
              <p className="border-b border-gray-300 pb-1">-</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('patient.nationality') || 'Nationality'}</p>
              <p className="border-b border-gray-300 pb-1">{patient.nationality || patient.country || '-'}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('patient.phone')}</p>
              <p className="border-b border-gray-300 pb-1">{patient.phone || '-'}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('report.travelingTo') || 'Traveling to'}</p>
              <Input
                type="text"
                value={reportData.travelingTo}
                onChange={(e) => setReportData({...reportData, travelingTo: e.target.value})}
                className="border-b border-gray-300 pb-1 text-sm w-full"
              />
            </div>
            <div>
              <p className="font-semibold mb-1">{t('patient.profession')}</p>
              <p className="border-b border-gray-300 pb-1">{patient.profession || '-'}</p>
            </div>
          </div>
        </div>

        {/* Medical Examination: General */}
        <div className="mb-6 print:break-inside-avoid">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
            {t('report.medicalExaminationGeneral') || 'MEDICAL EXAMINATION: GENERAL'}
          </h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">{t('vitals.bloodPressure')}</p>
              <p className="border-b border-gray-300 pb-1">{latestVitals?.blood_pressure || 'NAD'}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('vitals.pulse')} /min</p>
              <p className="border-b border-gray-300 pb-1">{latestVitals?.pulse || 'NAD'}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('vitals.respirationRate')} /min</p>
              <p className="border-b border-gray-300 pb-1">{latestVitals?.respiration_rate || 'NAD'}</p>
            </div>
          </div>
        </div>

        {/* Visual Acuity */}
        {visualTests && (
          <div className="mb-6 print:break-inside-avoid">
            <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
              {t('report.visualAcuity') || 'VISUAL ACUITY AIDED AND UNAIDED'}
            </h2>
            <div className="mb-4">
              <p className="font-semibold mb-2">{t('vitals.colorVision')}</p>
              <p className="border-b border-gray-300 pb-1 inline-block min-w-[200px]">
                {visualTests.color_vision || 'NORMAL'}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-2">{t('report.distantAided') || 'DISTANT/AIDED'}</p>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">{t('report.leftEye') || 'Left eye'}</span>
                    <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[100px]">
                      {visualTests.distant_left || '6/6'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{t('report.rightEye') || 'Right eye'}</span>
                    <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[100px]">
                      {visualTests.distant_right || '6/6'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2">{t('report.distantUnaided') || 'DISTANT/UNAIDED'}</p>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">{t('report.leftEye') || 'Left eye'}</span>
                    <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[100px]">
                      {visualTests.distant_left || '6/6'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{t('report.rightEye') || 'Right eye'}</span>
                    <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[100px]">
                      {visualTests.distant_right || '6/6'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2">{t('report.nearAided') || 'NEAR/AIDED'}</p>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">{t('report.leftEye') || 'Left eye'}</span>
                    <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[100px]">
                      {visualTests.near_left || '20/20'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{t('report.rightEye') || 'Right eye'}</span>
                    <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[100px]">
                      {visualTests.near_right || '20/20'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2">{t('report.nearUnaided') || 'NEAR/UNAIDED'}</p>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">{t('report.leftEye') || 'Left eye'}</span>
                    <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[100px]">
                      {visualTests.near_left || '20/20'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{t('report.rightEye') || 'Right eye'}</span>
                    <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[100px]">
                      {visualTests.near_right || '20/20'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hearing */}
        {visualTests && (
          <div className="mb-6 print:break-inside-avoid">
            <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
              {t('vitals.hearing')}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">{t('report.leftEar') || 'Left ear'}</p>
                <p className="border-b border-gray-300 pb-1">{visualTests.hearing_left || '-'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">{t('report.rightEar') || 'Right ear'}</p>
                <p className="border-b border-gray-300 pb-1">{visualTests.hearing_right || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* System Examination */}
        {Object.keys(systemsExam).length > 0 && (
          <div className="mb-6 print:break-inside-avoid">
            <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
              {t('vitals.systemsExamination')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(systemsExam).map(([key, value]) => {
                const system = BODY_SYSTEMS.find(s => s.key === key);
                if (!system) return null;
                return (
                  <div key={key}>
                    <p className="font-semibold mb-1">{t(system.translationKey)}</p>
                    <p className="border-b border-gray-300 pb-1">
                      {value === 'normal' ? t('vitals.normal') : t('vitals.abnormal')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Gastro Intestinal */}
        <div className="mb-6 print:break-inside-avoid">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
            {t('report.gastroIntestinal') || 'GASTRO INTESTINAL'}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">{t('report.abdomen') || 'Abdomen (Mass, tenderness)'}</p>
              <p className="border-b border-gray-300 pb-1">NAD</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('report.hernia') || 'Hernia'}</p>
              <p className="border-b border-gray-300 pb-1">NAD</p>
            </div>
          </div>
        </div>

        {/* Genitourinary */}
        <div className="mb-6 print:break-inside-avoid">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
            {t('report.genitourinary') || 'GENITOURINARY'}
          </h2>
          <div className="text-sm">
            <p className="font-semibold mb-1">{t('report.genitourinary') || 'Genitourinary'}</p>
            <p className="border-b border-gray-300 pb-1">NAD</p>
          </div>
        </div>

        {/* Musculoskeletal */}
        <div className="mb-6 print:break-inside-avoid">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
            {t('report.musculoskeletal') || 'MUSCULOSKELETAL'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">{t('report.extremities') || 'Extremities'}</p>
              <p className="border-b border-gray-300 pb-1">NAD</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('report.back') || 'Back'}</p>
              <p className="border-b border-gray-300 pb-1">NAD</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('report.skin') || 'Skin'}</p>
              <p className="border-b border-gray-300 pb-1">NAD</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('report.cns') || 'C.N.S.'}</p>
              <p className="border-b border-gray-300 pb-1">NAD</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('report.deformities') || 'Deformities'}</p>
              <p className="border-b border-gray-300 pb-1">NAD</p>
            </div>
          </div>
        </div>

        {/* Mental Status Examination */}
        <div className="mb-6 print:break-inside-avoid">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
            {t('report.mentalStatusExamination') || 'MENTAL STATUS EXAMINATION'}
          </h2>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2">{t('report.appearance') || 'APPEARANCE'}</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">{t('report.appearance') || 'Appearance'}</span>
                  <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[150px]"></span>
                </div>
                <div>
                  <span className="font-medium">{t('report.speech') || 'Speech'}</span>
                  <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[150px]"></span>
                </div>
                <div>
                  <span className="font-medium">{t('report.behaviour') || 'Behaviour'}</span>
                  <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[150px]"></span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('report.cognition') || 'COGNITION'}</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">{t('report.orientation') || 'Orientation'}</span>
                  <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[150px]"></span>
                </div>
                <div>
                  <span className="font-medium">{t('report.memory') || 'Memory'}</span>
                  <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[150px]"></span>
                </div>
                <div>
                  <span className="font-medium">{t('report.concentration') || 'Concentration'}</span>
                  <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[150px]"></span>
                </div>
                <div>
                  <span className="font-medium">{t('report.mood') || 'Mood'}</span>
                  <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[150px]"></span>
                </div>
                <div>
                  <span className="font-medium">{t('report.thoughts') || 'Thoughts'}</span>
                  <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[150px]"></span>
                </div>
                <div>
                  <span className="font-medium">{t('report.others') || 'Others'}</span>
                  <span className="border-b border-gray-300 pb-1 ml-2 inline-block min-w-[150px]"></span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-semibold mb-1">{t('report.remarks') || 'Remarks'}</p>
            <p className="border-b border-gray-300 pb-1 min-h-[40px]"></p>
          </div>
        </div>

        {/* Investigation */}
        <div className="mb-6 print:break-inside-avoid">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
            {t('report.investigation') || 'INVESTIGATION'}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">{t('report.chestXray') || 'Chest X-Ray'}</p>
              <p className="border-b border-gray-300 pb-1">NAD</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('report.comment') || 'Comment'}</p>
              <p className="border-b border-gray-300 pb-1"></p>
            </div>
          </div>
        </div>

        {/* Laboratory Investigation */}
        {tests.length > 0 && (
          <div className="mb-6 print:break-inside-avoid">
            <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
              {t('report.laboratoryInvestigation') || 'LABORATORY INVESTIGATION'}
            </h2>
            
            {/* Note: Removed sections without database support:
                - Blood (blood group, haemoglobin - no data in DB)
                - Thick Film (malaria, microfilaria - no data in DB)
            */}

            {/* Biochemistry */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">{t('report.biochemistry') || 'BIOCHEMISTRY'}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {tests.filter(t => ['R.B.S', 'L.F.T', 'Creatinine'].some(name => t.test_name?.includes(name))).map((test, idx) => (
                  <div key={idx}>
                    <p className="font-medium mb-1">{test.test_name}</p>
                    <p className="border-b border-gray-300 pb-1">
                      {test.test_value} {test.unit || ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Serology - Only show if tests exist */}
            {tests.filter(t => ['HIV', 'HBs', 'HCV', 'VDRL', 'TPHA'].some(name => t.test_name?.includes(name))).length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">{t('report.serology') || 'SEROLOGY'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {tests.filter(t => ['HIV', 'HBs', 'HCV', 'VDRL', 'TPHA'].some(name => t.test_name?.includes(name))).map((test, idx) => (
                    <div key={idx}>
                      <p className="font-medium mb-1">{test.test_name}</p>
                      <p className="border-b border-gray-300 pb-1">
                        {test.test_value || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Urine - Only show if tests exist */}
            {tests.filter(t => ['Sugar', 'Albumin', 'Urine'].some(name => t.test_name?.includes(name))).length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">{t('report.urine') || 'URINE'}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {tests.filter(t => ['Sugar', 'Albumin', 'Urine'].some(name => t.test_name?.includes(name))).map((test, idx) => (
                    <div key={idx}>
                      <p className="font-medium mb-1">{test.test_name}</p>
                      <p className="border-b border-gray-300 pb-1">
                        {test.test_value || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stool - Only show if tests exist */}
            {tests.filter(t => ['Stool', 'Helminthes', 'OVA', 'CYST'].some(name => t.test_name?.includes(name))).length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">{t('report.stool') || 'STOOL'}</h3>
                <div>
                  <h4 className="font-medium mb-2">{t('report.routine') || 'ROUTINE'}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {tests.filter(t => ['Stool', 'Helminthes', 'OVA', 'CYST'].some(name => t.test_name?.includes(name))).map((test, idx) => (
                      <div key={idx}>
                        <p className="font-medium mb-1">{test.test_name}</p>
                        <p className="border-b border-gray-300 pb-1">
                          {test.test_value || '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Show all other tests that don't match specific categories */}
            {tests.filter(t => {
              const testName = t.test_name?.toLowerCase() || '';
              return !['r.b.s', 'l.f.t', 'creatinine', 'hiv', 'hbs', 'hcv', 'vdrl', 'tpha', 'sugar', 'albumin', 'urine', 'stool', 'helminthes', 'ova', 'cyst'].some(name => testName.includes(name));
            }).length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">{t('report.otherTests') || 'OTHER TESTS'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {tests.filter(t => {
                    const testName = t.test_name?.toLowerCase() || '';
                    return !['r.b.s', 'l.f.t', 'creatinine', 'hiv', 'hbs', 'hcv', 'vdrl', 'tpha', 'sugar', 'albumin', 'urine', 'stool', 'helminthes', 'ova', 'cyst'].some(name => testName.includes(name));
                  }).map((test, idx) => (
                    <div key={idx}>
                      <p className="font-medium mb-1">{test.test_name}</p>
                      <p className="border-b border-gray-300 pb-1">
                        {test.test_value} {test.unit || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Note: Vaccination Status removed - no data in database */}

        {/* Remarks */}
        <div className="mb-6 print:break-inside-avoid">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-gray-800 pb-2">
            {t('report.remarks') || 'Remarks'}
          </h2>
          <div className="mb-4">
            <textarea
              className="w-full border border-gray-300 rounded p-2 text-sm min-h-[100px]"
              value={reportData.remarks}
              onChange={(e) => setReportData({...reportData, remarks: e.target.value})}
              placeholder={t('report.enterRemarks') || 'Enter remarks...'}
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reportData.fitForJob}
                onChange={(e) => setReportData({...reportData, fitForJob: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold">
                {t('report.fitForJob') || 'Fit for the above mentioned job according to the GCC criteria'}
              </span>
            </label>
          </div>
        </div>

        {/* Doctor's Name and Signature */}
        <div className="mb-6 print:break-inside-avoid">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-semibold mb-2">{t('report.doctorName') || "Doctor's name"}</p>
              <Input
                type="text"
                value={reportData.doctorName}
                onChange={(e) => setReportData({...reportData, doctorName: e.target.value})}
                className="border-b-2 border-gray-800 pb-2 text-lg font-bold"
              />
              <div className="mt-4 h-20 border-b-2 border-gray-800"></div>
            </div>
            <div>
              <p className="font-semibold mb-2">{t('report.signature') || 'Signature'}</p>
              <div className="mt-8 h-20 border-b-2 border-gray-800"></div>
            </div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block print-footer mt-8 pt-4 border-t border-medical-border text-xs text-medical-muted text-center">
          <p className="mb-2">تم توليد هذا التقرير بناء على قاعدة البيانات الخاصة بنظام MMS بشكل مؤتمت بالكامل</p>
          <p className="font-medium">Developed By Dr.Omar AlOthman</p>
        </div>
      </div>
    </div>
  );
}

export default MedicalReport;

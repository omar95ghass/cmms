import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Modal from '../components/Modal/Modal';

function PatientDocuments() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState(null); // 'id_photo' or 'personal_photo'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '', alt: '' });

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const response = await api.get(`/patients/${id}`);
      setPatient(response.data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      setError('خطأ في تحميل بيانات المريض');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (type) => {
    setUploadType(type);
    setError('');
    setSuccess('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('نوع الملف غير مدعوم. يرجى رفع صورة (JPG, PNG, GIF) أو ملف PDF');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);

      const response = await api.post(`/patients/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess('تم رفع الملف بنجاح');
        setUploadType(null);
        // Reset file input
        e.target.value = '';
        // Refresh patient data
        await fetchPatient();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.error || 'حدث خطأ أثناء رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (type) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوثيقة؟')) {
      return;
    }

    try {
      const response = await api.delete(`/patients/${id}/documents/${type}`);
      if (response.data.success) {
        setSuccess('تم حذف الوثيقة بنجاح');
        await fetchPatient();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError(error.response?.data?.error || 'حدث خطأ أثناء حذف الملف');
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  return (
    <div className="print-content">
      {/* Screen View */}
      <div className="print:hidden mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to={`/patients/${id}`}>
            <Button variant="secondary" icon="fa-arrow-right rtl:fa-arrow-left">
              {t('common.back')}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-medical-text flex items-center gap-2">
            <i className="fas fa-file-upload text-primary-600"></i>
            {t('patient.documents') || 'رفع وثائق المريض'} - {patient?.full_name}
          </h1>
        </div>
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

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Documents Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ID Photo/Passport */}
        <div className="crystal-card">
          <h3 className="text-lg font-semibold mb-4 text-primary-600 flex items-center gap-2">
            <i className="fas fa-id-card"></i>
            {t('patient.idPhoto') || 'صورة الهوية / جواز السفر'}
          </h3>
          
          {patient?.id_photo ? (
            <div className="space-y-3">
              <div className="border border-medical-border rounded-lg p-4 bg-medical-light">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-medical-muted font-medium">الملف المرفوع:</span>
                  <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded">
                    {patient.id_photo.split('/').pop()}
                  </span>
                </div>
                {patient.id_photo.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <div className="relative group">
                    <div className="relative overflow-hidden rounded-lg bg-medical-card border border-medical-border cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        const imageSrc = patient.id_photo.startsWith('/uploads') ? patient.id_photo : `/uploads${patient.id_photo}`;
                        setImageModal({ isOpen: true, src: imageSrc, alt: 'ID Photo' });
                      }}
                    >
                      <img 
                        src={patient.id_photo.startsWith('/uploads') ? patient.id_photo : `/uploads${patient.id_photo}`} 
                        alt="ID Photo" 
                        className="w-full h-auto max-h-80 object-contain rounded-lg transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden items-center justify-center p-8 border-2 border-dashed border-medical-border rounded-lg bg-medical-light min-h-[200px]">
                        <i className="fas fa-file-image text-6xl text-medical-muted"></i>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 rounded-full p-3">
                          <i className="fas fa-expand text-primary-600 text-xl"></i>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-medical-muted mt-2 text-center">
                      {t('patient.clickToView') || 'انقر لعرض الصورة بالحجم الكامل'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-medical-border rounded-lg bg-medical-card min-h-[200px]">
                    <i className="fas fa-file-pdf text-6xl text-medical-muted mb-3"></i>
                    <span className="text-medical-muted font-medium">{patient.id_photo.split('/').pop()}</span>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-center gap-4 pt-3 border-t border-medical-border">
                  <a 
                    href={patient.id_photo.startsWith('/uploads') ? patient.id_photo : `/uploads${patient.id_photo}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-2 transition-colors"
                  >
                    <i className="fas fa-external-link-alt"></i>
                    {t('common.viewInNewTab') || 'فتح في تبويب جديد'}
                  </a>
                  <a 
                    href={patient.id_photo.startsWith('/uploads') ? patient.id_photo : `/uploads${patient.id_photo}`} 
                    download
                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-2 transition-colors"
                  >
                    <i className="fas fa-download"></i>
                    {t('common.download') || 'تحميل'}
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="danger" 
                  className="flex-1" 
                  icon="fa-trash"
                  onClick={() => handleDelete('id_photo')}
                >
                  {t('common.delete') || 'حذف'}
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  icon="fa-upload"
                  onClick={() => handleFileSelect('id_photo')}
                >
                  {t('common.replace') || 'استبدال'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <i className="fas fa-cloud-upload-alt text-4xl text-medical-muted mb-4"></i>
              <p className="text-medical-muted mb-4">{t('patient.noIdPhoto') || 'لم يتم رفع صورة الهوية / جواز السفر'}</p>
              <Button 
                icon="fa-upload"
                onClick={() => handleFileSelect('id_photo')}
              >
                {t('common.upload') || 'رفع ملف'}
              </Button>
            </div>
          )}

          {uploadType === 'id_photo' && (
            <div className="mt-4 p-4 border-2 border-dashed border-primary-300 rounded-lg bg-primary-50">
              <label className="cursor-pointer block">
                <span className="text-sm text-medical-muted mb-2 block">
                  {t('patient.selectFile') || 'اختر ملف (صورة أو PDF)'}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-medical-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700 disabled:opacity-50"
                />
              </label>
              {uploading && (
                <p className="text-sm text-primary-600 mt-2">
                  <i className="fas fa-spinner fa-spin"></i> {t('common.uploading') || 'جاري الرفع...'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Personal Photo */}
        <div className="crystal-card">
          <h3 className="text-lg font-semibold mb-4 text-primary-600 flex items-center gap-2">
            <i className="fas fa-user-circle"></i>
            {t('patient.personalPhoto') || 'الصورة الشخصية'}
          </h3>
          
          {patient?.personal_photo ? (
            <div className="space-y-3">
              <div className="border border-medical-border rounded-lg p-4 bg-medical-light">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-medical-muted font-medium">الملف المرفوع:</span>
                  <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded">
                    {patient.personal_photo.split('/').pop()}
                  </span>
                </div>
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-lg bg-medical-card border border-medical-border cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      const imageSrc = patient.personal_photo.startsWith('/uploads') ? patient.personal_photo : `/uploads${patient.personal_photo}`;
                      setImageModal({ isOpen: true, src: imageSrc, alt: 'Personal Photo' });
                    }}
                  >
                    <img 
                      src={patient.personal_photo.startsWith('/uploads') ? patient.personal_photo : `/uploads${patient.personal_photo}`} 
                      alt="Personal Photo" 
                      className="w-full h-auto max-h-80 object-contain rounded-lg transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden items-center justify-center p-8 border-2 border-dashed border-medical-border rounded-lg bg-medical-light min-h-[200px]">
                      <i className="fas fa-file-image text-6xl text-medical-muted"></i>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 rounded-full p-3">
                        <i className="fas fa-expand text-primary-600 text-xl"></i>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-medical-muted mt-2 text-center">
                    {t('patient.clickToView') || 'انقر لعرض الصورة بالحجم الكامل'}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-center gap-4 pt-3 border-t border-medical-border">
                  <a 
                    href={patient.personal_photo.startsWith('/uploads') ? patient.personal_photo : `/uploads${patient.personal_photo}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-2 transition-colors"
                  >
                    <i className="fas fa-external-link-alt"></i>
                    {t('common.viewInNewTab') || 'فتح في تبويب جديد'}
                  </a>
                  <a 
                    href={patient.personal_photo.startsWith('/uploads') ? patient.personal_photo : `/uploads${patient.personal_photo}`} 
                    download
                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-2 transition-colors"
                  >
                    <i className="fas fa-download"></i>
                    {t('common.download') || 'تحميل'}
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="danger" 
                  className="flex-1" 
                  icon="fa-trash"
                  onClick={() => handleDelete('personal_photo')}
                >
                  {t('common.delete') || 'حذف'}
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  icon="fa-upload"
                  onClick={() => handleFileSelect('personal_photo')}
                >
                  {t('common.replace') || 'استبدال'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <i className="fas fa-cloud-upload-alt text-4xl text-medical-muted mb-4"></i>
              <p className="text-medical-muted mb-4">{t('patient.noPersonalPhoto') || 'لم يتم رفع الصورة الشخصية'}</p>
              <Button 
                icon="fa-upload"
                onClick={() => handleFileSelect('personal_photo')}
              >
                {t('common.upload') || 'رفع ملف'}
              </Button>
            </div>
          )}

          {uploadType === 'personal_photo' && (
            <div className="mt-4 p-4 border-2 border-dashed border-primary-300 rounded-lg bg-primary-50">
              <label className="cursor-pointer block">
                <span className="text-sm text-medical-muted mb-2 block">
                  {t('patient.selectPhoto') || 'اختر صورة'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-medical-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700 disabled:opacity-50"
                />
              </label>
              {uploading && (
                <p className="text-sm text-primary-600 mt-2">
                  <i className="fas fa-spinner fa-spin"></i> {t('common.uploading') || 'جاري الرفع...'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <Modal 
        isOpen={imageModal.isOpen} 
        onClose={() => setImageModal({ isOpen: false, src: '', alt: '' })}
        title={imageModal.alt}
        size="xl"
      >
        <div className="flex items-center justify-center p-4 bg-medical-light rounded-lg">
          <img 
            src={imageModal.src} 
            alt={imageModal.alt} 
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
          />
        </div>
        <div className="mt-4 flex justify-center gap-4">
          <a 
            href={imageModal.src} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-2"
          >
            <i className="fas fa-external-link-alt"></i>
            {t('common.viewInNewTab') || 'فتح في تبويب جديد'}
          </a>
          <a 
            href={imageModal.src} 
            download
            className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-2"
          >
            <i className="fas fa-download"></i>
            {t('common.download') || 'تحميل'}
          </a>
        </div>
      </Modal>
    </div>
  );
}

export default PatientDocuments;

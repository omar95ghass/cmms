import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';

// Syrian cities
const SYRIAN_CITIES = [
  'دمشق', 'حلب', 'اللاذقية', 'طرطوس', 'حمص', 'حماة', 
  'دير الزور', 'الرقة', 'الحسكة', 'إدلب', 'درعا', 
  'السويداء', 'القنيطرة'
];

// Countries list (common countries)
const COUNTRIES = [
  'سوريا', 'لبنان', 'الأردن', 'فلسطين', 'مصر', 'السعودية', 
  'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عُمان', 'اليمن', 
  'العراق', 'الجزائر', 'المغرب', 'تونس', 'ليبيا', 'السودان',
  'تركيا', 'أخرى'
];

// Professions list
const PROFESSIONS = [
  'طبيب', 'ممرض/ممرضة', 'مهندس', 'محاسب', 'معلم/معلمة', 
  'محامي', 'مهندس معماري', 'صيدلاني', 'طبيب أسنان', 
  'طبيب بيطري', 'صحفي', 'كاتب', 'فنان', 'موسيقي',
  'مدير', 'موظف إداري', 'تاجر', 'تاجر تجزئة', 'صاحب محل',
  'سائق', 'بناء/عامل بناء', 'نجار', 'حداد', 'كهربائي',
  'ميكانيكي', 'خياط/خياطة', 'حلاق/حلاقة', 'طاهي/طباخة',
  'نادل/نادلة', 'موظف استقبال', 'موظف مبيعات', 'محاسب مالي',
  'مصرفي', 'مصمم جرافيك', 'مطور برمجيات', 'تقني معلومات',
  'مرشد سياحي', 'رياضي محترف', 'مدرب', 'رجل دين', 
  'أستاذ جامعي', 'باحث', 'طيار', 'كابتن سفينة', 
  'رجل أمن/شرطي', 'جندي', 'رجل إطفاء', 'عامل زراعي',
  'مزارع', 'راعي', 'صياد', 'عاطل عن العمل', 'متقاعد',
  'ربة منزل', 'طالب/طالبة', 'أخرى'
];

function PatientForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    father_name: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    profession: '',
    phone: '',
    email: '',
    address: '',
    country: '',
    nationality: '',
    city: '',
    id_number: '',
    id_mrz: '',
    id_passport_number: '',
    id_place_of_issue: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [addAnother, setAddAnother] = useState(false);

  // Check if country is Syria
  const isSyria = formData.country === 'سوريا';

  useEffect(() => {
    if (isEdit) {
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      const response = await api.get(`/patients/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  const handleSubmit = async (e, addAnotherFlag = false) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (isEdit) {
        await api.put(`/patients/${id}`, formData);
        navigate('/patients');
      } else {
        const response = await api.post('/patients', formData);
        if (response.data?.success) {
          if (addAnotherFlag) {
            // Reset form for adding another patient
            setFormData({
              first_name: '',
              last_name: '',
              father_name: '',
              date_of_birth: '',
              gender: '',
              marital_status: '',
              profession: '',
              phone: '',
              email: '',
              address: '',
              country: '',
              city: '',
              id_number: '',
              id_mrz: '',
              id_passport_number: '',
              id_place_of_issue: '',
            });
            setAddAnother(false);
            // Scroll to top
            window.scrollTo(0, 0);
          } else {
            navigate('/patients');
          }
        }
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setFormData({ 
      ...formData, 
      country: newCountry,
      // Reset city if country changed from Syria to another
      city: newCountry === 'سوريا' ? formData.city : ''
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-medical-text mb-6 flex items-center gap-2">
        <i className={`fas ${isEdit ? 'fa-edit' : 'fa-user-plus'} text-primary-600`}></i>
        {isEdit ? t('patient.editPatient') : t('patient.addPatient')}
      </h1>

      <form onSubmit={(e) => handleSubmit(e, false)} className="crystal-card">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('patient.firstName')}
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
            error={errors.first_name}
          />
          <Input
            label={t('patient.lastName')}
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            error={errors.last_name}
          />
          <Input
            label={t('patient.fatherName') || 'اسم الأب'}
            value={formData.father_name}
            onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
            error={errors.father_name}
          />
          <Input
            label={t('patient.dateOfBirth')}
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            required
            error={errors.date_of_birth}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-medical-text mb-2">
              {t('patient.gender')} <span className="text-red-500">*</span>
            </label>
            <select
              className="crystal-input"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
            >
              <option value="">{t('common.select')}</option>
              <option value="male">{t('patient.male')}</option>
              <option value="female">{t('patient.female')}</option>
            </select>
            {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-medical-text mb-2">
              {t('patient.maritalStatus')}
            </label>
            <select
              className="crystal-input"
              value={formData.marital_status}
              onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
            >
              <option value="">{t('common.select')}</option>
              <option value="single">{t('patient.maritalStatus.single')}</option>
              <option value="married">{t('patient.maritalStatus.married')}</option>
              <option value="divorced">{t('patient.maritalStatus.divorced')}</option>
              <option value="widowed">{t('patient.maritalStatus.widowed')}</option>
            </select>
            {errors.marital_status && <p className="mt-1 text-sm text-red-500">{errors.marital_status}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-medical-text mb-2">
              {t('patient.profession')}
            </label>
            <select
              className="crystal-input"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            >
              <option value="">{t('common.select')}</option>
              {PROFESSIONS.map((profession) => (
                <option key={profession} value={profession}>{profession}</option>
              ))}
            </select>
            {errors.profession && <p className="mt-1 text-sm text-red-500">{errors.profession}</p>}
          </div>
          <Input
            label={t('patient.phone')}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
          />
          <Input
            label={t('patient.email')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label={t('patient.address')}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={errors.address}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-medical-text mb-2">
              {t('patient.country')}
            </label>
            <select
              className="crystal-input"
              value={formData.country}
              onChange={handleCountryChange}
            >
              <option value="">{t('common.select')}</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
          </div>
          {isSyria ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-medical-text mb-2">
                {t('patient.city')}
              </label>
              <select
                className="crystal-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              >
                <option value="">{t('common.select')}</option>
                {SYRIAN_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
            </div>
          ) : (
            <Input
              label={t('patient.city')}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              error={errors.city}
              placeholder={t('patient.cityPlaceholder')}
            />
          )}

          {/* ID Information Section */}
          <div className="md:col-span-2 border-t border-medical-border pt-4 mt-2">
            <h3 className="text-lg font-semibold text-medical-text mb-4">{t('patient.idInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t('patient.idMRZ')}
                value={formData.id_mrz}
                onChange={(e) => setFormData({ ...formData, id_mrz: e.target.value })}
                error={errors.id_mrz}
                placeholder="MRZ"
              />
              <Input
                label={t('patient.idPassportNumber')}
                value={formData.id_passport_number}
                onChange={(e) => setFormData({ ...formData, id_passport_number: e.target.value })}
                error={errors.id_passport_number}
                placeholder="Passport/ID No."
              />
              <Input
                label={t('patient.idPlaceOfIssue')}
                value={formData.id_place_of_issue}
                onChange={(e) => setFormData({ ...formData, id_place_of_issue: e.target.value })}
                error={errors.id_place_of_issue}
                placeholder={t('patient.placeOfIssue')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 rtl:space-x-reverse mt-6">
          <Button variant="secondary" type="button" icon="fa-times" onClick={() => navigate('/patients')}>
            {t('common.cancel')}
          </Button>
          {!isEdit && (
            <Button 
              type="button" 
              variant="secondary"
              disabled={loading} 
              icon="fa-plus"
              onClick={(e) => handleSubmit(e, true)}
            >
              {loading ? t('common.loading') : t('patient.addAndAddAnother')}
            </Button>
          )}
          <Button type="submit" disabled={loading} icon={loading ? 'fa-spinner fa-spin' : 'fa-save'}>
            {loading ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default PatientForm;

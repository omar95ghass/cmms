import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';

// Color vision options
const COLOR_VISION_OPTIONS = [
  'طبيعي',
  'عمى ألوان كلي',
  'عمى ألوان جزئي - Protanopia',
  'عمى ألوان جزئي - Deuteranopia',
  'عمى ألوان جزئي - Tritanopia',
  'عمى ألوان جزئي - Protanomaly',
  'عمى ألوان جزئي - Deuteranomaly',
  'أخرى'
];

// Body systems - labels will be translated using translation keys
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

function VitalsForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    blood_pressure: '',
    temperature: '',
    pulse: '',
    respiration_rate: '',
    visual_tests_enabled: false,
    visual_tests: {
      distant_left: '',
      distant_right: '',
      near_left: '',
      near_right: '',
      color_vision: '',
      hearing_left: '',
      hearing_right: ''
    },
    systems_examination: {}
  });

  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    visual: false,
    systems: false
  });

  // Calculate BMI
  const calculateBMI = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height) / 100; // Convert cm to meters
    if (weight && height) {
      const bmi = weight / (height * height);
      return bmi.toFixed(2);
    }
    return null;
  };

  const toggleSection = (section) => {
    setCollapsedSections({ ...collapsedSections, [section]: !collapsedSections[section] });
  };

  const handleSystemChange = (systemKey, status) => {
    setFormData({
      ...formData,
      systems_examination: {
        ...formData.systems_examination,
        [systemKey]: status
      }
    });
  };

  const handleVisualTestChange = (field, value) => {
    setFormData({
      ...formData,
      visual_tests: {
        ...formData.visual_tests,
        [field]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bmi = calculateBMI();
      const submitData = {
        ...formData,
        bmi: bmi ? parseFloat(bmi) : null,
        visual_tests: formData.visual_tests_enabled ? formData.visual_tests : null,
        systems_examination: Object.keys(formData.systems_examination).length > 0 
          ? formData.systems_examination 
          : null
      };
      
      // Remove visual_tests_enabled from submission
      delete submitData.visual_tests_enabled;
      
      await api.post(`/patients/${id}/vitals`, submitData);
      navigate(`/patients/${id}`);
    } catch (error) {
      console.error('Error saving vitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const bmi = calculateBMI();
  const bmiStatus = bmi ? (
    parseFloat(bmi) < 18.5 ? 'نحيف' :
    parseFloat(bmi) < 25 ? 'طبيعي' :
    parseFloat(bmi) < 30 ? 'وزن زائد' : 'سمنة'
  ) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-medical-text mb-6 flex items-center gap-2">
        <i className="fas fa-heartbeat text-primary-600"></i>
        {t('vitals.title')}
      </h1>
      
      <form onSubmit={handleSubmit} className="crystal-card">
        {/* Basic Vitals */}
        <h2 className="text-lg font-semibold text-medical-text mb-4 flex items-center gap-2">
          <i className="fas fa-stethoscope text-primary-600"></i>
          {t('vitals.basicVitals') || 'العلامات الحيوية الأساسية'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label={t('vitals.weight')}
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder="kg"
          />
          <Input
            label={t('vitals.height')}
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            placeholder="cm"
          />
          <Input
            label={t('vitals.bloodPressure')}
            placeholder="120/80"
            value={formData.blood_pressure}
            onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
          />
          <Input
            label={t('vitals.temperature')}
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            placeholder="°C"
          />
          <Input
            label={t('vitals.pulse') || 'النبض'}
            type="number"
            value={formData.pulse}
            onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
            placeholder="bpm"
          />
          <Input
            label={t('vitals.respirationRate') || 'معدل التنفس'}
            type="number"
            value={formData.respiration_rate}
            onChange={(e) => setFormData({ ...formData, respiration_rate: e.target.value })}
            placeholder="per minute"
          />
        </div>

        {/* BMI Display */}
        {bmi && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-medical-text">
                {t('vitals.bmi') || 'مؤشر كتلة الجسم (BMI)'}: 
              </span>
              <span className="text-lg font-bold text-primary-600">
                {bmi} - {bmiStatus}
              </span>
            </div>
          </div>
        )}

        {/* Visual Tests Section */}
        <div className="border-t border-medical-border pt-6 mb-6">
          <button
            type="button"
            onClick={() => toggleSection('visual')}
            className="w-full flex items-center justify-between text-lg font-semibold text-medical-text mb-4 hover:text-primary-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <i className="fas fa-eye text-primary-600"></i>
              {t('vitals.visualTests') || 'الفحوص البصرية'}
            </span>
            <i className={`fas fa-chevron-${collapsedSections.visual ? 'down' : 'up'}`}></i>
          </button>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.visual_tests_enabled}
                onChange={(e) => setFormData({ ...formData, visual_tests_enabled: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-medical-text">
                {t('vitals.hasVisualTests') || 'هل توجد فحوص بصرية؟'}
              </span>
            </label>
          </div>

          {formData.visual_tests_enabled && !collapsedSections.visual && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-4">
                <h3 className="font-medium text-medical-text">{t('vitals.distantVision') || 'البعد'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="L.EYE"
                    value={formData.visual_tests.distant_left}
                    onChange={(e) => handleVisualTestChange('distant_left', e.target.value)}
                    placeholder="6/6"
                  />
                  <Input
                    label="R.EYE"
                    value={formData.visual_tests.distant_right}
                    onChange={(e) => handleVisualTestChange('distant_right', e.target.value)}
                    placeholder="6/6"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-medical-text">{t('vitals.nearVision') || 'القريب'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="L.EYE"
                    value={formData.visual_tests.near_left}
                    onChange={(e) => handleVisualTestChange('near_left', e.target.value)}
                    placeholder="6/6"
                  />
                  <Input
                    label="R.EYE"
                    value={formData.visual_tests.near_right}
                    onChange={(e) => handleVisualTestChange('near_right', e.target.value)}
                    placeholder="6/6"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-medical-text mb-2">
                  {t('vitals.colorVision') || 'رؤية الألوان'}
                </label>
                <select
                  className="crystal-input"
                  value={formData.visual_tests.color_vision}
                  onChange={(e) => handleVisualTestChange('color_vision', e.target.value)}
                >
                  <option value="">{t('common.select')}</option>
                  {COLOR_VISION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-4">
                <h3 className="font-medium text-medical-text">{t('vitals.hearing') || 'السمع'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="L.EAR"
                    value={formData.visual_tests.hearing_left}
                    onChange={(e) => handleVisualTestChange('hearing_left', e.target.value)}
                    placeholder="dB"
                  />
                  <Input
                    label="R.EAR"
                    value={formData.visual_tests.hearing_right}
                    onChange={(e) => handleVisualTestChange('hearing_right', e.target.value)}
                    placeholder="dB"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Systems Examination Section */}
        <div className="border-t border-medical-border pt-6 mb-6">
          <button
            type="button"
            onClick={() => toggleSection('systems')}
            className="w-full flex items-center justify-between text-lg font-semibold text-medical-text mb-4 hover:text-primary-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <i className="fas fa-user-md text-primary-600"></i>
              {t('vitals.systemsExamination') || 'فحص الوظائف الأساسية'}
            </span>
            <i className={`fas fa-chevron-${collapsedSections.systems ? 'down' : 'up'}`}></i>
          </button>

          {!collapsedSections.systems && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {BODY_SYSTEMS.map((system) => (
              <div key={system.key} className="border border-medical-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <i className={`fas ${system.icon} text-primary-600`}></i>
                  <label className="text-sm font-medium text-medical-text">
                    {t(system.translationKey)}
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSystemChange(system.key, 'normal')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      formData.systems_examination[system.key] === 'normal'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {t('vitals.normal') || 'طبيعي'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSystemChange(system.key, 'abnormal')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      formData.systems_examination[system.key] === 'abnormal'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {t('vitals.abnormal') || 'غير طبيعي'}
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="border-t border-medical-border pt-6">
          <label className="block text-sm font-medium text-medical-text mb-2">
            {t('vitals.notes')}
          </label>
          <textarea
            className="crystal-input"
            rows="4"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end space-x-4 rtl:space-x-reverse mt-6">
          <Button variant="secondary" type="button" icon="fa-times" onClick={() => navigate(`/patients/${id}`)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={loading} icon={loading ? 'fa-spinner fa-spin' : 'fa-save'}>
            {loading ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default VitalsForm;

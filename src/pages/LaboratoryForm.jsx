import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';

function LaboratoryForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    test_name: '',
    test_value: '',
    normal_range: '',
    unit: '',
    result: '',
  });
  const [testTypes, setTestTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTestTypes();
  }, []);

  const fetchTestTypes = async () => {
    try {
      const response = await api.get('/laboratory/test-types');
      setTestTypes(response.data);
    } catch (error) {
      console.error('Error fetching test types:', error);
    }
  };

  const handleTestTypeChange = (e) => {
    const selectedTest = testTypes.find(t => t.test_name === e.target.value);
    if (selectedTest) {
      setFormData({
        ...formData,
        test_name: selectedTest.test_name,
        normal_range: selectedTest.normal_range || '',
        unit: selectedTest.unit || '',
      });
    } else {
      setFormData({ ...formData, test_name: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/patients/${id}/laboratory`, formData);
      navigate(`/patients/${id}`);
    } catch (error) {
      console.error('Error saving test:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-medical-text mb-6 flex items-center gap-2">
        <i className="fas fa-flask text-primary-600"></i>
        {t('laboratory.addTest')}
      </h1>
      <form onSubmit={handleSubmit} className="crystal-card">
        <div className="mb-4">
          <label className="block text-sm font-medium text-medical-text mb-2">
            {t('laboratory.testName')} <span className="text-red-500">*</span>
          </label>
          <select
            className="crystal-input"
            value={formData.test_name}
            onChange={handleTestTypeChange}
            required
          >
            <option value="">{t('common.select')}</option>
            {testTypes.map((test) => (
              <option key={test.id || test.test_name} value={test.test_name}>
                {test.test_name} {test.normal_range ? `(${test.normal_range})` : ''}
              </option>
            ))}
          </select>
          <div className="mt-2">
            <Input
              label={t('laboratory.testName') + ' (جديد / New)'}
              value={formData.test_name}
              onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
              placeholder="أدخل اسم تحليل جديد / Enter new test name"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('laboratory.testValue')}
            type="text"
            value={formData.test_value}
            onChange={(e) => setFormData({ ...formData, test_value: e.target.value })}
            required
          />
          <Input
            label={t('laboratory.normalRange')}
            value={formData.normal_range}
            onChange={(e) => setFormData({ ...formData, normal_range: e.target.value })}
          />
          <Input
            label={t('laboratory.unit')}
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-medical-text mb-2">
            {t('laboratory.result')}
          </label>
          <textarea
            className="crystal-input"
            rows="3"
            value={formData.result}
            onChange={(e) => setFormData({ ...formData, result: e.target.value })}
          />
        </div>
        <div className="flex justify-end space-x-4 rtl:space-x-reverse">
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

export default LaboratoryForm;

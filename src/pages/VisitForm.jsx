import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';

function VisitForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    complaint: '',
    diagnosis: '',
    summary: '',
    treatment_plan: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/patients/${id}/visits`, formData);
      navigate(`/patients/${id}`);
    } catch (error) {
      console.error('Error saving visit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-medical-text mb-6 flex items-center gap-2">
        <i className="fas fa-stethoscope text-primary-600"></i>
        {t('visit.addVisit')}
      </h1>
      <form onSubmit={handleSubmit} className="crystal-card">
        <Input
          label={t('visit.visitDate')}
          type="date"
          value={formData.visit_date}
          onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
          required
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-medical-text mb-2">
            {t('visit.complaint')} <span className="text-red-500">*</span>
          </label>
          <textarea
            className="crystal-input"
            rows="3"
            value={formData.complaint}
            onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-medical-text mb-2">
            {t('visit.diagnosis')}
          </label>
          <textarea
            className="crystal-input"
            rows="3"
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-medical-text mb-2">
            {t('visit.summary')}
          </label>
          <textarea
            className="crystal-input"
            rows="3"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-medical-text mb-2">
            {t('visit.treatmentPlan')}
          </label>
          <textarea
            className="crystal-input"
            rows="4"
            value={formData.treatment_plan}
            onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
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

export default VisitForm;

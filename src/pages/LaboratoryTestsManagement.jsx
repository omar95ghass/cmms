import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Table from '../components/Table/Table';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Modal from '../components/Modal/Modal';

const TEST_CATEGORIES = [
  'Blood Tests',
  'Biochemistry',
  'Serology',
  'Urine Tests',
  'Stool Tests',
  'Other',
];

function LaboratoryTestsManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [testTypes, setTestTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    test_name: '',
    normal_range: '',
    unit: '',
    category: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchTestTypes();
  }, [user]);

  const fetchTestTypes = async () => {
    try {
      const response = await api.get('/laboratory-test-types');
      setTestTypes(response.data);
    } catch (error) {
      console.error('Error fetching test types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (test = null) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        test_name: test.test_name || '',
        normal_range: test.normal_range || '',
        unit: test.unit || '',
        category: test.category || '',
        description: test.description || '',
      });
    } else {
      setEditingTest(null);
      setFormData({
        test_name: '',
        normal_range: '',
        unit: '',
        category: '',
        description: '',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTest(null);
    setFormData({
      test_name: '',
      normal_range: '',
      unit: '',
      category: '',
      description: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.test_name.trim()) {
      newErrors.test_name = t('admin.testNameRequired') || 'اسم التحليل مطلوب';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingTest) {
        await api.put(`/laboratory-test-types/${editingTest.id}`, formData);
      } else {
        await api.post('/laboratory-test-types', formData);
      }
      handleCloseModal();
      fetchTestTypes();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.error || t('common.error') || 'حدث خطأ' });
      }
    }
  };

  const handleDelete = async (testId) => {
    if (!confirm(t('admin.confirmDeleteTest') || 'هل أنت متأكد من حذف هذا التحليل؟')) {
      return;
    }

    try {
      await api.delete(`/laboratory-test-types/${testId}`);
      fetchTestTypes();
    } catch (error) {
      alert(error.response?.data?.error || t('common.error') || 'حدث خطأ');
    }
  };

  const columns = [
    {
      header: t('laboratory.testName') || 'اسم التحليل',
      accessor: 'test_name',
    },
    {
      header: t('laboratory.category') || 'الفئة',
      accessor: 'category',
      render: (row) => row.category || '-',
    },
    {
      header: t('laboratory.normalRange') || 'المدى الطبيعي',
      accessor: 'normal_range',
      render: (row) => row.normal_range || '-',
    },
    {
      header: t('laboratory.unit') || 'الوحدة',
      accessor: 'unit',
      render: (row) => row.unit || '-',
    },
    {
      header: t('common.createdAt') || 'تاريخ الإنشاء',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: t('common.actions') || 'الإجراءات',
      render: (row) => (
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            variant="secondary"
            size="sm"
            icon="fa-edit"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(row);
            }}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon="fa-trash"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
          >
            {t('common.delete')}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-medical-text flex items-center gap-2">
          <i className="fas fa-vial text-primary-600"></i>
          {t('admin.manageTests') || 'إدارة التحاليل الطبية'}
        </h1>
        <Button icon="fa-plus" onClick={() => handleOpenModal()}>
          {t('admin.addTest') || 'إضافة تحليل'}
        </Button>
      </div>

      <Table
        columns={columns}
        data={testTypes}
        emptyMessage={t('admin.noTests') || 'لا يوجد تحاليل'}
      />

      {/* Add/Edit Test Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingTest ? t('admin.editTest') || 'تعديل تحليل' : t('admin.addTest') || 'إضافة تحليل'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label={t('laboratory.testName') || 'اسم التحليل'}
              value={formData.test_name}
              onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
              required
              error={errors.test_name}
            />

            <div>
              <label className="block text-sm font-medium text-medical-text mb-2">
                {t('laboratory.category') || 'الفئة'}
              </label>
              <select
                className="crystal-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">{t('common.select') || 'اختر'}</option>
                {TEST_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={t('laboratory.normalRange') || 'المدى الطبيعي'}
              value={formData.normal_range}
              onChange={(e) => setFormData({ ...formData, normal_range: e.target.value })}
              placeholder="مثال: 70-100"
            />

            <Input
              label={t('laboratory.unit') || 'الوحدة'}
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="مثال: mg/dL, mmol/L"
            />

            <div>
              <label className="block text-sm font-medium text-medical-text mb-2">
                {t('laboratory.description') || 'الوصف'}
              </label>
              <textarea
                className="crystal-input"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('laboratory.descriptionPlaceholder') || 'وصف التحليل (اختياري)'}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
            <Button variant="secondary" type="button" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {editingTest ? t('common.update') || 'تحديث' : t('common.add') || 'إضافة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default LaboratoryTestsManagement;

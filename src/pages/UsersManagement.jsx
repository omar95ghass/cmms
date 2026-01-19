import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Table from '../components/Table/Table';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Modal from '../components/Modal/Modal';

const ROLES = ['admin', 'reception', 'nurse', 'doctor', 'laboratory'];

function UsersManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
    full_name: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '',
        role: user.role,
        full_name: user.full_name || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        role: '',
        full_name: '',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      role: '',
      full_name: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = t('admin.usernameRequired') || 'اسم المستخدم مطلوب';
    }
    if (!editingUser && !formData.password) {
      newErrors.password = t('admin.passwordRequired') || 'كلمة المرور مطلوبة';
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = t('admin.passwordMinLength') || 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    if (!formData.role) {
      newErrors.role = t('admin.roleRequired') || 'الدور مطلوب';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.error || t('common.error') || 'حدث خطأ' });
      }
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm(t('admin.confirmDeleteUser') || 'هل أنت متأكد من حذف هذا المستخدم؟')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || t('common.error') || 'حدث خطأ');
    }
  };

  const columns = [
    {
      header: t('common.username') || 'اسم المستخدم',
      accessor: 'username',
    },
    {
      header: t('common.fullName') || 'الاسم الكامل',
      accessor: 'full_name',
      render: (row) => row.full_name || '-',
    },
    {
      header: t('common.role') || 'الدور',
      accessor: 'role',
      render: (row) => t(`roles.${row.role}`) || row.role,
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
          <i className="fas fa-users-cog text-primary-600"></i>
          {t('admin.manageUsers') || 'إدارة المستخدمين'}
        </h1>
        <Button icon="fa-user-plus" onClick={() => handleOpenModal()}>
          {t('admin.addUser') || 'إضافة مستخدم'}
        </Button>
      </div>

      <Table
        columns={columns}
        data={users}
        emptyMessage={t('admin.noUsers') || 'لا يوجد مستخدمين'}
      />

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingUser ? t('admin.editUser') || 'تعديل مستخدم' : t('admin.addUser') || 'إضافة مستخدم'}
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
              label={t('common.username') || 'اسم المستخدم'}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              error={errors.username}
            />

            <Input
              label={t('common.password') || 'كلمة المرور'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              error={errors.password}
              placeholder={editingUser ? t('admin.leaveEmptyToKeepPassword') || 'اتركه فارغاً للاحتفاظ بكلمة المرور الحالية' : ''}
            />

            <div>
              <label className="block text-sm font-medium text-medical-text mb-2">
                {t('common.role') || 'الدور'} <span className="text-red-500">*</span>
              </label>
              <select
                className="crystal-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="">{t('common.select') || 'اختر'}</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`roles.${role}`) || role}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">{errors.role}</p>
              )}
            </div>

            <Input
              label={t('common.fullName') || 'الاسم الكامل'}
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
            <Button variant="secondary" type="button" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {editingUser ? t('common.update') || 'تحديث' : t('common.add') || 'إضافة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UsersManagement;

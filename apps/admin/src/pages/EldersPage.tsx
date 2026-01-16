import { useEffect, useState } from 'react';
import { Plus, Search, Phone, MapPin, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { elderService } from '../services/elderService';
import { tenantService } from '../services/tenantService';
import type { Elder, Tenant, ElderStatus } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const EldersPage = () => {
  const [elders, setElders] = useState<Elder[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [availableDevices, setAvailableDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingElder, setEditingElder] = useState<Elder | null>(null);
  const [deletingElder, setDeletingElder] = useState<Elder | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Partial<Elder>>();
  const watchTenantId = watch('tenantId');

  useEffect(() => {
    loadElders();
    loadTenants();
  }, [page]);

  // 當選擇的社區改變時，載入該社區的可用設備
  useEffect(() => {
    if (watchTenantId) {
      loadAvailableDevicesForTenant(watchTenantId);
    } else {
      setAvailableDevices([]);
    }
  }, [watchTenantId]);

  const loadElders = async () => {
    try {
      const response: any = await elderService.getAll(page, 9);
      setElders(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error) {
      console.error('Failed to load elders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const response: any = await tenantService.getAll(1, 100);
      setTenants(response.data.data);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  };

  const loadAvailableDevicesForTenant = async (tenantId: string) => {
    try {
      // 載入該社區未綁定長輩的設備
      const response: any = await elderService.getAvailableDevices(tenantId);
      setAvailableDevices(response.data.data || []);
    } catch (error) {
      console.error('Failed to load available devices:', error);
      setAvailableDevices([]);
    }
  };

  const handleCreate = () => {
    setEditingElder(null);
    reset({});
    setShowModal(true);
  };

  const handleEdit = (elder: Elder) => {
    setEditingElder(elder);
    // Only reset with editable fields, exclude relations
    reset({
      tenantId: elder.tenantId,
      name: elder.name,
      phone: elder.phone || '',
      address: elder.address || '',
      emergencyContact: elder.emergencyContact || '',
      emergencyPhone: elder.emergencyPhone || '',
      status: elder.status,
      inactiveThresholdHours: elder.inactiveThresholdHours || 24,
      deviceId: elder.device?.id || '',
      notes: elder.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingElder) return;
    
    try {
      await elderService.delete(deletingElder.id);
      alert('刪除成功');
      loadElders();
    } catch (error: any) {
      alert(error.response?.data?.message || '刪除失敗');
    }
  };

  const onSubmit = async (data: Partial<Elder>) => {
    try {
      if (editingElder) {
        await elderService.update(editingElder.id, data);
        alert('更新成功');
      } else {
        await elderService.create(data);
        alert('新增成功');
      }
      setShowModal(false);
      loadElders();
    } catch (error: any) {
      alert(error.response?.data?.message || '操作失敗');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      HOSPITALIZED: 'bg-yellow-100 text-yellow-800',
      DECEASED: 'bg-red-100 text-red-800',
      MOVED_OUT: 'bg-blue-100 text-blue-800',
    };
    
    const labels = {
      ACTIVE: '正常',
      INACTIVE: '不活躍',
      HOSPITALIZED: '住院',
      DECEASED: '已故',
      MOVED_OUT: '遷出',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-12">載入中...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">長者管理</h1>
          <p className="text-sm text-blue-600 mt-1">
            💡 可以在新增/編輯長者時選擇未分配的設備進行關聯
          </p>
          <p className="text-gray-600 mt-1">管理所有長者資料</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>新增長者</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋長者..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Elders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elders.map((elder) => (
          <div key={elder.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{elder.name}</h3>
                <p className="text-sm text-gray-500">{elder.tenant?.name}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(elder.status)}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {elder.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{elder.phone}</span>
                </div>
              )}
              {elder.address && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{elder.address}</span>
                </div>
              )}
            </div>

            {elder.device && (
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <p className="text-xs text-gray-500 mb-1">設備</p>
                <p className="text-sm font-mono">{elder.device.macAddress}</p>
                {elder.device.batteryLevel && (
                  <p className="text-xs text-gray-600 mt-1">
                    電量: {elder.device.batteryLevel}%
                  </p>
                )}
              </div>
            )}

            {elder.lastActivityAt && (
              <p className="text-xs text-gray-500 mb-3">
                最後活動: {formatDistanceToNow(new Date(elder.lastActivityAt), {
                  addSuffix: true,
                  locale: zhTW,
                })}
              </p>
            )}

            <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => handleEdit(elder)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">編輯</span>
              </button>
              <button
                onClick={() => setDeletingElder(elder)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">刪除</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">總共 {total} 位長者</p>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            上一頁
          </button>
          <span className="px-3 py-1">第 {page} 頁</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * 9 >= total}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            下一頁
          </button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingElder ? '編輯長者' : '新增長者'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">所屬社區 *</label>
              <select {...register('tenantId', { required: true })} className="input">
                <option value="">請選擇社區</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
              {errors.tenantId && <p className="text-sm text-red-600 mt-1">請選擇社區</p>}
            </div>

            <div>
              <label className="label">姓名 *</label>
              <input
                type="text"
                {...register('name', { required: true })}
                className="input"
                placeholder="陳阿公"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">請輸入姓名</p>}
            </div>

            <div>
              <label className="label">電話</label>
              <input
                type="tel"
                {...register('phone')}
                className="input"
                placeholder="0912-345-678"
              />
            </div>

            <div className="col-span-2">
              <label className="label">地址</label>
              <input
                type="text"
                {...register('address')}
                className="input"
                placeholder="社區 A 棟 3 樓"
              />
            </div>

            <div>
              <label className="label">緊急聯絡人</label>
              <input
                type="text"
                {...register('emergencyContact')}
                className="input"
                placeholder="家屬姓名"
              />
            </div>

            <div>
              <label className="label">緊急聯絡電話</label>
              <input
                type="tel"
                {...register('emergencyPhone')}
                className="input"
                placeholder="0912-345-678"
              />
            </div>

            <div>
              <label className="label">狀態</label>
              <select {...register('status')} className="input">
                <option value="ACTIVE">正常</option>
                <option value="INACTIVE">不活躍</option>
                <option value="HOSPITALIZED">住院</option>
                <option value="DECEASED">已故</option>
                <option value="MOVED_OUT">遷出</option>
              </select>
            </div>

            <div>
              <label className="label">不活躍警報閾值（小時）</label>
              <input
                type="number"
                {...register('inactiveThresholdHours')}
                className="input"
                placeholder="24"
                defaultValue={24}
              />
            </div>

            <div className="col-span-2">
              <label className="label">關聯設備（可選）</label>
              <select 
                {...register('deviceId')} 
                className="input"
                disabled={!watchTenantId}
              >
                <option value="">
                  {watchTenantId ? '暫不關聯設備' : '請先選擇社區'}
                </option>
                {availableDevices.map((device) => (
                  <option 
                    key={device.id} 
                    value={device.id}
                  >
                    {device.macAddress} 
                    {device.deviceName ? ` (${device.deviceName})` : ''}
                    {device.batteryLevel ? ` - 電量 ${device.batteryLevel}%` : ''}
                  </option>
                ))}
              </select>
              {!watchTenantId && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ 請先選擇社區
                </p>
              )}
              {watchTenantId && availableDevices.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ 此社區尚無可用設備，請先在「社區管理」中分配設備給該社區
                </p>
              )}
              {watchTenantId && availableDevices.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 只顯示該社區未綁定的設備（共 {availableDevices.length} 個）
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="label">備註</label>
              <textarea
                {...register('notes')}
                className="input"
                rows={3}
                placeholder="特殊注意事項..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              {editingElder ? '更新' : '新增'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingElder}
        onClose={() => setDeletingElder(null)}
        onConfirm={handleDelete}
        title="確認刪除"
        message={`確定要刪除長者「${deletingElder?.name}」嗎？此操作無法復原。`}
        confirmText="刪除"
        type="danger"
      />
    </div>
  );
};

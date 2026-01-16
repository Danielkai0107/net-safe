import { useEffect, useState } from 'react';
import { X, UserCheck, UserX, Shield, UserPlus, Trash2 } from 'lucide-react';
import { tenantService } from '../services/tenantService';
import { appUserService } from '../services/appUserService';

interface AppMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName: string;
}

export const AppMembersModal = ({ isOpen, onClose, tenantId, tenantName }: AppMembersModalProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');

  useEffect(() => {
    if (isOpen && tenantId) {
      loadMembers();
    }
  }, [isOpen, tenantId]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response: any = await tenantService.getAppMembers(tenantId);
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load app members:', error);
      alert('載入成員失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberId: string, memberName: string) => {
    if (!confirm(`確定要批准「${memberName}」加入嗎？`)) return;

    try {
      await tenantService.approveMember(tenantId, memberId);
      alert('已批准');
      loadMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || '批准失敗');
    }
  };

  const handleReject = async (memberId: string, memberName: string) => {
    const reason = prompt(`拒絕「${memberName}」的申請？\n請輸入拒絕原因（選填）：`);
    if (reason === null) return; // 取消

    try {
      await tenantService.rejectMember(tenantId, memberId, reason || undefined);
      alert('已拒絕');
      loadMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || '拒絕失敗');
    }
  };

  const handleToggleRole = async (memberId: string, currentRole: string, memberName: string) => {
    const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    const action = newRole === 'ADMIN' ? '設為管理員' : '取消管理員';
    
    if (!confirm(`確定要將「${memberName}」${action}嗎？`)) return;

    try {
      await tenantService.setMemberRole(tenantId, memberId, newRole);
      alert(`已${action}`);
      loadMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || '操作失敗');
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response: any = await appUserService.getAllForSelection();
      // 後端返回格式：{ data: [...], timestamp: ... }
      const allUsers = response.data?.data || [];
      
      // 過濾掉已經是成員的用戶（包括待批准和已批准的）
      const memberUserIds = new Set(
        members
          .filter((m: any) => m.status === 'APPROVED' || m.status === 'PENDING')
          .map((m: any) => m.appUserId)
      );
      
      const available = Array.isArray(allUsers) 
        ? allUsers.filter((user: any) => !memberUserIds.has(user.id))
        : [];
      
      setAvailableUsers(available);
    } catch (error) {
      console.error('Failed to load available users:', error);
      alert('載入可用用戶失敗');
    }
  };

  const handleShowAddModal = () => {
    loadAvailableUsers();
    setShowAddModal(true);
    setSelectedUserId('');
    setSelectedRole('MEMBER');
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      alert('請選擇用戶');
      return;
    }

    try {
      await tenantService.addMember(tenantId, selectedUserId, selectedRole);
      alert('新增成員成功');
      setShowAddModal(false);
      loadMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || '新增成員失敗');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`確定要移除「${memberName}」嗎？此操作無法復原。`)) return;

    try {
      await tenantService.removeMember(tenantId, memberId);
      alert('已移除成員');
      loadMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || '移除失敗');
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const styles: any = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    const labels: any = {
      PENDING: '待批准',
      APPROVED: '已批准',
      REJECTED: '已拒絕',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    return role === 'ADMIN' ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center space-x-1">
        <Shield className="w-3 h-3" />
        <span>管理員</span>
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        一般成員
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">App 成員管理</h2>
            <p className="text-sm text-gray-500 mt-1">{tenantName}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleShowAddModal}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>新增成員</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暫無 App 成員
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {member.appUser?.name}
                        </h3>
                        {getStatusBadge(member.status)}
                        {member.status === 'APPROVED' && getRoleBadge(member.role)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Email: {member.appUser?.email}</div>
                        {member.appUser?.phone && (
                          <div>電話: {member.appUser.phone}</div>
                        )}
                        <div>
                          申請時間: {new Date(member.requestedAt).toLocaleString('zh-TW')}
                        </div>
                        {member.processedAt && (
                          <div>
                            處理時間: {new Date(member.processedAt).toLocaleString('zh-TW')}
                            {member.processedByType && (
                              <span className="ml-2 text-xs">
                                (由{member.processedByType === 'backend' ? '後台' : 'App'}批准)
                              </span>
                            )}
                          </div>
                        )}
                        {member.rejectionReason && (
                          <div className="text-red-600">
                            拒絕原因: {member.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* 待批准狀態：顯示批准/拒絕按鈕 */}
                      {member.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(member.id, member.appUser?.name)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="批准"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(member.id, member.appUser?.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="拒絕"
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* 已批准狀態：顯示管理員切換按鈕 */}
                      {member.status === 'APPROVED' && (
                        <>
                          <button
                            onClick={() => handleToggleRole(member.id, member.role, member.appUser?.name)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                              member.role === 'ADMIN'
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                            title={member.role === 'ADMIN' ? '取消管理員' : '設為管理員'}
                          >
                            {member.role === 'ADMIN' ? '取消管理員' : '設為管理員'}
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id, member.appUser?.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="移除成員"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            關閉
          </button>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">新增成員</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選擇 App 用戶 *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">請選擇用戶</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {availableUsers.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    沒有可用的用戶（所有啟用的用戶都已是成員）
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  角色 *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'MEMBER' | 'ADMIN')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MEMBER">一般成員</option>
                  <option value="ADMIN">管理員</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                取消
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUserId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                新增
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Shield,
  Lock,
  Bell,
  Globe,
  Trash2,
  LogOut,
  Smartphone,
  UserX,
  Download,
  HelpCircle,
  FileText,
  KeyRound,
  Coins,
  Sliders,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_USER } from '../../data/mockData';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    userProfile,
    updateProfile,
    logoutUser,
    deleteAccount,
    setIsWalletModalOpen,
    setIsAdminPanelOpen,
    unblockUser,
    showToast,
    followRequests,
    setIsFollowRequestsModalOpen,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'main' | 'privacy' | 'security' | 'notifications' | 'blocked'>('main');
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isSettingsModalOpen) return null;

  const security = {
    ...INITIAL_USER.securitySettings,
    ...(userProfile?.securitySettings || {}),
  };

  const handleTogglePrivateAccount = () => {
    const nextVal = !security.isPrivateAccount;
    updateProfile({
      securitySettings: {
        ...security,
        isPrivateAccount: nextVal,
      },
    });
    showToast(nextVal ? 'أصبح حسابك خاصاً الآن 🔒' : 'أصبح حسابك عاماً للجميع 🌍');
  };

  const handleToggleDownload = () => {
    const nextVal = !security.allowDownloadMyVideos;
    updateProfile({
      securitySettings: {
        ...security,
        allowDownloadMyVideos: nextVal,
      },
    });
    showToast(nextVal ? 'تم تفعيل إمكانية تنزيل فيديوهاتك' : 'تم قفل تنزيل الفيديوهات');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    showToast('تم تغيير كلمة المرور بنجاح 🔑');
    setNewPassword('');
  };

  const handleLogoutAllDevices = () => {
    updateProfile({
      securitySettings: {
        ...security,
        activeSessions: (security.activeSessions || []).slice(0, 1),
      },
    });
    showToast('تم تسجيل الخروج من كافة الأجهزة الأخرى بنجاح ✅');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0E1424] border border-white/10 rounded-3xl p-5 shadow-2xl text-right animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
          <button
            onClick={() => {
              if (activeSection !== 'main') setActiveSection('main');
              else setIsSettingsModalOpen(false);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            {activeSection !== 'main' ? <ChevronLeft className="w-5 h-5 rotate-180" /> : <X className="w-5 h-5" />}
          </button>
          <h3 className="text-sm font-bold text-white font-heading">
            {activeSection === 'main' && 'الإعدادات والخصوصية'}
            {activeSection === 'privacy' && 'إعدادات الخصوصية'}
            {activeSection === 'security' && 'أمان الحساب والجلسات'}
            {activeSection === 'notifications' && 'إشعارات التطبيق'}
            {activeSection === 'blocked' && 'المستخدمون المحظورون'}
          </h3>
        </div>

        {/* Main Section */}
        {activeSection === 'main' && (
          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-0.5">
            {/* Quick Wallet Shortcut */}
            <div
              onClick={() => {
                setIsSettingsModalOpen(false);
                setIsWalletModalOpen(true);
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Coins className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-xs font-bold text-white block">محفظة العملات والهدايا</span>
                  <span className="text-[10px] text-amber-300 font-mono">{userProfile.coinsBalance} عملة</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </div>

            {/* Admin Supervision Link */}
            {userProfile.isAdmin && (
              <div
                onClick={() => {
                  setIsSettingsModalOpen(false);
                  setIsAdminPanelOpen(true);
                }}
                className="p-3.5 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-[#00F2FE]" />
                  <div>
                    <span className="text-xs font-bold text-white block">لوحة الإدارة والإشراف</span>
                    <span className="text-[10px] text-slate-400">مراجعة البلاغات والمحتوى المخالف</span>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </div>
            )}

            {/* Menu List */}
            <div className="space-y-1 divide-y divide-white/5">
              <button
                onClick={() => setActiveSection('privacy')}
                className="w-full py-3 flex items-center justify-between text-xs text-white hover:text-[#00F2FE] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>الخصوصية وتنزيل الفيديوهات</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveSection('security')}
                className="w-full py-3 flex items-center justify-between text-xs text-white hover:text-[#00F2FE] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <span>أمان الحساب والجلسات النشطة</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveSection('notifications')}
                className="w-full py-3 flex items-center justify-between text-xs text-white hover:text-[#00F2FE] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>إشعارات التطبيق والهاتف</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveSection('blocked')}
                className="w-full py-3 flex items-center justify-between text-xs text-white hover:text-[#00F2FE] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <UserX className="w-4 h-4 text-slate-400" />
                  <span>الحسابات المحظورة ({(security.blockedUsers || []).length})</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <button
                onClick={logoutUser}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-amber-400" />
                <span>تسجيل الخروج</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف الحساب نهائياً</span>
              </button>
            </div>
          </div>
        )}

        {/* Privacy Section */}
        {activeSection === 'privacy' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <span className="font-bold text-white block">حساب خاص</span>
                <span className="text-[10px] text-slate-400">فقط المتابعون المعتمدون يشاهدون فيديوهاتك ومنشوراتك</span>
              </div>
              <input
                type="checkbox"
                checked={security.isPrivateAccount}
                onChange={handleTogglePrivateAccount}
                className="w-4 h-4 accent-[#00F2FE] cursor-pointer"
              />
            </div>

            {/* Follow Requests Shortcut */}
            <div
              onClick={() => {
                setIsSettingsModalOpen(false);
                setIsFollowRequestsModalOpen(true);
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#00F2FE]/15 via-[#7928CA]/15 to-transparent border border-[#00F2FE]/30 cursor-pointer hover:border-[#00F2FE] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00F2FE]" />
                <div>
                  <span className="font-bold text-white block">طلبات المتابعة المعلقة</span>
                  <span className="text-[10px] text-slate-400">مراجعة الأشخاص الراغبين بمتابعة حسابك</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#00F2FE] text-[#07090E] text-[10px] font-bold">
                {followRequests.length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <span className="font-bold text-white block">السماح بتنزيل فيديوهاتي</span>
                <span className="text-[10px] text-slate-400">إمكانية حفظ مقاطعك إلى أجهزة المشاهدين</span>
              </div>
              <input
                type="checkbox"
                checked={security.allowDownloadMyVideos}
                onChange={handleToggleDownload}
                className="w-4 h-4 accent-[#00F2FE] cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">من يستطيع التعليق على فيديوهاتي؟</label>
              <select
                value={security.whoCanComment}
                onChange={(e) => {
                  updateProfile({
                    securitySettings: {
                      ...security,
                      whoCanComment: e.target.value as 'everyone' | 'friends' | 'no_one',
                    },
                  });
                  showToast('تم تحديث صلاحيات التعليق');
                }}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="everyone" className="bg-[#0E1424]">الجميع</option>
                <option value="friends" className="bg-[#0E1424]">الأصدقاء فقط</option>
                <option value="no_one" className="bg-[#0E1424]">لا أحد</option>
              </select>
            </div>
          </div>
        )}

        {/* Security & Sessions */}
        {activeSection === 'security' && (
          <div className="space-y-4 text-xs">
            {/* Change Password */}
            <form onSubmit={handleChangePassword} className="space-y-2 p-3 bg-white/5 rounded-2xl border border-white/10">
              <label className="font-bold text-white block">تغيير كلمة المرور</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة..."
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newPassword.trim()}
                className="w-full py-2 rounded-xl bg-neon-gradient text-white font-bold text-xs disabled:opacity-50"
              >
                تحديث كلمة المرور
              </button>
            </form>

            {/* Active Sessions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">الأجهزة والجلسات النشطة</span>
                <button
                  onClick={handleLogoutAllDevices}
                  className="text-[10px] text-[#FE2C55] font-bold hover:underline"
                >
                  تسجيل الخروج من بقية الأجهزة
                </button>
              </div>

              {(security.activeSessions || []).map((sess) => (
                <div key={sess.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#00F2FE]" />
                    <div>
                      <span className="text-[11px] font-bold text-white block">{sess.deviceName}</span>
                      <span className="text-[9px] text-slate-400">{sess.location} · {sess.lastActive}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="space-y-3 text-xs">
            {[
              { key: 'newFollowers', label: 'المتابعون الجدد' },
              { key: 'likes', label: 'تسجيلات الإعجاب' },
              { key: 'comments', label: 'التعليقات والردود' },
              { key: 'liveStreams', label: 'بدء بثوث مباشرة لصناع تتابعهم' },
              { key: 'gifts', label: 'تنبيهات الهدايا والألماس' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white font-medium">{item.label}</span>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  onChange={() => showToast('تم تحديث تفضيلات الإشعارات')}
                  className="w-4 h-4 accent-[#00F2FE] cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}

        {/* Blocked Users Section */}
        {activeSection === 'blocked' && (
          <div className="space-y-2 text-xs">
            {(security.blockedUsers || []).length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                قائمة الحسابات المحظورة فارغة 👍
              </div>
            ) : (
              (security.blockedUsers || []).map((u) => (
                <div key={u.id} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <span className="font-bold text-white block">{u.name}</span>
                      <span className="text-[10px] text-slate-400">@{u.username}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => unblockUser(u.id)}
                    className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 text-[10px] font-bold"
                  >
                    إلغاء الحظر
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Delete Confirm Modal Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-[#07090E] rounded-3xl p-6 flex flex-col justify-center text-center space-y-4 z-20 animate-in fade-in">
            <Trash2 className="w-12 h-12 text-[#FE2C55] mx-auto animate-bounce" />
            <h4 className="text-sm font-black text-white font-heading">هل أنت متأكد من حذف الحساب؟</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              سيتم حذف جميع مقاطع الفيديو والإعجابات والمحادثات نهائياً ولا يمكن استرجاعها.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                تراجع
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-extrabold shadow-lg"
              >
                تأكيد الحذف نهائياً
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

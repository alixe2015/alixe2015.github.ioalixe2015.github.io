import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  FolderArchive,
  Calendar,
  FileJson,
  LogOut,
  HelpCircle,
  Download
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken 
} from '../services/googleAuth';
import { 
  findOrCreateAppFolder, 
  listBackupFiles, 
  backupPostcardsToDrive, 
  downloadBackupFile, 
  deleteDriveFile,
  DriveFileInfo 
} from '../services/googleDriveService';
import { PostcardEntry } from '../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  postcards: PostcardEntry[];
  onRestorePostcards: (postcards: PostcardEntry[]) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  postcards,
  onRestorePostcards,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const [folderId, setFolderId] = useState<string | null>(null);
  const [backupFiles, setBackupFiles] = useState<DriveFileInfo[]>([]);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);

  // Destructive Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Listen for Auth changes
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        loadDriveData(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setFolderId(null);
        setBackupFiles([]);
      }
    );

    // Also check if we already have a cached token
    getAccessToken().then((cached) => {
      if (cached && !token) {
        setToken(cached);
        loadDriveData(cached);
      }
    });

    return () => unsubscribe();
  }, [isOpen]);

  const loadDriveData = async (accessToken: string) => {
    try {
      setLoading(true);
      const fId = await findOrCreateAppFolder(accessToken);
      setFolderId(fId);
      const files = await listBackupFiles(accessToken, fId);
      setBackupFiles(files);
      if (files.length > 0 && files[0].modifiedTime) {
        setLastBackupTime(new Date(files[0].modifiedTime).toLocaleString('zh-CN'));
      }
    } catch (err: any) {
      console.error('Error loading Google Drive info:', err);
      setStatusMessage({ type: 'error', text: `加载 Google Drive 目录失败: ${err.message || err}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({ type: 'success', text: `已成功连接 Google 账号: ${res.user.email}` });
        await loadDriveData(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setStatusMessage({ type: 'error', text: `登录 Google 失败: ${err.message || '用户取消或权限未授予'}` });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setFolderId(null);
    setBackupFiles([]);
    setStatusMessage({ type: 'info', text: '已退出 Google 账号' });
  };

  const handleBackupNow = async () => {
    if (!token || !folderId) {
      setStatusMessage({ type: 'error', text: '请先登录并连接 Google Drive' });
      return;
    }

    try {
      setLoading(true);
      setStatusMessage({ type: 'info', text: '正在打包当前所有明信片与心潮录音并上传...' });
      
      const newFile = await backupPostcardsToDrive(postcards, token, folderId);
      setStatusMessage({ 
        type: 'success', 
        text: `备份成功！已向 Google Drive 存入「${newFile.name}」（共 ${postcards.length} 张切片）` 
      });
      await loadDriveData(token);
    } catch (err: any) {
      console.error('Backup error:', err);
      setStatusMessage({ type: 'error', text: `备份失败: ${err.message || err}` });
    } finally {
      setLoading(false);
    }
  };

  const requestRestoreConfirmation = (file: DriveFileInfo) => {
    setConfirmDialog({
      isOpen: true,
      title: '从云端恢复记忆切片',
      description: `即将从云端文件「${file.name}」恢复记忆切片。这将会用备份中的数据合并或替换当前本地数据，请确认是否继续？`,
      actionLabel: '确认恢复',
      isDangerous: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        if (!token) return;
        try {
          setLoading(true);
          const data = await downloadBackupFile(file.id, token);
          onRestorePostcards(data.postcards);
          setStatusMessage({
            type: 'success',
            text: `已成功恢复 ${data.postcards.length} 张明信片！本地数据已同步更新。`,
          });
        } catch (err: any) {
          console.error('Restore error:', err);
          setStatusMessage({ type: 'error', text: `恢复失败: ${err.message || err}` });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const requestDeleteConfirmation = (file: DriveFileInfo) => {
    setConfirmDialog({
      isOpen: true,
      title: '删除云端备份文件',
      description: `确定要从您的 Google Drive 中永久删除备份文件「${file.name}」吗？此操作无法撤销。`,
      actionLabel: '确认删除',
      isDangerous: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        if (!token) return;
        try {
          setLoading(true);
          await deleteDriveFile(file.id, token);
          setStatusMessage({ type: 'success', text: `已从 Google Drive 移除「${file.name}」` });
          if (folderId) await loadDriveData(token);
        } catch (err: any) {
          console.error('Delete error:', err);
          setStatusMessage({ type: 'error', text: `删除失败: ${err.message || err}` });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDownloadLocalBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(postcards, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `具身回响_记忆全量备份_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setStatusMessage({ type: 'success', text: `已下载包含 ${postcards.length} 张切片的本地 JSON 备份文件` });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#141518] border border-[#2b2d33] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#24252a] bg-[#101114]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif-sc font-bold text-[#ede8de]">
                  Google Drive 云端记忆保险箱
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono-data bg-[#23242a] text-[#a09a8f] border border-[#373940] rounded-full">
                  v3 REST API
                </span>
              </div>
              <p className="text-xs text-[#8a8477] font-serif-sc mt-0.5">
                将你的每日摄影切片、温声波形与感官年鉴安全保存在专属 Google 云盘
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8a8477] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status / Alert Bar */}
        {statusMessage && (
          <div className={`px-6 py-2.5 text-xs font-serif-sc flex items-center gap-2 border-b ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300' 
              : statusMessage.type === 'error'
              ? 'bg-rose-950/40 border-rose-800/40 text-rose-300'
              : 'bg-blue-950/40 border-blue-800/40 text-blue-300'
          }`}>
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />}
            <span className="flex-1">{statusMessage.text}</span>
            <button 
              onClick={() => setStatusMessage(null)}
              className="opacity-70 hover:opacity-100 text-[10px] underline ml-2"
            >
              忽略
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-serif-sc">
          {/* User Sign-in Status Card */}
          {!user ? (
            <div className="p-6 rounded-xl bg-[#1a1b20] border border-[#2b2d35] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Cloud className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className="text-base font-bold text-[#ede8de]">
                  连接 Google Drive 开启跨设备与永久备份
                </h4>
                <p className="text-xs text-[#9d978a] leading-relaxed">
                  在用户许可下，应用将自动在您的 Google Drive 建立独立的「具身回响 · Embodied Echo 备份」专属文件夹，只同步由您保存的生活切片与原声记录。
                </p>
              </div>

              {/* Official Styled "Sign in with Google" Button */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm rounded-lg shadow-md transition-all active:scale-[0.98] border border-slate-200 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  <span>{isSigningIn ? '正在连线 Google 授权...' : '使用 Google 账号登录并连接'}</span>
                </button>
              </div>

              <div className="pt-2 text-[11px] text-[#78736a] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>安全说明：令牌严格保存在内存中，退出或刷新即清空，无隐私泄露风险</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connected User Profile Banner */}
              <div className="p-4 rounded-xl bg-[#191a1f] border border-[#2b2d35] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'Google User'} 
                      className="w-10 h-10 rounded-full border border-blue-400/30 object-cover" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-sm">
                      {user.email ? user.email[0].toUpperCase() : 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#ede8de]">
                        {user.displayName || 'Google 具身用户'}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 rounded">
                        已连接
                      </span>
                    </div>
                    <span className="text-xs text-[#8a8477] font-mono-data">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => token && loadDriveData(token)}
                    disabled={loading}
                    className="p-2 text-xs bg-[#24252c] hover:bg-[#2e3039] border border-[#3b3d47] text-[#c4beaf] rounded-lg transition-colors flex items-center gap-1.5"
                    title="刷新云端列表"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">刷新</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-xs bg-[#24252c] hover:bg-rose-950/30 hover:border-rose-800/40 border border-[#3b3d47] text-[#c4beaf] hover:text-rose-300 rounded-lg transition-colors flex items-center gap-1.5"
                    title="退出登录"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>退出</span>
                  </button>
                </div>
              </div>

              {/* Action Operations Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* One-click backup button */}
                <div className="p-4 rounded-xl bg-[#16171b] border border-[#26282f] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[#e6c382] font-semibold">
                        <UploadCloud className="w-4 h-4" />
                        <span>一键备份当前记忆</span>
                      </div>
                      <span className="text-[11px] font-mono-data text-[#8a8477]">
                        {postcards.length} 张切片
                      </span>
                    </div>
                    <p className="text-xs text-[#8a8477] mt-1.5 leading-relaxed">
                      将本地全部每日明信片、音频波形、感官反思打包上传至 Google Drive 备份文件夹。
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackupNow}
                      disabled={loading}
                      className="flex-1 py-2.5 px-4 bg-[#e6c382] hover:bg-[#edd29b] text-[#141416] font-medium text-xs rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>备份到 Google Drive</span>
                    </button>
                    <button
                      onClick={handleDownloadLocalBackup}
                      className="py-2.5 px-3 bg-[#22242a] hover:bg-[#2b2e36] text-[#edd8b4] border border-[#3b3e48] rounded-lg text-xs font-serif-sc transition-colors flex items-center justify-center gap-1.5 shrink-0"
                      title="直接将全部切片数据下载为本地 JSON 离线文件"
                    >
                      <Download className="w-3.5 h-3.5 text-[#e6c382]" />
                      <span>导出本地备份</span>
                    </button>
                  </div>
                </div>

                {/* Cloud folder info */}
                <div className="p-4 rounded-xl bg-[#16171b] border border-[#26282f] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
                        <FolderArchive className="w-4 h-4" />
                        <span>Google Drive 云端文件夹</span>
                      </div>
                      <span className="text-[11px] font-mono-data text-emerald-400">
                        {backupFiles.length} 份归档
                      </span>
                    </div>
                    <p className="text-xs text-[#8a8477] mt-1.5 leading-relaxed">
                      文件夹名称：「具身回响 · Embodied Echo 备份」。最近备份时间：{lastBackupTime || '暂无'}。
                    </p>
                  </div>

                  {folderId && (
                    <a
                      href={`https://drive.google.com/drive/folders/${folderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-[#23252d] hover:bg-[#2b2e38] text-[#ded8cb] border border-[#3b3e4a] font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>在 Google 云端硬盘中查看</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Backups List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono-data tracking-wider uppercase text-[#c4beaf] flex items-center gap-1.5">
                    <FileJson className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>云端备份历史清单 ({backupFiles.length})</span>
                  </h4>
                  <span className="text-[11px] text-[#736e63]">
                    点击恢复将合并/更新至本地视窗
                  </span>
                </div>

                {backupFiles.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-[#131417] border border-[#202126] space-y-2">
                    <p className="text-xs text-[#8a8477]">云端文件夹中暂未发现历史备份文件</p>
                    <p className="text-[11px] text-[#635f56]">点击上方“立即备份到 Google Drive”生成第一份云端存档</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#202126] border border-[#202126] rounded-xl overflow-hidden bg-[#121316]">
                    {backupFiles.map((file) => {
                      const modifiedStr = file.modifiedTime 
                        ? new Date(file.modifiedTime).toLocaleString('zh-CN') 
                        : '未知日期';
                      const sizeKb = file.size 
                        ? `${(parseInt(file.size, 10) / 1024).toFixed(1)} KB` 
                        : '约 10 KB';

                      return (
                        <div 
                          key={file.id} 
                          className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#18191f] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[#e6c382] flex items-center justify-center shrink-0">
                              <FileJson className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-[#ede8de] truncate max-w-sm">
                                {file.name}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-[#7e786c] font-mono-data mt-0.5">
                                <span>{modifiedStr}</span>
                                <span>·</span>
                                <span>{sizeKb}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-xs text-[#8a8477] hover:text-[#ded8cb] hover:bg-white/5 rounded transition-colors"
                                title="在 Google Drive 查看"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => requestRestoreConfirmation(file)}
                              disabled={loading}
                              className="px-2.5 py-1 text-xs bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-300 rounded flex items-center gap-1 transition-colors"
                              title="从该备份恢复"
                            >
                              <DownloadCloud className="w-3 h-3" />
                              <span>恢复</span>
                            </button>
                            <button
                              onClick={() => requestDeleteConfirmation(file)}
                              disabled={loading}
                              className="p-1 text-xs text-[#8a8477] hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                              title="删除此备份文件"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#24252a] bg-[#101114] flex items-center justify-between text-xs text-[#7e786c] font-serif-sc">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Google Drive API v3 · 支持增量备份与多终端恢复</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1f2026] hover:bg-[#282a32] text-[#ded8cb] rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>

      {/* Strict Mandatory User Confirmation Dialog for Destructive Operations */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#18191f] border border-[#3b3d47] rounded-xl p-6 space-y-4 shadow-2xl font-serif-sc animate-fade-in">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                confirmDialog.isDangerous ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-blue-500/10 text-blue-400'
              }`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#ede8de]">{confirmDialog.title}</h4>
                <p className="text-xs text-[#8a8477]">操作需要用户明确确认</p>
              </div>
            </div>

            <p className="text-xs text-[#b8b2a5] leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-xs text-[#8a8477] hover:text-[#ded8cb] hover:bg-white/5 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  confirmDialog.isDangerous
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                    : 'bg-[#e6c382] hover:bg-[#edd29b] text-[#141416]'
                }`}
              >
                {confirmDialog.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

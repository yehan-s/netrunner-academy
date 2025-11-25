import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Shield, AlertCircle, CheckCircle, Smartphone, Monitor } from 'lucide-react';

export interface SSLCertDialogProps {
  onClose: () => void;
}

type Platform = 'macos' | 'windows' | 'ios' | 'android';

export const SSLCertDialog: React.FC<SSLCertDialogProps> = ({ onClose }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('macos');

  const handleDownloadCert = () => {
    // 模拟证书下载
    const certContent = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRKqzMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkNOMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjMwMTAxMDAwMDAwWhcNMjQwMTAxMDAwMDAwWjBF
... (Reqable Root CA Certificate)
-----END CERTIFICATE-----`;

    const blob = new Blob([certContent], { type: 'application/x-x509-ca-cert' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Reqable-Root-CA.crt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderMacOSSteps = () => (
    <div className="space-y-4">
      <div className="bg-[#252526] border border-[#333] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-[#4ec9b0] mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[#4ec9b0] mb-1">为什么需要安装证书？</h4>
            <p className="text-xs text-gray-400">
              HTTPS 流量经过加密，抓包工具需要你的设备信任它的证书才能解密流量（合法的中间人）。
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">1</div>
          <div className="flex-1">
            <h5 className="text-sm font-bold text-white mb-1">导出 Reqable 证书</h5>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>菜单栏 → <code className="bg-[#1e1e1e] px-1 rounded">Reqable</code> → <code className="bg-[#1e1e1e] px-1 rounded">证书管理</code></li>
              <li>点击 <code className="bg-[#1e1e1e] px-1 rounded">"导出根证书"</code></li>
              <li>保存文件：<code className="bg-[#1e1e1e] px-1 rounded text-[#4ec9b0]">Reqable-Root-CA.crt</code></li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">2</div>
          <div className="flex-1">
            <h5 className="text-sm font-bold text-white mb-1">安装到系统钥匙串</h5>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>双击 <code className="bg-[#1e1e1e] px-1 rounded">Reqable-Root-CA.crt</code> 文件</li>
              <li>选择 <strong className="text-white">"系统"</strong> 钥匙串（而非"登录"）</li>
              <li>输入 macOS 管理员密码</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">3</div>
          <div className="flex-1">
            <h5 className="text-sm font-bold text-white mb-1">信任证书 ⚠️ 关键步骤</h5>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>打开 <code className="bg-[#1e1e1e] px-1 rounded">"钥匙串访问"</code> 应用</li>
              <li>左侧选择 <code className="bg-[#1e1e1e] px-1 rounded">"系统"</code> → <code className="bg-[#1e1e1e] px-1 rounded">"证书"</code></li>
              <li>找到 <code className="bg-[#1e1e1e] px-1 rounded text-[#4ec9b0]">"Reqable Root CA"</code></li>
              <li>双击 → 展开 "信任" → 改为 <strong className="text-[#4ec9b0]">"始终信任"</strong></li>
            </ul>
            <div className="mt-2 flex items-center gap-2 text-xs text-[#4ec9b0]">
              <CheckCircle size={14} />
              <span>验证：证书图标应显示为蓝色"+"号</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWindowsSteps = () => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">1</div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">安装证书</h5>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li>双击 <code className="bg-[#1e1e1e] px-1 rounded">Reqable-Root-CA.crt</code></li>
            <li>点击 <code className="bg-[#1e1e1e] px-1 rounded">"安装证书"</code></li>
            <li>存储位置选择 <strong className="text-white">"本地计算机"</strong> (需要管理员权限)</li>
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">2</div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">选择证书存储</h5>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li>选择 <code className="bg-[#1e1e1e] px-1 rounded">"将所有的证书都放入下列存储"</code></li>
            <li>点击 <code className="bg-[#1e1e1e] px-1 rounded">"浏览"</code> → 选择 <strong className="text-[#4ec9b0]">"受信任的根证书颁发机构"</strong></li>
            <li>点击 <code className="bg-[#1e1e1e] px-1 rounded">"完成"</code></li>
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">3</div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">验证安装</h5>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li>按 <code className="bg-[#1e1e1e] px-1 rounded">Win + R</code> → 输入 <code className="bg-[#1e1e1e] px-1 rounded">certmgr.msc</code></li>
            <li>展开 <code className="bg-[#1e1e1e] px-1 rounded">"受信任的根证书颁发机构"</code> → <code className="bg-[#1e1e1e] px-1 rounded">"证书"</code></li>
            <li>找到 <code className="bg-[#1e1e1e] px-1 rounded text-[#4ec9b0]">"Reqable Root CA"</code></li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderiOSSteps = () => (
    <div className="space-y-3">
      <div className="bg-[#3a1d1d] border border-[#f48771]/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-[#f48771] mt-0.5" />
          <p className="text-xs text-gray-300">
            iOS 设备和电脑必须在 <strong className="text-white">同一 Wi-Fi 网络</strong>
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">1</div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">配置 Wi-Fi 代理</h5>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li><code className="bg-[#1e1e1e] px-1 rounded">设置</code> → <code className="bg-[#1e1e1e] px-1 rounded">无线局域网</code></li>
            <li>点击已连接 Wi-Fi 旁的 <code className="bg-[#1e1e1e] px-1 rounded">ⓘ</code> 图标</li>
            <li>滚动到底部 → <code className="bg-[#1e1e1e] px-1 rounded">配置代理</code> → <code className="bg-[#1e1e1e] px-1 rounded">手动</code></li>
            <li>服务器: <code className="bg-[#1e1e1e] px-1 rounded text-[#4ec9b0]">你的电脑IP</code> 端口: <code className="bg-[#1e1e1e] px-1 rounded text-[#4ec9b0]">8888</code></li>
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">2</div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">下载并安装证书</h5>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li>Safari 访问 <code className="bg-[#1e1e1e] px-1 rounded text-[#4ec9b0]">http://你的电脑IP:8888</code></li>
            <li>点击 <code className="bg-[#1e1e1e] px-1 rounded">"下载证书"</code> → 允许下载</li>
            <li><code className="bg-[#1e1e1e] px-1 rounded">设置</code> → <code className="bg-[#1e1e1e] px-1 rounded">已下载描述文件</code> → 安装（会有3次确认）</li>
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">3</div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">启用完全信任 (iOS 10.3+)</h5>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li><code className="bg-[#1e1e1e] px-1 rounded">设置</code> → <code className="bg-[#1e1e1e] px-1 rounded">通用</code> → <code className="bg-[#1e1e1e] px-1 rounded">关于本机</code></li>
            <li>滚动到底部 → <code className="bg-[#1e1e1e] px-1 rounded text-[#4ec9b0]">证书信任设置</code></li>
            <li>找到 <code className="bg-[#1e1e1e] px-1 rounded">"Reqable Root CA"</code> → 打开开关（变为绿色）</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderAndroidSteps = () => (
    <div className="space-y-3">
      <div className="bg-[#3a1d1d] border border-[#f48771]/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-[#f48771] mt-0.5" />
          <p className="text-xs text-gray-300">
            Android 11+ 默认不信任用户证书，需要 Root 或 ADB（仅测试设备）
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">1</div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">配置 Wi-Fi 代理</h5>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li><code className="bg-[#1e1e1e] px-1 rounded">设置</code> → <code className="bg-[#1e1e1e] px-1 rounded">WLAN</code> → 长按已连接的 Wi-Fi</li>
            <li>选择 <code className="bg-[#1e1e1e] px-1 rounded">"修改网络"</code> → 勾选 <code className="bg-[#1e1e1e] px-1 rounded">"显示高级选项"</code></li>
            <li>代理改为 <code className="bg-[#1e1e1e] px-1 rounded">"手动"</code> → 填写 IP 和端口 <code className="bg-[#1e1e1e] px-1 rounded text-[#4ec9b0]">8888</code></li>
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">2</div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">安装证书 (Android 7-10)</h5>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li>浏览器访问 <code className="bg-[#1e1e1e] px-1 rounded text-[#4ec9b0]">http://你的电脑IP:8888</code></li>
            <li>下载证书 <code className="bg-[#1e1e1e] px-1 rounded">Reqable-Root-CA.crt</code></li>
            <li><code className="bg-[#1e1e1e] px-1 rounded">设置</code> → <code className="bg-[#1e1e1e] px-1 rounded">安全</code> → <code className="bg-[#1e1e1e] px-1 rounded">"从存储设备安装"</code></li>
            <li>凭据用途选择 <code className="bg-[#1e1e1e] px-1 rounded text-[#4ec9b0]">"VPN 和应用"</code></li>
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#4ec9b0] text-black flex items-center justify-center text-xs font-bold shrink-0">3</div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">Android 11+ 解决方案</h5>
          <p className="text-xs text-gray-400 mb-2">修改应用的 <code className="bg-[#1e1e1e] px-1 rounded">network_security_config.xml</code>：</p>
          <pre className="bg-[#1e1e1e] border border-[#333] rounded p-2 text-[10px] text-gray-300 overflow-x-auto">
{`<network-security-config>
  <base-config>
    <trust-anchors>
      <certificates src="system" />
      <certificates src="user" />
    </trust-anchors>
  </base-config>
</network-security-config>`}
          </pre>
        </div>
      </div>
    </div>
  );

  const renderPlatformContent = () => {
    switch (selectedPlatform) {
      case 'macos': return renderMacOSSteps();
      case 'windows': return renderWindowsSteps();
      case 'ios': return renderiOSSteps();
      case 'android': return renderAndroidSteps();
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
          <div className="flex items-center gap-3">
            <Shield size={24} className="text-[#4ec9b0]" />
            <div>
              <h3 className="text-lg font-bold text-white">SSL 证书管理</h3>
              <p className="text-xs text-gray-400">配置 HTTPS 抓包所需证书</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-[#333]">
          {[
            { id: 'macos' as Platform, label: 'macOS', icon: Monitor },
            { id: 'windows' as Platform, label: 'Windows', icon: Monitor },
            { id: 'ios' as Platform, label: 'iOS', icon: Smartphone },
            { id: 'android' as Platform, label: 'Android', icon: Smartphone }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedPlatform(id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
                selectedPlatform === id
                  ? 'text-[#4ec9b0] border-[#4ec9b0] font-bold'
                  : 'text-gray-400 border-transparent hover:text-gray-200'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderPlatformContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#333] bg-[#252526]">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <AlertCircle size={14} className="text-[#4ec9b0]" />
            <span>抓包完成后请及时移除证书</span>
          </div>
          <button
            onClick={handleDownloadCert}
            className="flex items-center gap-2 px-4 py-2 bg-[#4ec9b0] text-black text-sm font-bold rounded hover:bg-[#3db89f] transition-colors"
          >
            <Download size={16} />
            下载证书
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

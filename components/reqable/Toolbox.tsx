import React, { useState, useMemo } from 'react';
import { 
  Wrench, Code, Hash, Clock, FileJson, FileText, QrCode,
  ArrowRight, Copy, Check, RefreshCw, ChevronLeft
} from 'lucide-react';

// 工具类型定义
interface Tool {
  id: string;
  name: string;
  icon: React.ElementType;
  category: 'encode' | 'hash' | 'format' | 'convert';
}

const TOOLS: Tool[] = [
  { id: 'base64', name: 'Base64', icon: Code, category: 'encode' },
  { id: 'url', name: 'URL Encode', icon: Code, category: 'encode' },
  { id: 'html', name: 'HTML Entities', icon: Code, category: 'encode' },
  { id: 'md5', name: 'MD5', icon: Hash, category: 'hash' },
  { id: 'sha1', name: 'SHA-1', icon: Hash, category: 'hash' },
  { id: 'sha256', name: 'SHA-256', icon: Hash, category: 'hash' },
  { id: 'json', name: 'JSON Format', icon: FileJson, category: 'format' },
  { id: 'timestamp', name: 'Timestamp', icon: Clock, category: 'convert' },
];

// Base64 编解码
const base64Encode = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch { return 'Error: Invalid input'; }
};

const base64Decode = (str: string): string => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch { return 'Error: Invalid Base64'; }
};

// URL 编解码
const urlEncode = (str: string): string => {
  try { return encodeURIComponent(str); }
  catch { return 'Error: Invalid input'; }
};

const urlDecode = (str: string): string => {
  try { return decodeURIComponent(str); }
  catch { return 'Error: Invalid URL encoding'; }
};

// HTML Entities
const htmlEncode = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const htmlDecode = (str: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

// 简单 MD5 实现 (仅用于演示)
const md5 = (str: string): string => {
  // 简化版 MD5，实际项目应使用 crypto-js
  const rotateLeft = (x: number, n: number) => (x << n) | (x >>> (32 - n));
  
  const addUnsigned = (x: number, y: number) => {
    const x8 = x & 0x80000000;
    const y8 = y & 0x80000000;
    const x4 = x & 0x40000000;
    const y4 = y & 0x40000000;
    const result = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);
    if (x4 & y4) return result ^ 0x80000000 ^ x8 ^ y8;
    if (x4 | y4) {
      if (result & 0x40000000) return result ^ 0xC0000000 ^ x8 ^ y8;
      return result ^ 0x40000000 ^ x8 ^ y8;
    }
    return result ^ x8 ^ y8;
  };

  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  const I = (x: number, y: number, z: number) => y ^ (x | ~z);

  const FF = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  const GG = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  const HH = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  const II = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  const convertToWordArray = (str: string) => {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWordsTemp1 = lMessageLength + 8;
    const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
    const lWordArray = new Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  };

  const wordToHex = (lValue: number) => {
    let WordToHexValue = '', WordToHexValueTemp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValueTemp = '0' + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
    }
    return WordToHexValue;
  };

  const x = convertToWordArray(str);
  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
};

// SHA-1 实现
const sha1 = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// SHA-256 实现
const sha256 = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// JSON 格式化
const formatJson = (str: string): string => {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2);
  } catch { return 'Error: Invalid JSON'; }
};

const minifyJson = (str: string): string => {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj);
  } catch { return 'Error: Invalid JSON'; }
};

// 时间戳工具
const timestampToDate = (ts: string): string => {
  try {
    const num = parseInt(ts, 10);
    if (isNaN(num)) return 'Error: Invalid timestamp';
    // 自动判断秒/毫秒
    const date = num > 9999999999 ? new Date(num) : new Date(num * 1000);
    return date.toISOString().replace('T', ' ').replace('Z', ' UTC');
  } catch { return 'Error: Invalid timestamp'; }
};

const dateToTimestamp = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Error: Invalid date';
    return `Seconds: ${Math.floor(date.getTime() / 1000)}\nMilliseconds: ${date.getTime()}`;
  } catch { return 'Error: Invalid date'; }
};

// 复制按钮组件
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-[#37373d] rounded text-gray-500 hover:text-gray-300"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-[#4ec9b0]" /> : <Copy size={14} />}
    </button>
  );
};

// 各工具组件
const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  
  const handleConvert = () => {
    setOutput(mode === 'encode' ? base64Encode(input) : base64Decode(input));
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setMode('encode')}
          className={`px-3 py-1 text-xs rounded ${mode === 'encode' ? 'bg-[#4ec9b0] text-black' : 'bg-[#333] text-gray-400'}`}
        >Encode</button>
        <button
          onClick={() => setMode('decode')}
          className={`px-3 py-1 text-xs rounded ${mode === 'decode' ? 'bg-[#4ec9b0] text-black' : 'bg-[#333] text-gray-400'}`}
        >Decode</button>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex-1 flex flex-col">
          <label className="text-[10px] text-gray-500 mb-1">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-xs text-gray-300 font-mono resize-none outline-none focus:border-[#4ec9b0]"
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
          />
        </div>
        <button
          onClick={handleConvert}
          className="py-2 bg-[#4ec9b0] text-black text-xs font-medium rounded hover:bg-[#3db89f] flex items-center justify-center gap-2"
        >
          <ArrowRight size={14} /> Convert
        </button>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-gray-500">Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-xs text-gray-300 font-mono resize-none outline-none"
            placeholder="Result will appear here..."
          />
        </div>
      </div>
    </div>
  );
};

const UrlTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  
  const handleConvert = () => {
    setOutput(mode === 'encode' ? urlEncode(input) : urlDecode(input));
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setMode('encode')}
          className={`px-3 py-1 text-xs rounded ${mode === 'encode' ? 'bg-[#4ec9b0] text-black' : 'bg-[#333] text-gray-400'}`}
        >Encode</button>
        <button
          onClick={() => setMode('decode')}
          className={`px-3 py-1 text-xs rounded ${mode === 'decode' ? 'bg-[#4ec9b0] text-black' : 'bg-[#333] text-gray-400'}`}
        >Decode</button>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex-1 flex flex-col">
          <label className="text-[10px] text-gray-500 mb-1">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-xs text-gray-300 font-mono resize-none outline-none focus:border-[#4ec9b0]"
            placeholder={mode === 'encode' ? 'Enter URL to encode...' : 'Enter encoded URL to decode...'}
          />
        </div>
        <button
          onClick={handleConvert}
          className="py-2 bg-[#4ec9b0] text-black text-xs font-medium rounded hover:bg-[#3db89f] flex items-center justify-center gap-2"
        >
          <ArrowRight size={14} /> Convert
        </button>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-gray-500">Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-xs text-gray-300 font-mono resize-none outline-none"
          />
        </div>
      </div>
    </div>
  );
};

const HtmlTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  
  const handleConvert = () => {
    setOutput(mode === 'encode' ? htmlEncode(input) : htmlDecode(input));
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setMode('encode')}
          className={`px-3 py-1 text-xs rounded ${mode === 'encode' ? 'bg-[#4ec9b0] text-black' : 'bg-[#333] text-gray-400'}`}
        >Encode</button>
        <button
          onClick={() => setMode('decode')}
          className={`px-3 py-1 text-xs rounded ${mode === 'decode' ? 'bg-[#4ec9b0] text-black' : 'bg-[#333] text-gray-400'}`}
        >Decode</button>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex-1 flex flex-col">
          <label className="text-[10px] text-gray-500 mb-1">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-xs text-gray-300 font-mono resize-none outline-none focus:border-[#4ec9b0]"
            placeholder={mode === 'encode' ? 'Enter HTML to encode...' : 'Enter HTML entities to decode...'}
          />
        </div>
        <button
          onClick={handleConvert}
          className="py-2 bg-[#4ec9b0] text-black text-xs font-medium rounded hover:bg-[#3db89f] flex items-center justify-center gap-2"
        >
          <ArrowRight size={14} /> Convert
        </button>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-gray-500">Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-xs text-gray-300 font-mono resize-none outline-none"
          />
        </div>
      </div>
    </div>
  );
};

const HashTool: React.FC<{ algorithm: 'md5' | 'sha1' | 'sha256' }> = ({ algorithm }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  
  const handleHash = async () => {
    if (!input) { setOutput(''); return; }
    switch (algorithm) {
      case 'md5': setOutput(md5(input)); break;
      case 'sha1': setOutput(await sha1(input)); break;
      case 'sha256': setOutput(await sha256(input)); break;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex-1 flex flex-col">
          <label className="text-[10px] text-gray-500 mb-1">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-xs text-gray-300 font-mono resize-none outline-none focus:border-[#4ec9b0]"
            placeholder="Enter text to hash..."
          />
        </div>
        <button
          onClick={handleHash}
          className="py-2 bg-[#4ec9b0] text-black text-xs font-medium rounded hover:bg-[#3db89f] flex items-center justify-center gap-2"
        >
          <Hash size={14} /> Calculate {algorithm.toUpperCase()}
        </button>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-gray-500">Hash ({algorithm.toUpperCase()})</label>
            {output && <CopyButton text={output} />}
          </div>
          <input
            value={output}
            readOnly
            className="h-10 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 text-xs text-[#4ec9b0] font-mono outline-none"
            placeholder="Hash will appear here..."
          />
        </div>
      </div>
    </div>
  );
};

const JsonTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setOutput(formatJson(input))}
          className="px-3 py-1 text-xs rounded bg-[#4ec9b0] text-black hover:bg-[#3db89f]"
        >Format</button>
        <button
          onClick={() => setOutput(minifyJson(input))}
          className="px-3 py-1 text-xs rounded bg-[#333] text-gray-400 hover:bg-[#444]"
        >Minify</button>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex-1 flex flex-col">
          <label className="text-[10px] text-gray-500 mb-1">Input JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-xs text-gray-300 font-mono resize-none outline-none focus:border-[#4ec9b0]"
            placeholder='{"key": "value"}'
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-gray-500">Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-xs text-gray-300 font-mono resize-none outline-none"
          />
        </div>
      </div>
    </div>
  );
};

const TimestampTool: React.FC = () => {
  const [timestamp, setTimestamp] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [result, setResult] = useState('');
  const [currentTs, setCurrentTs] = useState(Math.floor(Date.now() / 1000));
  
  // 更新当前时间戳
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTs(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col h-full gap-4">
      {/* 当前时间戳 */}
      <div className="p-3 bg-[#252526] rounded border border-[#3c3c3c]">
        <div className="text-[10px] text-gray-500 mb-1">Current Timestamp</div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-mono text-[#4ec9b0]">{currentTs}</span>
          <CopyButton text={currentTs.toString()} />
        </div>
        <div className="text-[10px] text-gray-500 mt-1">
          {new Date(currentTs * 1000).toLocaleString()}
        </div>
      </div>
      
      {/* 时间戳转日期 */}
      <div className="flex-1">
        <label className="text-[10px] text-gray-500 mb-1 block">Timestamp → Date</label>
        <div className="flex gap-2 mb-2">
          <input
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="Enter timestamp..."
            className="flex-1 h-8 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 text-xs text-gray-300 font-mono outline-none focus:border-[#4ec9b0]"
          />
          <button
            onClick={() => setResult(timestampToDate(timestamp))}
            className="px-3 h-8 bg-[#4ec9b0] text-black text-xs rounded hover:bg-[#3db89f]"
          >Convert</button>
        </div>
        
        <label className="text-[10px] text-gray-500 mb-1 block mt-4">Date → Timestamp</label>
        <div className="flex gap-2 mb-2">
          <input
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            placeholder="2024-01-01 or ISO format..."
            className="flex-1 h-8 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 text-xs text-gray-300 font-mono outline-none focus:border-[#4ec9b0]"
          />
          <button
            onClick={() => setResult(dateToTimestamp(dateStr))}
            className="px-3 h-8 bg-[#4ec9b0] text-black text-xs rounded hover:bg-[#3db89f]"
          >Convert</button>
        </div>
        
        {result && (
          <div className="mt-4 p-3 bg-[#1e1e1e] border border-[#3c3c3c] rounded">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-gray-500">Result</label>
              <CopyButton text={result} />
            </div>
            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

// 主组件
export const Toolbox: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  const categories = [
    { id: 'encode', name: 'Encode/Decode', tools: TOOLS.filter(t => t.category === 'encode') },
    { id: 'hash', name: 'Hash', tools: TOOLS.filter(t => t.category === 'hash') },
    { id: 'format', name: 'Format', tools: TOOLS.filter(t => t.category === 'format') },
    { id: 'convert', name: 'Convert', tools: TOOLS.filter(t => t.category === 'convert') },
  ];
  
  const renderTool = () => {
    switch (selectedTool) {
      case 'base64': return <Base64Tool />;
      case 'url': return <UrlTool />;
      case 'html': return <HtmlTool />;
      case 'md5': return <HashTool algorithm="md5" />;
      case 'sha1': return <HashTool algorithm="sha1" />;
      case 'sha256': return <HashTool algorithm="sha256" />;
      case 'json': return <JsonTool />;
      case 'timestamp': return <TimestampTool />;
      default: return null;
    }
  };
  
  const selectedToolInfo = TOOLS.find(t => t.id === selectedTool);
  
  return (
    <div className="flex flex-col h-full" data-testid="toolbox">
      {/* Header */}
      <div className="h-9 flex items-center px-3 border-b border-[#3c3c3c] shrink-0">
        {selectedTool ? (
          <>
            <button
              onClick={() => setSelectedTool(null)}
              className="p-1 hover:bg-[#37373d] rounded text-gray-500 hover:text-gray-300 mr-2"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[11px] font-bold text-gray-300">{selectedToolInfo?.name}</span>
          </>
        ) : (
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Toolbox</span>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {selectedTool ? (
          renderTool()
        ) : (
          <div className="space-y-4">
            {categories.map(cat => (
              <div key={cat.id}>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{cat.name}</div>
                <div className="grid grid-cols-2 gap-2">
                  {cat.tools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className="flex items-center gap-2 p-3 bg-[#252526] hover:bg-[#37373d] rounded border border-[#3c3c3c] text-left transition-colors"
                      data-testid={`tool-${tool.id}`}
                    >
                      <tool.icon size={16} className="text-[#4ec9b0]" />
                      <span className="text-xs text-gray-300">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

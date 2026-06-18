import { useState, useCallback, useRef, useEffect } from "react"
import { Copy, Coffee, Scissors, Quote, Type, Check } from "lucide-react"
import { platforms, formatByPlatform, countStats, cleanText, toChinesePunctuation, toEnglishPunctuation } from "./utils/formatters"

export default function App() {
  const [text, setText] = useState("")
  const [activePlatform, setActivePlatform] = useState("xiaohongshu")
  const [copied, setCopied] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [toast, setToast] = useState(null)
  const textareaRef = useRef(null)

  const formatted = text ? formatByPlatform(text, activePlatform) : ""
  const stats = countStats(text)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  const handleClean = useCallback(() => {
    setText(cleanText(text))
    showToast("格式已清理")
  }, [text, showToast])

  const handleToChinese = useCallback(() => {
    setText(toChinesePunctuation(text))
    showToast("已转为中文标点")
  }, [text, showToast])

  const handleToEnglish = useCallback(() => {
    setText(toEnglishPunctuation(text))
    showToast("已转为英文标点")
  }, [text, showToast])

  const handleCopy = useCallback(async () => {
    if (!formatted) return
    try {
      await navigator.clipboard.writeText(formatted)
      setCopied(true)
      showToast("已复制到剪贴板")
      setTimeout(() => setCopied(false), 1500)
    } catch {
      showToast("复制失败，请手动选择文本")
    }
  }, [formatted, showToast])

  // Keyboard shortcut: Ctrl+Enter to copy
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleCopy()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [handleCopy])

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-icon">🎵</span>
          <span className="logo-text">文悦</span>
          <span className="logo-sub">文案排版工具</span>
        </div>
        <button className="support-btn" onClick={() => setShowPayModal(true)}>
          <Coffee size={16} />
          请作者喝咖啡
        </button>
      </header>

      <div className="main-grid">
        {/* Left panel: Editor */}
        <div className="panel">
          <div className="panel-header">
            <span>输入文案</span>
            <span style={{fontWeight: 400, fontSize: 12}}>支持粘贴富文本自动去格式</span>
          </div>
          <div className="editor-area">
            <textarea
              ref={textareaRef}
              className="editor-textarea"
              placeholder="在此粘贴或输入文案..."

              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="toolbar">
              <button className="toolbar-btn" onClick={handleClean} title="清理多余空格和空行">
                <Scissors size={14} /> 清理格式
              </button>
              <button className="toolbar-btn" onClick={handleToChinese} title="转为中文标点符号">
                <Quote size={14} /> 中文标点
              </button>
              <button className="toolbar-btn" onClick={handleToEnglish} title="转为英文标点符号">
                <Type size={14} /> 英文标点
              </button>
            </div>
          </div>
        </div>

        {/* Right panel: Preview */}
        <div className="panel">
          <div className="platform-tabs">
            {platforms.map((p) => (
              <button
                key={p.id}
                className={`platform-tab${activePlatform === p.id ? " active" : ""}`}
                onClick={() => setActivePlatform(p.id)}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
          <div className="preview-area">
            {formatted ? (
              <div className="preview-content">{formatted}</div>
            ) : (
              <div className="preview-placeholder">
                输入文案后，选择平台查看排版效果
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        <span className="stat-item">字数 <span className="stat-value">{stats.chars}</span></span>
        <span className="stat-item">词数 <span className="stat-value">{stats.words}</span></span>
        <span className="stat-item">段落 <span className="stat-value">{stats.paragraphs}</span></span>
        <span className="stat-item">阅读约 <span className="stat-value">{stats.readingTime}</span> 分钟</span>
        <button
          className={`copy-btn${copied ? " copied" : ""}`}
          onClick={handleCopy}
          disabled={!formatted}
          title="Ctrl + Enter 快捷复制"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "已复制" : "一键复制"}
        </button>
      </div>

      {/* Pay modal */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>☕ 请作者喝咖啡</h3>
            <p>如果这个工具帮到了你，欢迎请我一杯咖啡～</p>
            <div className="qr-placeholder">
              请上传你的<br />支付宝收款码图片
              <br /><br />
              <span style={{fontSize: 11}}>
                (传到项目 public/ 目录下)
              </span>
            </div>
            <p style={{fontSize: 13, color: "#adb5bd"}}>
              推荐赞助金额：¥5 · ¥10 · ¥20
            </p>
            <button className="modal-close" onClick={() => setShowPayModal(false)}>
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

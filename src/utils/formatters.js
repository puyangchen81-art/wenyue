// Clean text: normalize whitespace, unified punctuation
export function cleanText(text) {
  if (!text) return ""
  // Collapse multiple spaces into one
  let t = text.replace(/[ ]{2,}/g, " ")
  // Remove leading/trailing whitespace per line
  t = t.split("\n").map(l => l.trim()).join("\n")
  // Collapse multiple consecutive blank lines into one
  t = t.replace(/\n{3,}/g, "\n\n")
  // Trim overall
  return t.trim()
}

// Convert English punctuation to Chinese
export function toChinesePunctuation(text) {
  if (!text) return ""
  return text
    .replace(/,/g, "，")
    .replace(/\.(?=[^0-9])/g, "。")
    .replace(/\?/g, "？")
    .replace(/!/g, "！")
    .replace(/:/g, "：")
    .replace(/;/g, "；")
    .replace(/\(/g, "（")
    .replace(/\)/g, "）")
}

// Convert to English punctuation
export function toEnglishPunctuation(text) {
  if (!text) return ""
  return text
    .replace(/，/g, ",")
    .replace(/。/g, ".")
    .replace(/？/g, "?")
    .replace(/！/g, "!")
    .replace(/：/g, ":")
    .replace(/；/g, ";")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
}

// Split into short paragraphs (for Xiaohongshu / Douyin)
function splitShortParagraphs(text, maxLen = 50) {
  const paragraphs = text.split("\n").filter(p => p.trim().length > 0)
  const result = []
  for (const p of paragraphs) {
    if (p.length <= maxLen) {
      result.push(p.trim())
    } else {
      // Split by sentence endings
      const sentences = p.split(/(?<=[。！？.!?])/g).filter(s => s.trim().length > 0)
      let current = ""
      for (const s of sentences) {
        if ((current + s).length <= maxLen) {
          current += s
        } else {
          if (current) result.push(current.trim())
          current = s
        }
      }
      if (current) result.push(current.trim())
    }
  }
  return result
}

// Zhihu format: well-structured, keep detail
function formatZhihu(text) {
  let t = cleanText(text)
  // Ensure blank lines between paragraphs for readability
  t = t.replace(/\n/g, "\n\n")
  return t
}

// WeChat format: clean, standard paragraphs
function formatWechat(text) {
  let t = cleanText(text)
  // Standard paragraph break: single newline between paragraphs
  t = t.replace(/\n{2,}/g, "\n\n")
  return t
}

// Xiaohongshu format: short paragraphs, emoji-friendly
function formatXiaohongshu(text) {
  let t = cleanText(text)
  const shortParagraphs = splitShortParagraphs(t, 50)
  // Add emoji dividers between sections
  return shortParagraphs.map((p, i) => {
    const emojis = ["✨", "🌟", "💫", "⭐", "🔥", "💡", "📌", "🎯"]
    return i > 0 ? `${emojis[i % emojis.length]}\n${p}` : p
  }).join("\n\n")
}

// Douyin format: very short, punchy
function formatDouyin(text) {
  let t = cleanText(text)
  const shortParagraphs = splitShortParagraphs(t, 30)
  return shortParagraphs.map(p => p).join("\n\n")
}

export function formatByPlatform(text, platform) {
  switch (platform) {
    case "xiaohongshu":
      return formatXiaohongshu(text)
    case "wechat":
      return formatWechat(text)
    case "douyin":
      return formatDouyin(text)
    case "zhihu":
      return formatZhihu(text)
    default:
      return cleanText(text)
  }
}

export function countStats(text) {
  if (!text) return { chars: 0, words: 0, paragraphs: 0, readingTime: 0 }
  const chars = text.replace(/\s/g, "").length
  // Chinese words: count Chinese characters + English word tokens
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const englishWords = text.replace(/[\u4e00-\u9fff]/g, " ").split(/\s+/).filter(w => w.length > 0).length
  const words = chineseChars + englishWords
  const paragraphs = text.split("\n").filter(p => p.trim().length > 0).length
  // Reading time: ~500 chars/min for Chinese
  const readingTime = Math.max(1, Math.ceil(chars / 500))
  return { chars, words, paragraphs, readingTime }
}

export const platforms = [
  { id: "xiaohongshu", name: "小红书", icon: "📕" },
  { id: "wechat", name: "公众号", icon: "💬" },
  { id: "douyin", name: "抖音", icon: "🎵" },
  { id: "zhihu", name: "知乎", icon: "📋" },
]

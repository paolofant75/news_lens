import { NextRequest, NextResponse } from 'next/server'

// Modelli TTS Gemini in ordine di preferenza. Se il primo restituisce 404
// (modello non disponibile / deprecato) prova i successivi prima di fallire.
// Aggiornare quando Google rilascia nuovi modelli TTS.
const TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
] as const
const SAMPLE_RATE = 24000

function pcm16ToWav(pcmBase64: string): Buffer {
  const pcm = Buffer.from(pcmBase64, 'base64')
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = (SAMPLE_RATE * numChannels * bitsPerSample) / 8
  const blockAlign = (numChannels * bitsPerSample) / 8
  const dataSize = pcm.length
  const wav = Buffer.alloc(44 + dataSize)

  wav.write('RIFF', 0)
  wav.writeUInt32LE(36 + dataSize, 4)
  wav.write('WAVE', 8)
  wav.write('fmt ', 12)
  wav.writeUInt32LE(16, 16)
  wav.writeUInt16LE(1, 20)
  wav.writeUInt16LE(numChannels, 22)
  wav.writeUInt32LE(SAMPLE_RATE, 24)
  wav.writeUInt32LE(byteRate, 28)
  wav.writeUInt16LE(blockAlign, 32)
  wav.writeUInt16LE(bitsPerSample, 34)
  wav.write('data', 36)
  wav.writeUInt32LE(dataSize, 40)
  pcm.copy(wav, 44)

  return wav
}

// Gemini TTS NON supporta systemInstruction: lo stile va embeddato nella stessa
// "content text" come prefisso. Formato consigliato: "Read with <style>: <text>"
const STYLE_PREFIX: Record<string, string> = {
  it: 'Leggi con tono caldo, naturale e professionale, come una conduttrice esperta del telegiornale italiano: ',
  en: 'Read with a warm, natural and professional tone, like an experienced female news anchor: ',
  fr: 'Lis avec un ton chaleureux, naturel et professionnel, comme une présentatrice de journal télévisé: ',
  de: 'Lies mit einem warmen, natürlichen und professionellen Ton, wie eine erfahrene Nachrichtensprecherin: ',
  es: 'Lee con un tono cálido, natural y profesional, como una periodista experimentada del telediario: ',
}

// Voci Gemini TTS testate (femminili, multilingua):
// Kore (default), Aoede, Charon, Fenrir, Leda, Orus, Puck, Zephyr, ...
// "Kore" e' la piu' supportata cross-region/model.
const LANG_VOICE: Record<string, string> = {
  it: 'Kore',
  en: 'Kore',
  fr: 'Kore',
  de: 'Kore',
  es: 'Kore',
  default: 'Kore',
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('[TTS] GEMINI_API_KEY not configured')
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }

  const { text, lang = 'it' } = await req.json() as { text: string; lang?: string }
  if (!text?.trim()) {
    console.warn('[TTS] Empty text received')
    return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  }

  const voiceName = LANG_VOICE[lang] ?? LANG_VOICE.default
  const stylePrefix = STYLE_PREFIX[lang] ?? STYLE_PREFIX.it
  const contentText = stylePrefix + text.slice(0, 3000)

  let lastErr = 'unknown error'
  let lastStatus = 500
  let audioData: string | undefined

  for (const model of TTS_MODELS) {
    console.log(`[TTS] try model=${model} lang=${lang} voice=${voiceName} text_len=${text.length}`)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: contentText }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } },
            },
          },
        }),
      }
    )

    if (res.ok) {
      const data = await res.json()
      audioData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
      if (audioData) {
        console.log(`[TTS] OK model=${model}`)
        break
      }
      console.error('[TTS] No audio data in response:', JSON.stringify(data).slice(0, 500))
      lastErr = 'No audio in response'
      lastStatus = 500
      continue
    }

    const err = await res.text()
    console.error(`[TTS] ${model} HTTP ${res.status}:`, err.slice(0, 300))
    lastErr = err
    lastStatus = res.status
    // 404 = modello inesistente, prova il prossimo
    // 500 = errore interno Google (transient), prova il prossimo modello
    // Altri (401/403/429/400) = fermati subito, non e' problema di modello
    if (res.status !== 404 && res.status !== 500) break
  }

  if (!audioData) {
    return NextResponse.json({ error: lastErr, status: lastStatus }, { status: lastStatus })
  }

  const wav = pcm16ToWav(audioData)
  return new NextResponse(new Uint8Array(wav), {
    headers: {
      'Content-Type': 'audio/wav',
      'Content-Length': String(wav.length),
      'Cache-Control': 'no-store',
    },
  })
}

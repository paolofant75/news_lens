import { NextRequest, NextResponse } from 'next/server'

// Verify the exact model ID in Google AI Studio if this name is incorrect
const MODEL = 'gemini-3.1-flash-preview-tts'
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

const SYSTEM_PROMPT: Record<string, string> = {
  it: 'Sei una giornalista di una TV nazionale italiana. Leggi il testo con tono caldo, accogliente e professionale, come una conduttrice esperta del telegiornale serale. Sii naturale, non meccanica.',
  en: 'You are a professional female news anchor on national television. Read with a warm, welcoming tone — natural and authoritative, like an experienced evening news broadcaster.',
  fr: 'Tu es une journaliste professionnelle d\'une chaîne de télévision nationale. Lis le texte avec un ton chaleureux, naturel et professionnel, comme une présentatrice expérimentée du journal télévisé.',
  de: 'Du bist eine professionelle Nachrichtensprecherin eines nationalen Fernsehsenders. Lies den Text mit einem warmen, natürlichen und professionellen Ton.',
  es: 'Eres una periodista profesional de una televisión nacional. Lee el texto con un tono cálido, acogedor y profesional, como una presentadora experimentada del telediario.',
}

// Female voices available in Gemini TTS — adjust if needed based on model
const LANG_VOICE: Record<string, string> = {
  it: 'Aoede',
  en: 'Aoede',
  fr: 'Aoede',
  de: 'Aoede',
  es: 'Aoede',
  default: 'Aoede',
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }

  const { text, lang = 'it' } = await req.json() as { text: string; lang?: string }
  if (!text?.trim()) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  }

  const voiceName = LANG_VOICE[lang] ?? LANG_VOICE.default
  const systemPrompt = SYSTEM_PROMPT[lang] ?? SYSTEM_PROMPT.it

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: text.slice(0, 3000) }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error('[TTS] Gemini error:', err)
    return NextResponse.json({ error: err }, { status: res.status })
  }

  const data = await res.json()
  const audioData: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

  if (!audioData) {
    console.error('[TTS] No audio data in response:', JSON.stringify(data).slice(0, 500))
    return NextResponse.json({ error: 'No audio in response' }, { status: 500 })
  }

  const wav = pcm16ToWav(audioData)
  return new NextResponse(wav, {
    headers: {
      'Content-Type': 'audio/wav',
      'Content-Length': String(wav.length),
      'Cache-Control': 'no-store',
    },
  })
}

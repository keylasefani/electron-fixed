'use client'
import { useEffect, useState, useRef } from 'react'
import BackButton from '../components/BackButton'
import { QUEUE_EVENT } from '../lib/queueEvents'

export default function DisplayPage(){
  const [current, setCurrent] = useState('-')
  const bellRef = useRef(null)

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text)
      msg.lang = 'id-ID'
      msg.pitch = 1
      msg.rate = 0.9

      const voices = window.speechSynthesis.getVoices()

      let chosen = voices.find(v => v.lang.toLowerCase().includes('id'))
      
      let femaleLike = voices.find(v =>
        ['female','woman','google','microsoft'].some(key =>
          v.name.toLowerCase().includes(key)
        ) && v.lang.toLowerCase().includes('id')
      )

      if (femaleLike) chosen = femaleLike

      if (chosen) msg.voice = chosen

      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(msg)
    }
  }

  const load = () => {
    const newNumber = localStorage.getItem('queue_current') || '-'

    if(newNumber !== current && newNumber !== '-') {
      if (bellRef.current) {
        bellRef.current.currentTime = 0
        bellRef.current.play()
      }

      setTimeout(() => {
        speak(`Nomor antrian ${newNumber}. Dipersilakan menuju loket`)
      }, 1200)
    }

    setCurrent(newNumber)
  }

  useEffect(() => {
    load()
    window.addEventListener('storage', load)
    window.addEventListener(QUEUE_EVENT, load)


    window.speechSynthesis.onvoiceschanged = () => {}

    return () => {
      window.removeEventListener('storage', load)
      window.removeEventListener(QUEUE_EVENT, load)
    }
  }, [])

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px', 
      borderRadius: '18px', 
      background: 'white', 
      maxWidth: '760px', 
      margin: '40px auto',
      paddingTop: '45px' 
    }}>
      <BackButton />
      <audio src="/sounds/dingdong.mp3" ref={bellRef}></audio>

      <h2 style={{ fontSize: '32px', margin: '0 0 6px 0', color: '#5b21b6' }}>Nomor Antrian</h2>
      <div style={{ fontSize: '56px', fontWeight: 800, color: '#2563eb' }}>{current}</div>
      <p style={{ color: '#6b7280', marginTop: 12 }}>Silakan menuju loket</p>
    </div>
  )
}

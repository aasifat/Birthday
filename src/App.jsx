import { useEffect, useRef, useState, Children, cloneElement, Fragment } from 'react'
import CONFIG from './config.js'
import './styles.css'

/* ---------- small building blocks ---------- */
function Words({ children, i }) {
  return Children.map(children, (c) =>
    typeof c === 'string'
      ? c.split(/\s+/).filter(Boolean).map((w, k) => (
          <Fragment key={k}>
            <span className="w"><span style={{ transitionDelay: `${i.n++ * 70}ms` }}>{w}</span></span>{' '}
          </Fragment>
        ))
      : cloneElement(c, {}, <Words i={i}>{c.props.children}</Words>)
  )
}
function Split({ as: T = 'h2', children, ...p }) {
  const i = { n: 0 }
  return <T {...p} data-split><Words i={i}>{children}</Words></T>
}
function Photo({ i, className = '' }) {
  const p = CONFIG.photos[i]
  return (
    <div className={`ph ${className}`}>
      {p.src
        ? <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
        : <div className="tag">Photo {i + 1} — replace in src/config.js</div>}
    </div>
  )
}
const Cap = ({ i, className = '' }) =>
  CONFIG.photos[i].caption ? <p className={`cap rv ${className}`}>{CONFIG.photos[i].caption}</p> : null

const bars = Array.from({ length: 34 }, (_, i) => 10 + Math.abs(Math.sin(i * 0.7) * 34 + Math.sin(i * 1.9) * 8))

export default function App() {
  const [go, setGo] = useState(false)
  const [open, setOpen] = useState(false)
  const [gone, setGone] = useState(false)
  const [s1, setS1] = useState(false)
  const [ret, setRet] = useState(false)
  const [songs, setSongs] = useState(false)
  const [letter, setLetter] = useState(false)
  const [sound, setSound] = useState(false)
  const audio = useRef(null)
  const flirt = useRef(null)
  const { name, date, colors: C } = CONFIG
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

  // theme colours from config
  useEffect(() => {
    const s = document.documentElement.style
    s.setProperty('--burg', C.burgundy); s.setProperty('--mid', C.midnight)
    s.setProperty('--ivory', C.ivory); s.setProperty('--rose', C.rose); s.setProperty('--champ', C.champagne)
    const id = requestAnimationFrame(() => setGo(true))
    if (CONFIG.audioSrc) { audio.current = new Audio(CONFIG.audioSrc); audio.current.loop = true; audio.current.volume = 0.5 }
    return () => cancelAnimationFrame(id)
  }, [])

  // scroll lock
  useEffect(() => { document.body.classList.toggle('lock', !open || letter) }, [open, letter])

  // reveal on view
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.2, rootMargin: '0px 0px -8% 0px' })
    document.querySelectorAll('main .chapter, main .rv, main [data-split], main .wipe.case').forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])

  // scroll-driven: photo lens + parallax, pinned flirty sequence
  useEffect(() => {
    let tick = false
    const frame = () => {
      tick = false
      const vh = innerHeight
      document.querySelectorAll('.ph').forEach(p => {
        const r = p.getBoundingClientRect()
        if (r.bottom < -50 || r.top > vh + 50) return
        const d = ((r.top + r.height / 2) - vh / 2) / vh
        p.style.setProperty('--d', reduce ? 0 : d.toFixed(3))
        if (p.classList.contains('full'))
          p.style.setProperty('--p', reduce ? 1 : Math.max(0, Math.min(1, 1.5 - Math.abs(d) * 2.2)).toFixed(3))
      })
      const fs = flirt.current
      if (!fs) return
      const lines = fs.querySelectorAll('.fl')
      const r = fs.getBoundingClientRect()
      const p = Math.max(0, Math.min(1, -r.top / (r.height - vh)))
      fs.style.setProperty('--fp', p)
      const i = Math.min(lines.length - 1, Math.floor(p * lines.length))
      if (r.top < vh && r.bottom > 0)
        lines.forEach((f, n) => { f.classList.toggle('on', n === i && p > 0.01); f.classList.toggle('past', n < i) })
    }
    const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(frame) } }
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', frame); frame()
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', frame) }
  }, [reduce])

  const closeLetter = () => {
    setLetter(false)
    setTimeout(() => document.getElementById('fin')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 500)
  }
  useEffect(() => {
    const k = e => { if (e.key === 'Escape' && letter) closeLetter() }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  })

  const openGate = () => {
    setOpen(true); setTimeout(() => setGone(true), 1600)
    audio.current?.play().then(() => setSound(true)).catch(() => {})
  }
  const toggleSound = () => {
    const a = audio.current; if (!a) return
    if (a.paused) a.play().then(() => setSound(true)).catch(() => {}); else { a.pause(); setSound(false) }
  }
  const IN = go ? 'in' : ''

  return (
    <>
      <div className="grain" aria-hidden="true" />

      {/* GATE */}
      <section id="gate" className={`${go ? 'go' : ''} ${open ? 'open' : ''}`} style={gone ? { display: 'none' } : undefined} aria-label="Opening">
        <span className="line" aria-hidden="true" />
        <div style={{ position: 'relative' }}>
          <p className={`k rv ${IN}`} style={{ transitionDelay: '.4s', marginBottom: '2rem' }}>For {name} · {date}</p>
          <Split as="h1" className={IN}>The world got a little more beautiful the day you arrived.</Split>
          <p className={`sub rv ${IN}`} style={{ transitionDelay: '2.4s' }}>And somehow, I got lucky enough to know you.</p>
          <button className="btn" onClick={openGate}>Open your little surprise</button>
        </div>
      </section>

      <main>
        {/* CH1 */}
        <section className="sec c1 chapter" aria-labelledby="t1">
          <div className="head">
            <p className="k rv">Chapter one — Look what you did to me</p>
            <Split id="t1" className="big">You were never supposed to become this important to me.</Split>
          </div>
          <figure className="ph1" style={{ margin: 0 }}><Photo i={0} /><Cap i={0} /></figure>
          <p className="txt rv">One day, you were just someone I talked to. And somehow, you became the person behind half my smiles, most of my distractions, and an unreasonable amount of my thoughts.</p>
          <p className="jest rv">Honestly, I’d like to file a complaint. You have occupied way too much space in my head without paying rent.</p>
        </section>

        {/* CH2 */}
        <section className="sec c2 chapter" aria-labelledby="t2">
          <div><p className="k rv">Chapter two</p><Split id="t2" className="mid">Your attitude. My problem.</Split></div>
          <Split as="h3" className="beat">Pretty face. <em>Strong opinions.</em> Terrifying temper.</Split>
          <p className="small rv">Sometimes I genuinely don’t know whether to make you laugh, apologize, or simply accept my fate.</p>
          <p className="small rv">But here’s the embarrassing part: even when you’re being impossible, you’re still my favorite person to annoy.</p>
          <div>
            <button className="secret" aria-expanded={s1} aria-controls="sec1r" onClick={() => setS1(true)}>psst… tap here if you’re a little angry right now</button>
            <div className={`reveal ${s1 ? 'show' : ''}`} id="sec1r"><div><p>Yes, madam. You win. Again. Are you happy now? 😂❤️</p></div></div>
          </div>
        </section>

        {/* CH3 */}
        <section className="sec c3 chapter" aria-labelledby="t3">
          <p className="k rv" id="t3">Chapter three — The Uttara incident</p>
          <p className="quote bn rv">উত্তরার মানুষ ছিনতাইকারী</p>
          <div className="wipe case bn"><p>না, সবাই ছিনতাইকারী না। কিছু কিছু ভালো মানুষও থাকে!</p></div>
          <div className="wipe case bn"><p>এখন তুমি আমাকে ছিনতাই করতে আসলে আমি কি আর বাধা দিতে পারব, বলো?</p></div>
          <button className="btn bn" aria-expanded={ret} onClick={() => setRet(true)}>আমাকে ছিনতাই করতে চান?</button>
          {ret && <img src={CONFIG.surpriseImage} alt="Surprise" style={{ width: 300, maxWidth: '80%', marginTop: 20 }} />}
        </section>

        {/* CH4 */}
        <section className="sec c4 chapter" aria-labelledby="t4">
          <div className="clock" aria-hidden="true">2:00</div>
          <div className="in-w">
            <p className="k rv">Chapter four — The little things that are so you</p>
            <Split id="t4" className="big" style={{ marginTop: '1.4rem' }}>It’s 2 AM. Guess who’s still awake?</Split>
            <p className="body rv">Some people count sheep to fall asleep. You apparently count reasons to stay awake. Sleep has been trying to reach you for hours, and you’ve left it on read. 😂</p>
            <p className="body soft rv">But honestly, I hope that even on your longest nights, you remember how loved you are.</p>
            <button className="wave rv" aria-expanded={songs} aria-controls="songs" aria-label="Open the songs" onClick={() => setSongs(s => !s)}>
              {bars.map((h, i) => <i key={i} style={{ '--h': h + 'px', '--n': i }} />)}
            </button>
            <div className={`songs ${songs ? 'show' : ''}`} id="songs"><div><ul>
              {CONFIG.music.map((m, i) => (
                <li key={i}>{m.url
                  ? <a href={m.url} target="_blank" rel="noopener noreferrer">{m.title}</a>
                  : <span style={{ opacity: 0.5 }}>{m.title} — add link in src/config.js</span>}</li>
              ))}
            </ul></div></div>
          </div>
          <div className="ice in-w">
            <Split className="mid">Your love story with ice cream needs its own documentary.</Split>
            <p className="bn rv">আমি শুধু চাই, আইসক্রিমের প্রেমে পড়ে নিজের দাঁতের যত্ন নেওয়ার কথা ভুলে যেও না, কারণ ওইটা আমি থাপ্পড় দিয়ে ফালায় দিতে পারি, ঠিক আছে? ❤️</p>
            <p className="bn rv">আর হ্যাঁ, তোমার টনসিলের জন্য শুভকামনা। আরও খাও আইসক্রিম।</p>
          </div>
        </section>

        {/* PHOTOS I */}
        <section className="c5" aria-label="Photographs">
          <div className="fullwrap"><Photo i={1} className="full" /><Cap i={1} className="fullcap" /></div>
          <div className="duo">
            <figure className="a" style={{ margin: 0 }}><Photo i={2} /><Cap i={2} /></figure>
            <figure className="b" style={{ margin: 0 }}><Photo i={3} /><Cap i={3} /></figure>
          </div>
        </section>

        {/* FLIRT */}
        <section className="flirt" ref={flirt} aria-label="Let’s be honest">
          <div className="stick">
            <p className="k" style={{ position: 'absolute', top: '10vh' }}>Let’s be honest…</p>
            <h2 className="fl">You are extremely distracting.</h2>
            <h2 className="fl">I had plans. Then you showed up.</h2>
            <h2 className="fl">You can’t just be this adorable and expect me to act normal.</h2>
            <h2 className="fl">Your attitude is expensive. Good thing my love is unlimited.</h2>
            <h2 className="fl">If annoying you was a profession, I’d be employee of the month.</h2>
            <div className="prog" aria-hidden="true"><b /></div>
          </div>
        </section>

        {/* PHOTOS II — warm full-screen */}
        <section className="c5b" aria-label="Photograph">
          <div className="fullwrap"><Photo i={4} className="full" /><Cap i={4} className="fullcap" /></div>
        </section>

        {/* HEART */}
        <section className="sec c6 chapter" aria-labelledby="t6">
          <Split id="t6" className="big">Jokes aside, there’s something I really want you to know.</Split>
          <div className="msg bn">{CONFIG.heart.map((t, i) => <p key={i} className="rv">{t}</p>)}</div>
        </section>

        {/* PHOTOS III — three staggered frames */}
        <section className="trio chapter" aria-label="Photographs">
          <div className="intro">
            <p className="k rv">Frames worth keeping</p>
            <Split>A few moments, kept.</Split>
          </div>
          {[5, 6, 7].map((n, k) => (
            <figure key={n} className={`t${k + 1}`} style={{ margin: 0 }}><Photo i={n} /><Cap i={n} /></figure>
          ))}
        </section>

        {/* FINALE */}
        <section className="sec c7 chapter" aria-labelledby="t7">
          <Split id="t7">Happy birthday, my favorite lady boss. ❤️</Split>
          <p className="l bn rv">{CONFIG.finale1}</p>
          <p className="l l2 bn rv">{[].concat(CONFIG.finale2).join(" ")}</p>
          <button className="btn rv" onClick={() => setLetter(true)}>One last little surprise</button>
        </section>

        <div className="fin chapter" id="fin"><div>
          <div className="hr" />
          <h3 className="rv">for {name}</h3>
          <p className="k rv" style={{ transitionDelay: '.8s' }}>{date} · fin.</p>
        </div></div>
      </main>

      <div id="letter" className={letter ? 'show' : ''} role="dialog" aria-modal="true" aria-label="Birthday letter">
        <div className="inner">
          <p className="k" style={{ marginBottom: '3rem' }}>A private letter for {name}</p>
          <div>{CONFIG.letter.map((t, i) => <p key={i}>{t}</p>)}</div>
        </div>
      </div>
      <button id="close" onClick={closeLetter}>Close ✕</button>
      {CONFIG.audioSrc && (
        <button id="snd" style={{ display: 'block' }} aria-pressed={sound} onClick={toggleSound}>{sound ? '♪ Sound on' : '♪ Sound off'}</button>
      )}
    </>
  )
}

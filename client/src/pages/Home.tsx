import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Brain,
  Check,
  Clock3,
  Crown,
  Keyboard,
  Layers3,
  Lightbulb,
  LockKeyhole,
  Play,
  RotateCcw,
  Share2,
  Sparkles,
  Target,
  TimerReset,
  Trophy,
  X,
  Zap,
} from "lucide-react";

type VisualKind = "numbers" | "shape-sequence" | "matrix" | "odd-one-out" | "rotation" | "symbols" | "arithmetic";
type Question = {
  id: number;
  category: string;
  label: string;
  difficulty: "سهل" | "متوسط" | "صعب" | "خبير";
  timeLimit: number;
  prompt: string;
  subprompt?: string;
  options: string[];
  answer: number;
  visual: VisualKind;
  visualData?: string[];
};

const questions: Question[] = [
  { id: 1, category: "تسلسل عددي", label: "الاستدلال العددي", difficulty: "سهل", timeLimit: 30, prompt: "ما العدد التالي في المتتالية؟", subprompt: "اكتشف القاعدة قبل أن تختار إجابتك.", options: ["36", "42", "48", "52"], answer: 2, visual: "numbers", visualData: ["3", "6", "12", "24", "?"] },
  { id: 2, category: "منطق لفظي", label: "الاستنتاج المنطقي", difficulty: "سهل", timeLimit: 35, prompt: "إذا كانت كل الـ«نورا» من فئة «تالي»، وبعض «تالي» زرقاء، فما العبارة المؤكدة؟", subprompt: "اختر الاستنتاج الذي لا يحتمل الخطأ.", options: ["كل النورا زرقاء", "بعض النورا زرقاء", "كل النورا من تالي", "لا توجد نورا زرقاء"], answer: 2, visual: "symbols", visualData: ["نورا", "تالي", "زرقاء"] },
  { id: 3, category: "نمط بصري", label: "تتابع الأشكال", difficulty: "متوسط", timeLimit: 30, prompt: "أي شكل يكمل النمط؟", subprompt: "يتغير الشكل في كل خطوة وفق دورة منتظمة.", options: ["دائرة نصفها سماوي", "مثلث أبيض", "مربع سماوي", "معيّن مقسوم"], answer: 3, visual: "shape-sequence", visualData: ["diamond", "circle", "triangle", "diamond", "?"] },
  { id: 4, category: "مصفوفة منطقية", label: "مصفوفات ريفن", difficulty: "متوسط", timeLimit: 40, prompt: "اختر القطعة الناقصة لإكمال المصفوفة.", subprompt: "راقب اتجاه التقسيم وعدد النقاط في كل صف.", options: ["دائرة مقسومة رأسيًا", "مثلث بخط قطري", "مربع بنقطة", "معيّن فارغ"], answer: 0, visual: "matrix" },
  { id: 5, category: "اكتشاف المختلف", label: "تمييز القاعدة", difficulty: "متوسط", timeLimit: 25, prompt: "أي بطاقة لا تنتمي إلى المجموعة؟", subprompt: "ثلاثة رموز تتبع القاعدة نفسها، واحد فقط يكسرها.", options: ["أ", "ب", "ج", "د"], answer: 2, visual: "odd-one-out" },
  { id: 6, category: "دوران ذهني", label: "التصور المكاني", difficulty: "صعب", timeLimit: 35, prompt: "تم تدوير السهم 270° مع عقارب الساعة. إلى أين سيشير؟", subprompt: "تخيّل الحركة، لا تتبع اتجاه الشاشة فقط.", options: ["أعلى", "يمين", "أسفل", "يسار"], answer: 3, visual: "rotation" },
  { id: 7, category: "إكمال النمط", label: "الذاكرة البصرية", difficulty: "صعب", timeLimit: 30, prompt: "ما الرمز التالي في هذا التتابع؟", subprompt: "تتكرر قاعدتان في الوقت نفسه.", options: ["نجمة صغيرة", "مثلث مخطط", "دائرة فارغة", "مربع بنقطة"], answer: 1, visual: "symbols", visualData: ["◆", "●", "◆", "●", "◆", "?"] },
  { id: 8, category: "حساب منطقي", label: "السرعة والدقة", difficulty: "صعب", timeLimit: 25, prompt: "خمس آلات تصنع خمس ألعاب في خمس دقائق. كم لعبة تصنع 100 آلة في 100 دقيقة؟", subprompt: "فكّر في معدل الآلة الواحدة، وليس في الجمع المباشر.", options: ["100", "500", "1,000", "2,000"], answer: 2, visual: "arithmetic", visualData: ["5 آلات", "5 دقائق", "5 ألعاب"] },
  { id: 9, category: "مقارنة واستنتاج", label: "ترتيب العلاقات", difficulty: "صعب", timeLimit: 30, prompt: "ليلى أطول من ناديا، وناديا أطول من ريم. أي عبارة صحيحة؟", subprompt: "رتّب الأسماء من الأطول إلى الأقصر.", options: ["ريم أطول من ليلى", "ليلى أطول من ريم", "ناديا أقصر من ريم", "لا يمكن تحديد الترتيب"], answer: 1, visual: "symbols", visualData: ["ليلى", "ناديا", "ريم"] },
  { id: 10, category: "تفكير سريع", label: "مرونة ذهنية", difficulty: "خبير", timeLimit: 20, prompt: "ما العدد التالي؟ 2، 5، 11، 23، ؟", subprompt: "طبّق العملية نفسها على كل حد.", options: ["35", "41", "47", "51"], answer: 2, visual: "numbers", visualData: ["2", "5", "11", "23", "?"] },
  { id: 11, category: "علاقات", label: "التناظر اللفظي", difficulty: "خبير", timeLimit: 25, prompt: "يد : قفاز :: قدم : ؟", subprompt: "ابحث عن العلاقة الوظيفية نفسها.", options: ["جورب", "حذاء", "ساق", "أرض"], answer: 1, visual: "symbols", visualData: ["يد", "قفاز", "قدم", "؟"] },
  { id: 12, category: "مصفوفة عددية", label: "التفكير المركب", difficulty: "خبير", timeLimit: 35, prompt: "في كل صف: العدد الثالث = مجموع العددين الأول والثاني. ما العدد الناقص؟", subprompt: "طبّق القاعدة نفسها على الصف الأخير.", options: ["12", "13", "14", "15"], answer: 2, visual: "arithmetic", visualData: ["4 + 5 = 9", "7 + 3 = 10", "6 + 8 = ?"] },
];

const letterLabels = ["أ", "ب", "ج", "د"];

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? "brand--compact" : ""}`}><span className="brand-mark"><span /></span><span className="brand-type">IQ <b>ARENA</b></span></div>;
}

function Button({ children, onClick, variant = "primary", className = "" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "light"; className?: string }) {
  return <button type="button" onClick={onClick} className={`button button--${variant} ${className}`}>{children}</button>;
}

function RingIcon({ number, active, done }: { number: number; active?: boolean; done?: boolean }) {
  return <span className={`step-ring ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}>{done ? <Check size={14} strokeWidth={3} /> : number}</span>;
}

function QuestionVisual({ question }: { question: Question }) {
  if (question.visual === "numbers") return <div className="visual-sequence" aria-label="تسلسل عددي">{question.visualData?.map((item, index) => <span key={index} className={item === "?" ? "sequence-question" : ""}>{item}</span>)}</div>;
  if (question.visual === "shape-sequence") return <div className="shape-sequence" aria-label="تسلسل أشكال">{question.visualData?.map((shape, index) => shape === "?" ? <span key={index} className="shape-tile shape-tile--question">?</span> : <span key={index} className={`shape-tile shape-tile--${shape}`} />)}</div>;
  if (question.visual === "matrix") return <div className="matrix-board" aria-label="مصفوفة منطقية"><div className="matrix-cell"><span className="matrix-circle" /></div><div className="matrix-cell"><span className="matrix-circle matrix-circle--split" /></div><div className="matrix-cell"><span className="matrix-triangle" /></div><div className="matrix-cell matrix-cell--missing">?</div></div>;
  if (question.visual === "odd-one-out") return <div className="odd-board" aria-label="بطاقات لاكتشاف المختلف">{[0, 1, 2, 3].map((item) => <div key={item} className={`odd-card odd-card--${item}`}><span /></div>)}</div>;
  if (question.visual === "rotation") return <div className="rotation-board" aria-label="دوران سهم"><div className="rotation-arrow">➜</div><div className="rotation-orbit"><span>0°</span><span>90°</span><span>180°</span><span>270°</span></div></div>;
  if (question.visual === "arithmetic") return <div className="arithmetic-board" aria-label="مصفوفة حسابية">{question.visualData?.map((row, index) => <div key={index} className="arithmetic-row"><span>{row}</span>{index < 2 ? <Check size={15} /> : <span className="arithmetic-missing">؟</span>}</div>)}</div>;
  return <div className="symbol-board" aria-label="تتابع رموز">{question.visualData?.map((item, index) => <span key={index} className={item === "؟" || item === "?" ? "symbol-missing" : index % 2 === 0 ? "symbol-cyan" : "symbol-amber"}>{item}</span>)}</div>;
}

function HeroVisual() {
  return <div className="hero-visual" aria-hidden="true"><div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" /><div className="hero-glow" /><div className="hero-grid" /><div className="preview-card"><div className="preview-card__top"><span>سؤال 07 / 12</span><span className="preview-live"><i /> مباشر</span></div><div className="preview-progress"><span /></div><div className="preview-pattern"><span className="pattern-circle" /><span className="pattern-half" /><span className="pattern-triangle" /><span className="pattern-diamond" /><span className="pattern-question">?</span></div><p>ما الشكل التالي في النمط؟</p><div className="preview-options"><span>أ</span><span>ب</span><span className="is-active">ج</span><span>د</span></div></div><div className="float-chip float-chip--top"><Zap size={14} /> سرعة التفكير</div><div className="float-chip float-chip--bottom"><Target size={14} /> 8.7 / 10 دقة</div></div>;
}

function Landing({ onStart }: { onStart: () => void }) {
  return <main className="landing-shell"><nav className="top-nav container"><Logo /><div className="nav-meta"><span><LockKeyhole size={14} /> اختبار خاص</span><span className="nav-divider" /><span>لا تسجيل مطلوب</span></div></nav><section className="hero container"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15} /> اختبار ذكي، مصمم لعقلك</div><h1>اكتشف <em>قوة تفكيرك</em><br />في 12 سؤالًا.</h1><p className="hero-lede">رحلة قصيرة تكشف طريقة تفكيرك عبر أنماط بصرية، منطق، أرقام، وسرعة بديهة. اختبار متوازن، سريع، وبدون أسئلة مكررة.</p><div className="hero-actions"><Button onClick={onStart} className="button--hero"><Play size={18} fill="currentColor" /> ابدأ اختبار الذكاء <ArrowLeft size={18} /></Button><span className="hero-time"><Clock3 size={16} /> يستغرق 6–8 دقائق</span></div><div className="trust-row"><div className="avatars"><span>س</span><span>م</span><span>ر</span><span>+</span></div><span><b>12,480+</b> شخص خاضوا التحدي هذا الأسبوع</span></div></div><HeroVisual /></section><section className="feature-strip container"><div className="feature-item"><span className="feature-icon feature-icon--cyan"><Layers3 size={18} /></span><span><b>12 سؤالًا متنوعًا</b><small>أنماط رقمية وبصرية ومنطقية</small></span></div><div className="feature-item"><span className="feature-icon feature-icon--amber"><TimerReset size={18} /></span><span><b>وقت محسوب بذكاء</b><small>يقيس الدقة والسرعة معًا</small></span></div><div className="feature-item"><span className="feature-icon feature-icon--violet"><Crown size={18} /></span><span><b>تقرير شخصي فوري</b><small>نتيجة واضحة قابلة للمشاركة</small></span></div></section><footer className="landing-footer container"><span>IQ ARENA <i>•</i> تحدٍ لعقلك، لا لوقتك</span><span className="footer-key"><Keyboard size={14} /> يمكنك استخدام 1–4 للإجابة</span></footer></main>;
}

function Quiz({ onFinish }: { onFinish: (score: number, answers: number[], elapsed: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(questions[0].timeLimit);
  const [startedAt] = useState(() => Date.now());
  const question = questions[current];
  const progress = ((current + (selected !== null ? 1 : 0)) / questions.length) * 100;

  const advance = useCallback((answer: number) => {
    if (selected !== null) return;
    setSelected(answer);
    const nextAnswers = [...answers, answer];
    window.setTimeout(() => {
      if (current === questions.length - 1) {
        const score = nextAnswers.reduce((total, item, index) => total + (item === questions[index].answer ? 1 : 0), 0);
        onFinish(score, nextAnswers, Math.round((Date.now() - startedAt) / 1000));
      } else {
        setAnswers(nextAnswers);
        setCurrent((value) => value + 1);
        setSelected(null);
        setTimeLeft(questions[current + 1].timeLimit);
      }
    }, 520);
  }, [answers, current, onFinish, selected, startedAt]);

  useEffect(() => {
    if (selected !== null) return;
    const timer = window.setInterval(() => setTimeLeft((value) => { if (value <= 1) { window.clearInterval(timer); advance(-1); return 0; } return value - 1; }), 1000);
    return () => window.clearInterval(timer);
  }, [advance, selected]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { const key = Number(event.key); if (key >= 1 && key <= 4) advance(key - 1); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance]);

  return <main className="quiz-shell"><nav className="quiz-nav container"><Logo compact /><div className="quiz-nav-center"><span>اختبار الذكاء</span><span className="nav-divider" /><span>وضع التركيز</span></div><div className="quiz-timer"><Clock3 size={16} /><span>00:{String(timeLeft).padStart(2, "0")}</span></div></nav><section className="quiz-layout container"><div className="quiz-main"><div className="quiz-progress-row"><div className="quiz-progress"><span style={{ width: `${Math.max(progress, (current / questions.length) * 100)}%` }} /></div><span><b>{String(current + 1).padStart(2, "0")}</b> / {String(questions.length).padStart(2, "0")}</span></div><div className="question-heading"><div className="question-meta"><span className="category-dot" /> {question.category} <span className={`difficulty difficulty--${question.difficulty}`}>{question.difficulty}</span></div><h2>{question.prompt}</h2><p>{question.subprompt}</p></div><div className="question-visual-card"><QuestionVisual question={question} /></div><div className="answers-grid">{question.options.map((option, index) => <button key={option} className={`answer-card ${selected === index ? (index === question.answer ? "is-correct" : "is-wrong") : ""} ${selected !== null && index === question.answer ? "show-correct" : ""}`} onClick={() => advance(index)} disabled={selected !== null} aria-label={`الإجابة ${letterLabels[index]}: ${option}`}><span className="answer-letter">{letterLabels[index]}</span><span className="answer-text">{option}</span><span className="answer-indicator">{selected !== null && index === question.answer ? <Check size={16} /> : selected === index && index !== question.answer ? <X size={16} /> : <ArrowLeft size={16} />}</span></button>)}</div><div className="quiz-hint"><Keyboard size={15} /> اختر إجابتك باستخدام الأرقام <b>1</b>–<b>4</b><span>•</span><span>استمع إلى حدسك الأول</span></div></div><aside className="quiz-side"><div className="side-card side-card--score"><div className="side-card__top"><span>مؤشر التقدم</span><span className="live-badge"><i /> مباشر</span></div><div className="steps-grid">{questions.map((item, index) => <RingIcon key={item.id} number={item.id} active={index === current} done={index < current} />)}</div><div className="side-divider" /><div className="side-stat"><span>المجال الحالي</span><b>{question.label}</b></div></div><div className="side-card side-card--tip"><Lightbulb size={19} /><div><b>تلميح سريع</b><p>لا تبحث عن الكمال. الاختبار يقيس كيف توازن بين السرعة والدقة.</p></div></div><div className="side-foot"><Sparkles size={14} /> يتم حفظ التقدم تلقائيًا</div></aside></section></main>;
}

function Result({ score, elapsed, onRestart }: { score: number; answers: number[]; elapsed: number; onRestart: () => void }) {
  const percentage = Math.round((score / questions.length) * 100);
  const iq = Math.min(145, Math.max(82, 86 + score * 4 + (elapsed < 300 ? 4 : 0)));
  const label = iq >= 125 ? "استثنائي" : iq >= 110 ? "متقدم" : iq >= 90 ? "متوازن" : "قابل للتطور";
  const breakdown = useMemo(() => ["المنطق", "الأنماط", "السرعة"].map((group, index) => ({ group, value: Math.min(98, Math.max(42, percentage + [7, -4, elapsed < 360 ? 9 : -2][index])) })), [elapsed, percentage]);
  const share = async () => { const text = `حصلت على ${iq} في اختبار IQ Arena — ${label}`; if (navigator.share) await navigator.share({ title: "نتيجتي في IQ Arena", text }); else await navigator.clipboard?.writeText(text); };
  return <main className="result-shell"><nav className="top-nav container"><Logo /><span className="result-nav-note"><Check size={15} /> اكتمل الاختبار بنجاح</span></nav><section className="result-layout container"><div className="result-intro"><div className="eyebrow"><Trophy size={15} /> النتيجة جاهزة</div><h1>هذه هي <em>بصمتك الذهنية.</em></h1><p>أجبت عن {score} من {questions.length} أسئلة بشكل صحيح. النتيجة تعكس أداءك في هذا التحدي وليست تشخيصًا طبيًا.</p><div className="result-actions"><Button onClick={share} variant="light"><Share2 size={17} /> مشاركة النتيجة</Button><Button onClick={onRestart} variant="ghost"><RotateCcw size={17} /> إعادة الاختبار</Button></div></div><div className="result-score-card"><div className="score-orbit score-orbit--one" /><div className="score-orbit score-orbit--two" /><div className="score-kicker">مؤشر IQ التقريبي</div><div className="score-number">{iq}</div><div className="score-label"><span /> {label}</div><div className="score-scale"><span>80</span><div><i style={{ width: `${Math.min(100, ((iq - 80) / 65) * 100)}%` }} /></div><span>145</span></div></div></section><section className="result-details container"><div className="detail-card detail-card--breakdown"><div className="detail-head"><div><span className="section-kicker">تحليل الأداء</span><h2>كيف تفكر؟</h2></div><span className="detail-count">{percentage}% دقة</span></div>{breakdown.map((item) => <div key={item.group} className="breakdown-row"><div className="breakdown-label"><span>{item.group}</span><b>{item.value}%</b></div><div className="breakdown-track"><i style={{ width: `${item.value}%` }} /></div></div>)}</div><div className="detail-card detail-card--summary"><div className="section-kicker">ملخص سريع</div><div className="summary-list"><div><span className="summary-icon summary-icon--cyan"><Check size={15} /></span><span><b>{score} إجابات صحيحة</b><small>قدرة جيدة على اكتشاف القواعد</small></span></div><div><span className="summary-icon summary-icon--amber"><Zap size={15} /></span><span><b>{elapsed} ثانية</b><small>متوسط سرعة استجابة متوازن</small></span></div><div><span className="summary-icon summary-icon--violet"><Brain size={15} /></span><span><b>مجال للتطور</b><small>أعد الاختبار لاحقًا وقارن تقدمك</small></span></div></div></div></section><footer className="result-footer container"><span>IQ ARENA <i>•</i> صمّم لقياس فضولك</span><span>نتيجتك محفوظة على جهازك فقط</span></footer></main>;
}

export default function Home() {
  const [screen, setScreen] = useState<"landing" | "quiz" | "result">("landing");
  const [result, setResult] = useState({ score: 0, answers: [] as number[], elapsed: 0 });
  const finish = (score: number, answers: number[], elapsed: number) => { setResult({ score, answers, elapsed }); setScreen("result"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const restart = () => { setResult({ score: 0, answers: [], elapsed: 0 }); setScreen("landing"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("result")) {
      setResult({ score: 9, answers: [], elapsed: 286 });
      setScreen("result");
      return;
    }
    if (params.has("demo")) {
      const timer = window.setTimeout(() => setScreen("quiz"), 700);
      return () => window.clearTimeout(timer);
    }
  }, []);
  return <div dir="rtl" className="app-frame">{screen === "landing" && <Landing onStart={() => setScreen("quiz")} />}{screen === "quiz" && <Quiz onFinish={finish} />}{screen === "result" && <Result {...result} onRestart={restart} />}</div>;
}

export { questions };
export type { Question };

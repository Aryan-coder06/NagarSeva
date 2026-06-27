import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Camera, CheckCircle2, Crosshair, FileImage, Loader2, MapPin, Mic, ShieldCheck, Sparkles, Square, Video, WandSparkles } from 'lucide-react';
import uploadImage from '../utils/uploadImage';
import { useAuth } from '../contexts/AuthContext';
import { SignedIn, SignedOut, SignInButton } from '../components/AuthComponents';
import { createIssue, transcribeIssueAudio } from '../api/Issues';

const steps = [
  { label: 'Capture evidence', icon: Camera },
  { label: 'Attach GPS', icon: Crosshair },
  { label: 'AI triage', icon: Sparkles },
  { label: 'Track action', icon: ShieldCheck },
];

const highlights = [
  'Image and video evidence improves triage quality',
  'Live GPS prevents vague complaints',
  'Gemini generates category, severity, urgency, and department',
  'Submitted reports flow directly into the public action queue',
];

const speechLanguages = [
  { value: 'unknown', label: 'Auto detect' },
  { value: 'en-IN', label: 'English (India)' },
  { value: 'hi-IN', label: 'Hindi' },
  { value: 'bn-IN', label: 'Bengali' },
  { value: 'gu-IN', label: 'Gujarati' },
  { value: 'kn-IN', label: 'Kannada' },
  { value: 'ml-IN', label: 'Malayalam' },
  { value: 'mr-IN', label: 'Marathi' },
  { value: 'od-IN', label: 'Odia' },
  { value: 'pa-IN', label: 'Punjabi' },
  { value: 'ta-IN', label: 'Tamil' },
  { value: 'te-IN', label: 'Telugu' },
  { value: 'ur-IN', label: 'Urdu' },
];

const ReportIssue = () => {
  const [fileName, setFileName] = useState('No photo selected');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdIssue, setCreatedIssue] = useState(null);
  const [formData, setFormData] = useState({ userMessage: '' });
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('unknown');
  const { getToken, user } = useAuth();
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFileName(selected ? selected.name : 'No media selected');
    setFile(selected || null);
    setSuccess(false);
    setCreatedIssue(null);
  };

  const getCoordinates = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Location permission is required to report an issue.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
        () => reject(new Error('Allow location access so the issue can be mapped.')),
        { enableHighAccuracy: true, timeout: 12000 }
      );
    });

  const stopAudioTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('Voice capture is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const supportedMimeType =
        ['audio/webm;codecs=opus', 'audio/webm'].find((type) => MediaRecorder.isTypeSupported(type)) || '';
      const recorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data?.size) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const token = await getToken();
          if (!token) throw new Error('Please sign in to use voice transcription.');

          setTranscribing(true);

          const mimeType = recorder.mimeType || 'audio/webm';
          const extension = mimeType.includes('webm') ? 'webm' : 'wav';
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          const audioFile = new File([audioBlob], `nagarseva-report.${extension}`, { type: mimeType });
          const result = await transcribeIssueAudio(audioFile, token, speechLanguage);
          const transcript = String(result?.transcript || '').trim();

          if (!transcript) {
            throw new Error('No speech was detected. Try again with clearer audio.');
          }

          setFormData((current) => ({
            ...current,
            userMessage: current.userMessage
              ? `${current.userMessage.trim()}\n${transcript}`
              : transcript,
          }));
        } catch (error) {
          alert(error.response?.data?.error || error.message);
        } finally {
          setTranscribing(false);
          chunksRef.current = [];
          stopAudioTracks();
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (error) {
      stopAudioTracks();
      alert(error.message || 'Unable to start voice recording.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recording) {
      recorderRef.current.stop();
      recorderRef.current = null;
      setRecording(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error('Please sign in to report an issue.');
      if (!file) throw new Error('Please add a photo or video of the issue.');

      const coordinates = await getCoordinates();
      const mediaData = await uploadImage(file, token);
      const created = await createIssue({
        userMessage: formData.userMessage,
        coordinates,
        imageUrl: mediaData.url,
        mediaType: mediaData.mediaType,
      }, token, user.$id);

      setFormData({ userMessage: '' });
      setFile(null);
      setFileName('No media selected');
      setSuccess(true);
      setCreatedIssue(created);
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.msg || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50/20 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-green-950/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header / Info Card ── */}
        <div className="mb-8 grid gap-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[28px] shadow-xl p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">
              <Sparkles className="mr-2 h-4 w-4" />
              Citizen report workflow
            </div>
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
                Report a local civic issue with evidence, location, and AI triage.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
                Add a clear photo and short context. NagarSeva captures location, sends the evidence through Gemini, and places the issue into the verified public action queue.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.1, duration: 0.4 }}
                  className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50/60 p-4 dark:border-green-900/20 dark:bg-green-950/20"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-200">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── AI Routing Preview Panel ── */}
          <motion.div
            className="rounded-[24px] bg-gradient-to-br from-zinc-950 via-green-950 to-emerald-900 p-5 text-white shadow-2xl"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="rounded-[20px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-sm font-semibold text-green-100">AI routing preview</h3>
                  <p className="text-xs text-green-200/80">What happens after submit</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/12">
                  <WandSparkles className="h-5 w-5 text-green-100" />
                </div>
              </div>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.label}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.35 }}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/12 text-green-100">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white"><span className="font-mono">{index + 1}</span>. {step.label}</p>
                      <p className="mt-1 text-sm leading-6 text-green-100/85">
                        {index === 0 && 'Your photo gives the model enough visual evidence to classify the civic problem.'}
                        {index === 1 && 'Precise coordinates place the case on the public issue map and admin dashboard.'}
                        {index === 2 && 'Gemini extracts category, severity, urgency, department, and recommended action.'}
                        {index === 3 && 'The report becomes visible for community validation and authority follow-up.'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/8 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-amber-300" />
                  <p className="text-sm leading-6 text-green-100/90">
                    Location access is requested only during submission. Without GPS, the report cannot be placed on the civic map or routed accurately.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Form + Sidebar ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
          <section className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[28px] shadow-xl p-6">
            <div className="mb-8">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Citizen submission</p>
              <h2 className="font-heading mt-2 text-3xl font-bold text-zinc-950 dark:text-white">Upload the issue and add field context</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                Use a well-lit photo and short description with concrete context like road type, nearby landmark, danger level, or time of day.
              </p>
            </div>

            <SignedOut>
              <div className="rounded-[24px] border border-dashed border-green-200 bg-green-50/50 p-10 text-center dark:border-green-800 dark:bg-green-950/20">
                <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-heading text-xl font-bold text-zinc-950 dark:text-white">Sign in to continue</h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Verified accounts make reports easier to track and reduce duplicate submissions.</p>
                <div className="mt-6">
                  <SignInButton mode="modal">
                    <span className="inline-flex rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-700">
                      Sign in
                    </span>
                  </SignInButton>
                </div>
              </div>
            </SignedOut>

            <SignedIn>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="camera-upload" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">Issue photo</label>
                  <div className="mt-2 rounded-[24px] border border-dashed border-green-200 bg-green-50/40 p-4 hover:border-emerald-400 transition-colors duration-300 dark:border-green-900/20 dark:bg-green-950/20">
                    <input
                      accept="image/*,video/*,.jpg,.jpeg,.png,.webp,.avif,.heic,.heif,.mp4,.webm,.mov"
                      type="file"
                      id="camera-upload"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="camera-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-[20px] bg-white p-6 text-center shadow-sm transition hover:bg-green-50 dark:bg-slate-900 dark:hover:bg-green-950/40">
                      {file ? (
                        String(file.type || '').startsWith('video/') ? (
                          <video src={URL.createObjectURL(file)} controls className="mb-4 max-h-72 w-full rounded-[16px] object-cover" />
                        ) : (
                          <img src={URL.createObjectURL(file)} alt="" className="mb-4 max-h-72 w-full rounded-[16px] object-cover" />
                        )
                      ) : (
                        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-green-50 text-emerald-600 dark:bg-green-950/40 dark:text-emerald-400">
                          <div className="flex items-center gap-2">
                            <FileImage className="h-7 w-7" />
                            <Video className="h-6 w-6" />
                          </div>
                        </div>
                      )}
                      <span className="text-sm font-semibold text-zinc-950 dark:text-white">{fileName}</span>
                      <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Tap to use camera or upload an image/video</span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label htmlFor="issue-description" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">What should the civic team know?</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={speechLanguage}
                        onChange={(e) => setSpeechLanguage(e.target.value)}
                        disabled={recording || transcribing || loading}
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-200 dark:focus:ring-emerald-950"
                        aria-label="Speech transcription language"
                      >
                        {speechLanguages.map((language) => (
                          <option key={language.value} value={language.value}>
                            {language.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={recording ? stopRecording : startRecording}
                        disabled={transcribing || loading}
                        className={`inline-flex items-center rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition ${
                          recording
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {recording ? <Square className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                        {recording ? 'Stop recording' : 'Speak instead'}
                      </button>
                      {transcribing && (
                        <span className="inline-flex items-center rounded-xl bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 dark:bg-slate-800 dark:text-zinc-200">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Transcribing with Sarvam
                        </span>
                      )}
                    </div>
                  </div>
                  <textarea
                    id="issue-description"
                    placeholder="Example: This pothole is near a school gate and vehicles swerve suddenly during peak hours."
                    value={formData.userMessage}
                    onChange={(e) => setFormData({ ...formData, userMessage: e.target.value })}
                    className="mt-2 h-36 w-full resize-none rounded-2xl border border-zinc-300 bg-white p-4 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition-shadow duration-300 dark:border-zinc-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-950"
                  />
                  <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    Voice notes are transcribed with Sarvam AI and inserted into this field. Pick a language when known, or leave auto-detect for mixed civic reporting.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-premium inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-green-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:from-zinc-400 disabled:to-zinc-400 sm:w-auto"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {loading ? 'Analyzing and submitting' : 'Submit to AI triage'}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </button>
                  <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    Images up to 10 MB and videos up to 25 MB. Use JPG, PNG, WEBP, MP4, WEBM, or MOV.
                  </p>
                </div>

                {success && (
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Report submitted. It will appear in your dashboard after processing.
                    </motion.div>
                    {createdIssue?.isLikelyDuplicate && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                          <div>
                            <p className="font-semibold">Similar issue detected nearby</p>
                            <p className="mt-1 leading-6">
                              This report looks close to {createdIssue.duplicateClusterSize || 1} existing open issue{createdIssue.duplicateClusterSize === 1 ? '' : 's'}.
                              Community validation on those related cases can now increase their priority faster.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </SignedIn>
          </section>

        <aside className="space-y-4">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[28px] shadow-xl p-5">
            <h2 className="font-heading text-base font-bold text-zinc-950 dark:text-white">What happens after submit</h2>
            <div className="mt-5 space-y-4">
              {steps.map((step, index) => (
                <div key={step.label} className="flex gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white"><span className="font-mono">{index + 1}</span>. {step.label}</p>
                    <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      {index === 0 && 'Images help the AI understand real-world severity.'}
                      {index === 1 && 'Coordinates make reports map-ready and traceable.'}
                      {index === 2 && 'Gemini assigns category, priority, and department.'}
                      {index === 3 && 'Citizens and admins can verify progress.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-950/30">
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              <p className="text-sm leading-6 text-amber-900 dark:text-amber-200">
                Location permission is required only when submitting a report. The map uses it to prevent vague or unactionable complaints.
              </p>
            </div>
          </div>
        </aside>
      </div>
      </div>
    </main>
  );
};

export default ReportIssue;

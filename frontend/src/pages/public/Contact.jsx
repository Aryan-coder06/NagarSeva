import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  MessageCircle,
  CheckCircle,
  Send,
  Sparkles,
  Clock,
  AlertCircle,
} from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const getFieldValidation = (field, value) => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
        return null;
      case 'name':
        if (!value.trim()) return 'Name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters long.';
        return null;
      case 'message':
        if (!value.trim()) return 'Message is required.';
        if (value.trim().length < 10) return 'Message must be at least 10 characters long.';
        return null;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    ['name', 'email', 'message'].forEach((field) => {
      const error = getFieldValidation(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      alert('An error occurred while sending your message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = getFieldValidation(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    setFocusedField(null);
  };

  const isFilled = (value) => value.trim() !== '';

  const inputBase = 'w-full pl-12 pr-12 py-4 rounded-xl border-2 text-zinc-900 dark:text-white bg-white dark:bg-slate-800 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition-all duration-300 text-sm';

  const renderFormField = (name, type = 'text', Icon, placeholder, isTextArea = false) => {
    const borderClass = errors[name]
      ? 'border-red-400 focus:border-red-500'
      : focusedField === name
        ? 'border-emerald-500'
        : 'border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600';

    const focusRing = errors[name]
      ? 'focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
      : 'focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]';

    return (
      <div key={name} className="group mb-4">
        <div className="relative">
          <div className={`absolute left-4 ${isTextArea ? 'top-5' : 'top-1/2 -translate-y-1/2'} z-10`}>
            <Icon
              className={`w-5 h-5 transition-all duration-300 ${
                focusedField === name || isFilled(formData[name])
                  ? 'text-emerald-500 scale-110'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            />
          </div>
          {isTextArea ? (
            <textarea
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              onFocus={() => setFocusedField(name)}
              onBlur={handleBlur}
              rows={4}
              className={`${inputBase} ${borderClass} ${focusRing} resize-none`}
              placeholder={placeholder}
            />
          ) : (
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              onFocus={() => setFocusedField(name)}
              onBlur={handleBlur}
              className={`${inputBase} ${borderClass} ${focusRing}`}
              placeholder={placeholder}
            />
          )}
          <div className={`absolute right-4 ${isTextArea ? 'top-5' : 'top-1/2 -translate-y-1/2'}`}>
            {errors[name] ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : isFilled(formData[name]) && getFieldValidation(name, formData[name]) === null ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : null}
          </div>
        </div>
        {errors[name] && (
          <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {renderFormField('name', 'text', User, 'Your Name')}
      {renderFormField('email', 'email', Mail, 'Your Email')}
      {renderFormField('message', 'text', MessageCircle, 'Your Message', true)}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || submitted}
        className="btn-premium w-full bg-gradient-to-r from-emerald-500 to-teal-600 py-4 text-white font-bold shadow-lg shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center gap-3">
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending...</span>
            </>
          ) : submitted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Message Sent!</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </div>
      </button>
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl mt-3"
        >
          <CheckCircle className="w-6 h-6 text-emerald-500" />
          <span className="text-emerald-700 dark:text-emerald-300 font-medium">
            Thank you! We'll get back to you soon.
          </span>
        </motion.div>
      )}
    </div>
  );
};

function Contact() {
  return (
    <main className="min-h-screen px-4 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="grid lg:grid-cols-5 gap-10 items-start"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Sidebar Info */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/25 mb-5">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-heading text-display gradient-text mb-3 leading-tight">
                Contact Us
              </h1>
              <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Have questions or need help? We'd love to hear from you.
                Fill out the form and we'll respond quickly.
              </p>
            </div>

            <div className="space-y-3">
              <div className="group p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-zinc-900 dark:text-white text-sm">Email Us</h3>
                    <a
                      href="mailto:aryaniiitian06@gmail.com"
                      className="text-emerald-600 dark:text-emerald-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors font-medium text-sm"
                    >
                      aryaniiitian06@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-zinc-900 dark:text-white text-sm">Response Time</h3>
                    <p className="text-zinc-600 dark:text-zinc-300 font-medium text-sm">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30">
              <h3 className="font-heading text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                Why Contact Us?
              </h3>
              <ul className="space-y-1.5 text-sm text-emerald-700 dark:text-emerald-300">
                {[
                  'Technical support and assistance',
                  'Feature requests and feedback',
                  'General inquiries and questions',
                ].map((txt) => (
                  <li key={txt} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{txt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[28px] shadow-2xl border border-white/20 dark:border-white/10 p-8 md:p-10">
              <div className="mb-8 text-center">
                <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                  Send us a Message
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  We'll respond as quickly as possible
                </p>
              </div>
              <ContactForm />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}

export default Contact;

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ChevronLeft, MapPinned, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { INDIAN_STATES } from '../../data/indiaRegions';
import { MUNICIPAL_CATEGORIES, MUNICIPAL_DESIGNATIONS } from '../../data/municipalOptions';

const baseInputClass = 'w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-slate-950 dark:text-white';

const portalMeta = {
  citizen: {
    eyebrow: 'Citizen location profile',
    title: 'Tell NagarSeva where you live',
    subtitle: 'We use your India residence details to show the right local queue, city context, and neighborhood updates.',
    icon: UserRound,
    dashboard: '/dashboard',
  },
  municipality: {
    eyebrow: 'Municipal region profile',
    title: 'Tell NagarSeva which region you represent',
    subtitle: 'We use your department and represented area to route you into the right municipal operations workspace.',
    icon: Building2,
    dashboard: '/admin/dashboard',
  },
};

export default function ProfileOnboarding({ portalType }) {
  const { user, isSignedIn, profile, saveProfile, profileLoading } = useAuth();
  const navigate = useNavigate();
  const meta = useMemo(() => portalMeta[portalType], [portalType]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    country: 'India',
    citizenProfile: {
      state: '',
      district: '',
      city: '',
      locality: '',
      pincode: '',
      addressLine: '',
    },
    municipalityProfile: {
      organizationName: '',
      department: '',
      designation: '',
      assignedCategories: [],
      state: '',
      district: '',
      city: '',
      zone: '',
      ward: '',
      locality: '',
      officeAddress: '',
    },
  });

  useEffect(() => {
    if (!isSignedIn || profileLoading) return;

    if (profile?.portalType === portalType && profile?.isProfileComplete) {
      navigate(meta.dashboard);
    }
  }, [isSignedIn, profileLoading, profile, portalType, meta, navigate]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fullName: profile?.fullName || user?.name || prev.fullName,
      phone: profile?.phone || prev.phone,
      country: profile?.country || 'India',
      citizenProfile: {
        ...prev.citizenProfile,
        ...(profile?.citizenProfile || {}),
      },
      municipalityProfile: {
        ...prev.municipalityProfile,
        ...(profile?.municipalityProfile || {}),
      },
    }));
  }, [profile, user]);

  useEffect(() => {
    if (!isSignedIn && !profileLoading) {
      navigate(portalType === 'municipality' ? '/municipal/login' : '/citizen/login');
    }
  }, [isSignedIn, profileLoading, portalType, navigate]);

  const updateNested = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const toggleMunicipalCategory = (category) => {
    setForm((prev) => {
      const categories = prev.municipalityProfile.assignedCategories || [];
      const nextCategories = categories.includes(category)
        ? categories.filter((item) => item !== category)
        : [...categories, category];

      return {
        ...prev,
        municipalityProfile: {
          ...prev.municipalityProfile,
          assignedCategories: nextCategories,
        },
      };
    });
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required';

    if (portalType === 'citizen') {
      const profileData = form.citizenProfile;
      if (!profileData.state || !profileData.city || !profileData.locality || !profileData.pincode) {
        return 'State, city, locality, and pincode are required for citizen accounts';
      }
    }

    if (portalType === 'municipality') {
      const profileData = form.municipalityProfile;
      if (!profileData.organizationName || !profileData.department || !profileData.designation || !profileData.state || !profileData.city || !(profileData.ward || profileData.zone)) {
        return 'Organization, department, designation, state, city, and at least one of ward or zone are required';
      }
      if (!profileData.assignedCategories?.length) {
        return 'Select at least one operational category for the municipal account';
      }
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSaving(true);
    const result = await saveProfile({
      fullName: form.fullName,
      email: user?.email,
      phone: form.phone,
      country: form.country,
      portalType,
      citizenProfile: form.citizenProfile,
      municipalityProfile: form.municipalityProfile,
    });
    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    navigate(meta.dashboard);
  };

  const Icon = meta.icon;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
          <ChevronLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mt-6 overflow-hidden rounded-[32px] border border-white/20 bg-white/80 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80">
          <div className="border-b border-zinc-200 bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-8 text-white dark:border-zinc-800">
            <div className="inline-flex rounded-2xl bg-white/15 p-3">
              <Icon className="h-6 w-6" />
            </div>
            <p className="mt-5 text-sm font-semibold">{meta.eyebrow}</p>
            <h1 className="font-heading mt-2 text-3xl font-bold">{meta.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">{meta.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-8 px-8 py-8 lg:grid-cols-[1fr_20rem]">
            <div className="space-y-8">
              <section className="space-y-4">
                <h2 className="font-heading text-xl font-bold text-zinc-950 dark:text-white">Identity</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={baseInputClass} placeholder="Full name" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} />
                  <input className={baseInputClass} placeholder="Phone number" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
                  <input className={baseInputClass} value={user?.email || ''} disabled />
                  <input className={baseInputClass} value="India" disabled />
                </div>
              </section>

              {portalType === 'citizen' ? (
                <section className="space-y-4">
                  <h2 className="font-heading text-xl font-bold text-zinc-950 dark:text-white">Residence details</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select className={baseInputClass} value={form.citizenProfile.state} onChange={(e) => updateNested('citizenProfile', 'state', e.target.value)}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                    <input className={baseInputClass} placeholder="District" value={form.citizenProfile.district} onChange={(e) => updateNested('citizenProfile', 'district', e.target.value)} />
                    <input className={baseInputClass} placeholder="City" value={form.citizenProfile.city} onChange={(e) => updateNested('citizenProfile', 'city', e.target.value)} />
                    <input className={baseInputClass} placeholder="Locality / area" value={form.citizenProfile.locality} onChange={(e) => updateNested('citizenProfile', 'locality', e.target.value)} />
                    <input className={baseInputClass} placeholder="Pincode" value={form.citizenProfile.pincode} onChange={(e) => updateNested('citizenProfile', 'pincode', e.target.value)} />
                    <input className={baseInputClass} placeholder="Address line" value={form.citizenProfile.addressLine} onChange={(e) => updateNested('citizenProfile', 'addressLine', e.target.value)} />
                  </div>
                </section>
              ) : (
                <section className="space-y-4">
                  <h2 className="font-heading text-xl font-bold text-zinc-950 dark:text-white">Represented municipal region</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className={baseInputClass} placeholder="Municipality / organization" value={form.municipalityProfile.organizationName} onChange={(e) => updateNested('municipalityProfile', 'organizationName', e.target.value)} />
                    <input className={baseInputClass} placeholder="Department" value={form.municipalityProfile.department} onChange={(e) => updateNested('municipalityProfile', 'department', e.target.value)} />
                    <select className={baseInputClass} value={form.municipalityProfile.designation} onChange={(e) => updateNested('municipalityProfile', 'designation', e.target.value)}>
                      <option value="">Select designation</option>
                      {MUNICIPAL_DESIGNATIONS.map((designation) => <option key={designation} value={designation}>{designation}</option>)}
                    </select>
                    <select className={baseInputClass} value={form.municipalityProfile.state} onChange={(e) => updateNested('municipalityProfile', 'state', e.target.value)}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                    <input className={baseInputClass} placeholder="District" value={form.municipalityProfile.district} onChange={(e) => updateNested('municipalityProfile', 'district', e.target.value)} />
                    <input className={baseInputClass} placeholder="City" value={form.municipalityProfile.city} onChange={(e) => updateNested('municipalityProfile', 'city', e.target.value)} />
                    <input className={baseInputClass} placeholder="Zone" value={form.municipalityProfile.zone} onChange={(e) => updateNested('municipalityProfile', 'zone', e.target.value)} />
                    <input className={baseInputClass} placeholder="Ward" value={form.municipalityProfile.ward} onChange={(e) => updateNested('municipalityProfile', 'ward', e.target.value)} />
                    <input className={baseInputClass} placeholder="Locality / cluster" value={form.municipalityProfile.locality} onChange={(e) => updateNested('municipalityProfile', 'locality', e.target.value)} />
                    <input className={`${baseInputClass} sm:col-span-2`} placeholder="Office address" value={form.municipalityProfile.officeAddress} onChange={(e) => updateNested('municipalityProfile', 'officeAddress', e.target.value)} />
                  </div>

                  <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-slate-950/60">
                    <div className="mb-4">
                      <h3 className="font-heading text-lg font-bold text-zinc-950 dark:text-white">Operational categories</h3>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        Select the civic categories this municipal desk is allowed to manage. The dashboard will only show reports inside this scope.
                      </p>
                    </div>
                    <div className="grid max-h-72 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                      {MUNICIPAL_CATEGORIES.map((category) => {
                        const active = form.municipalityProfile.assignedCategories.includes(category);
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => toggleMunicipalCategory(category)}
                            className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                              active
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-200'
                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-zinc-700 dark:bg-slate-950 dark:text-zinc-300 dark:hover:border-emerald-700'
                            }`}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                  {error}
                </div>
              )}

              <button type="submit" disabled={saving} className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? 'Saving profile...' : 'Save and continue'}
              </button>
            </div>

            <aside className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-slate-950/60">
              <div className="flex items-center gap-3">
                <MapPinned className="h-5 w-5 text-emerald-600" />
                <h3 className="font-heading text-lg font-bold text-zinc-950 dark:text-white">Why this matters</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                <li>Location data drives India-specific city and ward context.</li>
                <li>Citizen accounts get neighborhood-relevant complaint history.</li>
                <li>Municipal accounts get region-aligned action queues and dashboards.</li>
                <li>One account can only belong to one portal type, either citizen or municipality.</li>
              </ul>
            </aside>
          </form>
        </div>
      </div>
    </main>
  );
}

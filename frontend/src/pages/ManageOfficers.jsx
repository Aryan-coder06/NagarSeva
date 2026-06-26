import React, {useState, useEffect} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { X, Edit, Trash2, UserPlus, Phone, Mail, MapPin, Tag } from 'lucide-react'
import { getOfficers, createOfficer, updateOfficer, deleteOfficer } from '../api/Officers'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const ManageOfficers = () => {
  const [showOfficerPopup, setShowOfficerPopup] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'
  const [editingOfficerId, setEditingOfficerId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'officer',
    assignedCategories: [],
    assignedLocations: '', // Store as string with commas
    phone: ''
  });

  const { getToken } = useAuth();

  const categories = [
    'Roads & Transport',
    'Street Lighting', 
    'Garbage & Sanitation',
    'Water Supply & Drainage',
    'Electricity',
    'Public Safety',
    'Other'
  ];

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await getOfficers(token);
      setOfficers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      role: 'officer',
      assignedCategories: [],
      assignedLocations: '',
      phone: ''
    });
    setMode('add');
    setEditingOfficerId(null);
  };

  const handleAddOfficer = () => {
    resetForm();
    setMode('add');
    setShowOfficerPopup(true);
  };

  const handleEditOfficer = (officer) => {
    setFormData({
      fullName: officer.fullName || '',
      email: officer.email || '',
      role: officer.role || 'officer',
      assignedCategories: officer.assignedCategories || [],
      assignedLocations: Array.isArray(officer.assignedLocations)
        ? officer.assignedLocations.join(', ')
        : officer.assignedLocations || '',
      phone: officer.phone || ''
    });
    setEditingOfficerId(officer._id);
    setMode('edit');
    setShowOfficerPopup(true);
  };

  const handleDeleteOfficer = async (officerId) => {
    if (window.confirm('Are you sure you want to remove this officer? This action cannot be undone.')) {
      try {
        const token = await getToken();
        await deleteOfficer(officerId, token);
        setOfficers(officers.filter(officer => officer._id !== officerId));
      } catch (error) {
        console.error('Error deleting officer:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      
      const submissionData = {
        ...formData,
        assignedLocations: formData.assignedLocations
          ? formData.assignedLocations.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0)
          : []
      };
      
      if (mode === 'add') {
        const response = await createOfficer(submissionData, token);
        setOfficers([...officers, response.officer]);
      } else {
        const response = await updateOfficer(editingOfficerId, submissionData, token);
        const updatedOfficers = officers.map(officer =>
          officer._id === editingOfficerId ? response.officer : officer
        );
        setOfficers(updatedOfficers);
      }
      
      setShowOfficerPopup(false);
      resetForm();
    } catch (error) {
      console.error('Error saving officer:', error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('An error occurred while saving the officer. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCategoryChange = (category) => {
    const updatedCategories = formData.assignedCategories.includes(category)
      ? formData.assignedCategories.filter(cat => cat !== category)
      : [...formData.assignedCategories, category];
    
    setFormData((prevData) => ({
      ...prevData,
      assignedCategories: updatedCategories
    }));
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      assignedLocations: value
    }));
  };

  const inputClass = 'w-full rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-800 p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition-all duration-300 text-sm';

  return (
    <>
      <div className={`max-w-6xl mx-auto transition-all duration-300 ${showOfficerPopup ? 'opacity-40 blur-sm pointer-events-none' : 'opacity-100'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className='font-heading text-2xl text-zinc-950 dark:text-white font-bold'>Manage Officers</h1>
          <button 
            onClick={handleAddOfficer}
            className='btn-premium flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
          >
            <UserPlus className="w-4 h-4" />
            Add Officer
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">Loading officers...</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            initial="hidden"
            animate="show"
          >
            {officers.map(officer => (
              <motion.div
                key={officer._id}
                variants={fadeUp}
                className="group rounded-[24px] border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-zinc-950 dark:text-white">{officer.fullName}</h3>
                    <span className="inline-block capitalize px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold rounded-full mt-1">
                      {officer.role}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEditOfficer(officer)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors"
                      title="Edit Officer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOfficer(officer._id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                      title="Delete Officer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="truncate">{officer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{officer.phone}</span>
                  </div>
                  
                  {officer.assignedCategories && officer.assignedCategories.length > 0 && (
                    <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                      <Tag className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                      <div className="flex flex-wrap gap-1">
                        {officer.assignedCategories.map((category, index) => (
                          <span key={index} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs rounded-lg">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {officer.assignedLocations && officer.assignedLocations.length > 0 && (
                    <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                      <MapPin className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                      <div className="flex flex-wrap gap-1">
                        {officer.assignedLocations.map((location, index) => (
                          <span key={index} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg">
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {officers.length === 0 && !loading && (
          <div className="text-center py-12">
            <UserPlus className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-zinc-600 dark:text-zinc-300 mb-2">No Officers Found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">Get started by adding your first officer to the system.</p>
            <button 
              onClick={handleAddOfficer}
              className="btn-premium bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
            >
              Add First Officer
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showOfficerPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[28px] border border-white/20 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-bold text-zinc-950 dark:text-white">
                  {mode === 'add' ? 'Add New Officer' : 'Edit Officer'}
                </h2>
                <button
                  onClick={() => setShowOfficerPopup(false)}
                  className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-2" htmlFor="fullName">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-2" htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-2" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-2" htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="officer">Officer</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-2">
                    Assigned Categories
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center gap-2 p-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={formData.assignedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-600"
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-2" htmlFor="assignedLocations">
                    Assigned Locations
                  </label>
                  <input
                    type="text"
                    id="assignedLocations"
                    value={formData.assignedLocations}
                    onChange={handleLocationChange}
                    className={inputClass}
                    placeholder="Enter locations separated by commas (e.g., Downtown, North District)"
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Separate multiple locations with commas
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowOfficerPopup(false)}
                    className="btn-premium flex-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-800 text-zinc-700 dark:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-premium flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      mode === 'add' ? 'Add Officer' : 'Update Officer'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ManageOfficers

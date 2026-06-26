const UserProfile = require('../models/UserProfile');

const normalizePortalType = (value) => {
  if (value === 'municipal') return 'municipality';
  return value;
};

const computeProfileCompletion = (portalType, citizenProfile = {}, municipalityProfile = {}) => {
  if (portalType === 'citizen') {
    return Boolean(
      citizenProfile.state &&
      citizenProfile.city &&
      citizenProfile.locality &&
      citizenProfile.pincode
    );
  }

  if (portalType === 'municipality') {
    return Boolean(
      municipalityProfile.organizationName &&
      municipalityProfile.department &&
      municipalityProfile.designation &&
      Array.isArray(municipalityProfile.assignedCategories) &&
      municipalityProfile.assignedCategories.length > 0 &&
      municipalityProfile.state &&
      municipalityProfile.city &&
      (municipalityProfile.ward || municipalityProfile.zone)
    );
  }

  return false;
};

const sanitizeProfilePayload = (body, auth) => {
  const portalType = normalizePortalType(body.portalType);
  const citizenProfile = body.citizenProfile || {};
  const municipalityProfile = body.municipalityProfile || {};

  return {
    firebaseUid: auth.uid,
    email: (body.email || auth.email || '').trim().toLowerCase(),
    fullName: (body.fullName || auth.name || auth.email || '').trim(),
    phone: (body.phone || '').trim(),
    portalType,
    country: (body.country || 'India').trim(),
    citizenProfile: {
      state: (citizenProfile.state || '').trim(),
      district: (citizenProfile.district || '').trim(),
      city: (citizenProfile.city || '').trim(),
      locality: (citizenProfile.locality || '').trim(),
      pincode: (citizenProfile.pincode || '').trim(),
      addressLine: (citizenProfile.addressLine || '').trim(),
    },
    municipalityProfile: {
      organizationName: (municipalityProfile.organizationName || '').trim(),
      department: (municipalityProfile.department || '').trim(),
      designation: (municipalityProfile.designation || '').trim(),
      assignedCategories: Array.isArray(municipalityProfile.assignedCategories)
        ? municipalityProfile.assignedCategories.map((item) => String(item || '').trim()).filter(Boolean)
        : [],
      state: (municipalityProfile.state || '').trim(),
      district: (municipalityProfile.district || '').trim(),
      city: (municipalityProfile.city || '').trim(),
      zone: (municipalityProfile.zone || '').trim(),
      ward: (municipalityProfile.ward || '').trim(),
      locality: (municipalityProfile.locality || '').trim(),
      officeAddress: (municipalityProfile.officeAddress || '').trim(),
    },
  };
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ firebaseUid: req.auth.uid }).lean();

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error retrieving profile:', error);
    return res.status(500).json({ message: 'Error retrieving profile' });
  }
};

const upsertMyProfile = async (req, res) => {
  try {
    const payload = sanitizeProfilePayload(req.body, req.auth);
    const existingProfile = await UserProfile.findOne({ firebaseUid: req.auth.uid });

    if (!payload.portalType) {
      return res.status(400).json({ message: 'portalType is required' });
    }

    if (!payload.fullName) {
      return res.status(400).json({ message: 'fullName is required' });
    }

    if (existingProfile?.portalType && existingProfile.portalType !== payload.portalType) {
      return res.status(409).json({
        message: `This account is already registered as a ${existingProfile.portalType}. One account cannot be both citizen and municipality.`,
      });
    }

    payload.isProfileComplete = computeProfileCompletion(
      payload.portalType,
      payload.citizenProfile,
      payload.municipalityProfile
    );

    const profile = await UserProfile.findOneAndUpdate(
      { firebaseUid: req.auth.uid },
      payload,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error saving profile:', error);
    return res.status(500).json({ message: 'Error saving profile' });
  }
};

module.exports = {
  getMyProfile,
  upsertMyProfile,
};

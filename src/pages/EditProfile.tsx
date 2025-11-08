import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { getUserProfile, updateUserProfile, updateFarmProfile, uploadProfilePicture } from '../api/users';
import { User } from '../types/api';
import { useToasts } from '../hooks/useToasts';

function EditProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null); // 'personal', 'farm', or 'picture'
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToasts();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await getUserProfile();
        setUser(userData);
        setOriginalUser(JSON.parse(JSON.stringify(userData))); // Deep copy for cancel
      } catch (error) {
        console.error('Failed to fetch user profile', error);
        addToast('Failed to load user profile.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!user) return;

    const { name, value } = e.target;
    
    if (name.startsWith('farmProfile.')) {
      const key = name.split('.')[1];
      setUser({
        ...user,
        farmProfile: {
          ...(user.farmProfile || {}),
          [key]: value,
        },
      });
    } else {
      setUser({
        ...user,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = async (section: 'personal' | 'farm' | 'picture') => {
    if (!user) return;

    try {
      if (section === 'picture') {
        if (!selectedFile) {
          addToast('Please select a file.', 'info');
          return;
        }
        await uploadProfilePicture(selectedFile);
      } else if (section === 'personal') {
        await updateUserProfile({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone_number,
          date_of_birth: user.date_of_birth,
          gender: user.gender,
        });
      } else if (section === 'farm') {
        if (user.farmProfile) {
          await updateFarmProfile(user.farmProfile);
        }
      }

      if (section === 'picture') {
        const userData = await getUserProfile();
        setUser(userData);
        setOriginalUser(JSON.parse(JSON.stringify(userData)));
      } else {
        // For other updates, the local state is the source of truth.
        // Update the original user to match the new saved state.
        setOriginalUser(JSON.parse(JSON.stringify(user)));
      }

      setSelectedFile(null);
      setEditingSection(null);
      addToast(`${section.charAt(0).toUpperCase() + section.slice(1)} details updated successfully!`, 'success');
    } catch (error) {
      console.error(`Failed to update ${section} details`, error);
      addToast(`Failed to update ${section} details.`, 'error');
      setUser(originalUser); // Revert on error
    }
  };

  const handleCancel = () => {
    setUser(originalUser); // Revert to original data
    setEditingSection(null);
    setSelectedFile(null);
  };

  if (loading) {
    return <Layout><div>Loading profile...</div></Layout>;
  }

  if (!user) {
    return <Layout><div>Could not load user profile. Please try again later.</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 p-4 mt-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600">Manage your personal information and farm details</p>
          </div>
        </div>

        {/* Profile Form */}
        <div id="profile-form" className="space-y-6">
          {/* Profile Picture Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Profile Picture</h2>
              {editingSection !== 'picture' ? (
                <button type="button" onClick={() => setEditingSection('picture')} className="text-sm font-medium text-green-600 hover:text-green-700">Edit</button>
              ) : (
                <div className="flex space-x-2">
                  <button type="button" onClick={handleCancel} className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => handleSave('picture')} className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Save</button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-6">
              <div className="h-20 w-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                {user.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span>{user.first_name?.[0]}{user.last_name?.[0]}</span>
                )}
              </div>
              <div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={editingSection !== 'picture'}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedFile ? selectedFile.name : 'Change Photo'}
                </button>
                <p className="text-sm text-gray-500 mt-1">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              {editingSection !== 'personal' ? (
                <button type="button" onClick={() => setEditingSection('personal')} className="text-sm font-medium text-green-600 hover:text-green-700">Edit</button>
              ) : (
                <div className="flex space-x-2">
                  <button type="button" onClick={handleCancel} className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => handleSave('personal')} className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Save</button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={user.first_name || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'personal'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={user.last_name || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'personal'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={user.email || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'personal'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={user.phone_number || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'personal'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={user.date_of_birth?.split('T')[0] || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'personal'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={user.gender || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'personal'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Farm Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Farm Information</h2>
              {editingSection !== 'farm' ? (
                <button type="button" onClick={() => setEditingSection('farm')} className="text-sm font-medium text-green-600 hover:text-green-700">Edit</button>
              ) : (
                <div className="flex space-x-2">
                  <button type="button" onClick={handleCancel} className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => handleSave('farm')} className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Save</button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  name="farmProfile.farm_name"
                  value={user.farmProfile?.farm_name || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'farm'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="farmProfile.address"
                  value={user.farmProfile?.address || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'farm'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                <input
                  type="text"
                  name="farmProfile.county"
                  value={user.farmProfile?.county || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'farm'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcounty</label>
                <input
                  type="text"
                  name="farmProfile.subcounty"
                  value={user.farmProfile?.subcounty || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'farm'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                <input
                  type="text"
                  name="farmProfile.ward"
                  value={user.farmProfile?.ward || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'farm'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  name="farmProfile.zip_code"
                  value={user.farmProfile?.zip_code || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'farm'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="farmProfile.country"
                  value={user.farmProfile?.country || ''}
                  onChange={handleChange}
                  disabled={editingSection !== 'farm'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default EditProfile;
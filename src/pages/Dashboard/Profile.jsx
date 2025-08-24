import { memo, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import { API_PATHS } from '../../utils/apiPaths';
import ProfilePhotoSelector from '../../components/layouts/inputs/ProfilePhotoSelector';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    mobileNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Bank account form state
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'checking',
    balance: '',
    currency: 'USD'
  });

  const [bankAccounts, setBankAccounts] = useState([]);
  const [editingBankId, setEditingBankId] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        mobileNumber: user.mobileNumber || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        }
      });
      if (user.profileImage) {
        setProfileImage(user.profileImage);
      }
      loadBankAccounts();
    }
  }, [user]);

  const loadBankAccounts = async () => {
    try {
      const { data } = await api.get(API_PATHS.auth.bankAccounts.list);
      setBankAccounts(data);
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage || typeof profileImage === 'string') return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const formData = new FormData();
      formData.append('image', profileImage);
      
      const response = await api.post(API_PATHS.auth.profileImage, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage('Profile image updated successfully!');
      setProfileImage(response.data.profileImage);
      
      // Refresh the user context to show updated data
      await refreshUser();
    } catch (error) {
      setMessage('Failed to update profile image. Please try again.');
      console.error('Profile image upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.put(API_PATHS.auth.updateProfile, profileForm);
      setMessage('Profile updated successfully!');
      
      // Update the user context with new data
      if (data && data.data) {
        // Update the local state with the new user data
        setProfileForm({
          fullName: data.data.fullName || '',
          mobileNumber: data.data.mobileNumber || '',
          address: {
            street: data.data.address?.street || '',
            city: data.data.address?.city || '',
            state: data.data.address?.state || '',
            zipCode: data.data.address?.zipCode || '',
            country: data.data.address?.country || ''
          }
        });
        
        // Update profile image if it exists
        if (data.data.profileImage) {
          setProfileImage(data.data.profileImage);
        }
        
        // Refresh the user context to show updated data
        setRefreshing(true);
        await refreshUser();
        setRefreshing(false);
      }
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage('New password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await api.put(API_PATHS.auth.changePassword, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Refresh the user context
      await refreshUser();
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleBankAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (editingBankId) {
        await api.put(API_PATHS.auth.bankAccounts.update(editingBankId), bankForm);
        setMessage('Bank account updated successfully!');
        setEditingBankId(null);
      } else {
        await api.post(API_PATHS.auth.bankAccounts.add, bankForm);
        setMessage('Bank account added successfully!');
      }
      setBankForm({ bankName: '', accountNumber: '', accountType: 'checking', balance: '', currency: 'USD' });
      loadBankAccounts();
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Failed to save bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBank = (account) => {
    setEditingBankId(account._id);
    setBankForm({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance.toString(),
      currency: account.currency
    });
  };

  const handleDeleteBank = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;
    
    try {
      await api.delete(API_PATHS.auth.bankAccounts.delete(accountId));
      setMessage('Bank account deleted successfully!');
      loadBankAccounts();
    } catch (error) {
      setMessage('Failed to delete bank account');
    }
  };

  const cancelEdit = () => {
    setEditingBankId(null);
    setBankForm({ bankName: '', accountNumber: '', accountType: 'checking', balance: '', currency: 'USD' });
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-100 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-purple-800">Profile Settings</h2>
        {user?.fullName && (
          <p className="text-gray-600 mt-2">Welcome back, <span className="font-semibold text-purple-700">{user.fullName}</span>!</p>
        )}
      </div>
      
      {message && (
        <div className={`p-3 rounded-md mb-4 ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-700 border border-green-400' 
            : 'bg-red-100 text-red-700 border border-red-400'
        }`}>
          <div className="flex items-center justify-between">
            <span>{message}</span>
            <button
              onClick={() => setMessage('')}
              className="text-sm hover:opacity-70"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
        {[
          { id: 'profile', label: 'Profile Info' },
          { id: 'password', label: 'Change Password' },
          { id: 'bank', label: 'Bank Accounts' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100">
            <h3 className="text-xl font-semibold text-purple-800 mb-6">Profile Information</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Image Section */}
              <div className="text-center">
                <ProfilePhotoSelector image={profileImage} setImage={setProfileImage} />
                {profileImage && typeof profileImage !== 'string' && (
                  <button
                    onClick={handleImageUpload}
                    disabled={loading}
                    className="btn-primary mt-4 w-full"
                  >
                    {loading ? 'Uploading...' : 'Upload Profile Image'}
                  </button>
                )}
                
                {/* Current Profile Information Display */}
                                  <div className="mt-6 text-left bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <span className="w-5 h-5 bg-blue-500 rounded-full mr-2 flex items-center justify-center">
                          <span className="text-white text-xs">👤</span>
                        </span>
                        Profile Information
                      </h4>
                      <button
                        onClick={refreshUser}
                        disabled={refreshing}
                        className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                      >
                        {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
                      </button>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-gray-600 flex items-center">
                          <span className="w-4 h-4 mr-2">📝</span>
                          Full Name:
                        </span>
                        <span className="font-medium text-gray-900">{user?.fullName || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-gray-600 flex items-center">
                          <span className="w-4 h-4 mr-2">📧</span>
                          Email:
                        </span>
                        <span className="font-medium text-gray-900">{user?.email || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-gray-600 flex items-center">
                          <span className="w-4 h-4 mr-2">📱</span>
                          Mobile:
                        </span>
                        <span className="font-medium text-gray-900">{user?.mobileNumber || 'Not set'}</span>
                      </div>
                      {user?.address && (
                        <>
                          <div className="flex justify-between items-center py-2 border-b border-blue-100">
                            <span className="text-gray-600 flex items-center">
                              <span className="w-4 h-4 mr-2">🏠</span>
                              Address:
                            </span>
                            <span className="font-medium text-gray-900">
                              {user.address.street || 'Not set'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-blue-100">
                            <span className="text-gray-600 flex items-center">
                              <span className="w-4 h-4 mr-2">🏙️</span>
                              City:
                            </span>
                            <span className="font-medium text-gray-900">
                              {user.address.city || 'Not set'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-blue-100">
                            <span className="text-gray-600 flex items-center">
                              <span className="w-4 h-4 mr-2">🗺️</span>
                              State:
                            </span>
                            <span className="font-medium text-gray-900">
                              {user.address.state || 'Not set'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-blue-100">
                            <span className="text-gray-600 flex items-center">
                              <span className="w-4 h-4 mr-2">📮</span>
                              ZIP Code:
                            </span>
                            <span className="font-medium text-gray-900">
                              {user.address.zipCode || 'Not set'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 flex items-center">
                              <span className="w-4 h-4 mr-2">🌍</span>
                              Country:
                            </span>
                            <span className="font-medium text-gray-900">
                              {user.address.country || 'Not set'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                    className="input-box"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={profileForm.mobileNumber}
                    onChange={(e) => setProfileForm({...profileForm, mobileNumber: e.target.value})}
                    className="input-box"
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={profileForm.address.street}
                    onChange={(e) => setProfileForm({
                      ...profileForm, 
                      address: {...profileForm.address, street: e.target.value}
                    })}
                    className="input-box"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={profileForm.address.city}
                      onChange={(e) => setProfileForm({
                        ...profileForm, 
                        address: {...profileForm.address, city: e.target.value}
                      })}
                      className="input-box"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={profileForm.address.state}
                      onChange={(e) => setProfileForm({
                        ...profileForm, 
                        address: {...profileForm.address, state: e.target.value}
                      })}
                      className="input-box"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={profileForm.address.zipCode}
                      onChange={(e) => setProfileForm({
                        ...profileForm, 
                        address: {...profileForm.address, zipCode: e.target.value}
                      })}
                      className="input-box"
                      placeholder="ZIP Code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={profileForm.address.country}
                      onChange={(e) => setProfileForm({
                        ...profileForm, 
                        address: {...profileForm.address, country: e.target.value}
                      })}
                      className="input-box"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100">
            <h3 className="text-xl font-semibold text-purple-800 mb-6">Change Password</h3>
            
            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="input-box"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="input-box"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="input-box"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Bank Accounts Tab */}
        {activeTab === 'bank' && (
          <div className="space-y-6">
            {/* Add/Edit Bank Account Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100">
              <h3 className="text-xl font-semibold text-purple-800 mb-6">
                {editingBankId ? 'Edit Bank Account' : 'Add New Bank Account'}
              </h3>
              
              <form onSubmit={handleBankAccountSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                    className="input-box"
                    placeholder="Enter bank name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                    className="input-box"
                    placeholder="Enter account number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    value={bankForm.accountType}
                    onChange={(e) => setBankForm({...bankForm, accountType: e.target.value})}
                    className="input-box"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bankForm.balance}
                    onChange={(e) => setBankForm({...bankForm, balance: e.target.value})}
                    className="input-box"
                    placeholder="Enter current balance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={bankForm.currency}
                    onChange={(e) => setBankForm({...bankForm, currency: e.target.value})}
                    className="input-box"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex space-x-4">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Saving...' : (editingBankId ? 'Update Account' : 'Add Account')}
                  </button>
                  {editingBankId && (
                    <button type="button" onClick={cancelEdit} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Bank Accounts List */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100">
              <h3 className="text-xl font-semibold text-purple-800 mb-6">Your Bank Accounts</h3>
              
              {bankAccounts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bank accounts added yet.</p>
              ) : (
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div key={account._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{account.bankName}</h4>
                          <p className="text-sm text-gray-600">Account: {account.accountNumber}</p>
                          <p className="text-sm text-gray-600">
                            Type: {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} | 
                            Balance: {account.currency} {account.balance.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditBank(account)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBank(account._id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Profile);

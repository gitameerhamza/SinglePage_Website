import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Dashboard = ({ user, auth }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    totalDownloads: 0,
    lastDownload: null
  });

  // Available file packages
  const filePackages = [
    {
      id: 'package1',
      name: '📦 Basic Package',
      description: 'Basic files and resources',
      size: '50 MB',
      icon: '📁'
    },
    {
      id: 'package2', 
      name: '🎯 Premium Package',
      description: 'Advanced features and tools',
      size: '150 MB',
      icon: '⭐'
    },
    {
      id: 'package3',
      name: '🚀 Complete Package',
      description: 'Sab kuch included',
      size: '300 MB',
      icon: '💎'
    }
  ];

  useEffect(() => {
    fetchUserInfo();
  }, [user]);

  const fetchUserInfo = async () => {
    try {
      const token = await user.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error('User info fetch error:', error);
      showMessage('User info load nahi ho saki!', 'error');
    }
  };

  const handleDownload = async (packageInfo) => {
    setLoading(true);
    showMessage('Download prepare ho raha hai...', 'info');

    try {
      const token = await user.getIdToken();
      const response = await axios.post(`${API_BASE_URL}/download`, 
        { fileType: packageInfo.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Create download link
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = response.data.fileName;
      link.target = '_blank'; // Open in new tab
      
      // Append to body, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update local state
      const newDownload = {
        id: Date.now(),
        packageName: packageInfo.name,
        fileName: response.data.fileName,
        timestamp: new Date().toLocaleString('en-PK', {
          timeZone: 'Asia/Karachi',
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setDownloads(prev => [newDownload, ...prev.slice(0, 4)]); // Keep only last 5
      setStats(prev => ({
        totalDownloads: prev.totalDownloads + 1,
        lastDownload: newDownload.timestamp
      }));

      showMessage(`✅ ${packageInfo.name} download started!`, 'success');
    } catch (error) {
      console.error('Download error:', error);
      const errorMsg = error.response?.data?.error || 'Download Error!';
      showMessage(`❌ ${errorMsg}`, 'error');
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showMessage('Logout Successful!', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showMessage('Logout Error!', 'error');
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>🎉 Welcome!</h1>
            <p>File download system mein aap ka welcome hai</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* User Info Card */}
        <div className="info-card user-info">
          <h2>👤 User Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">📧 Email:</span>
              <span className="value">{userInfo?.email || user.email}</span>
            </div>
            <div className="info-item">
              <span className="label">👤 Name:</span>
              <span className="value">{userInfo?.displayName || 'User'}</span>
            </div>
            <div className="info-item">
              <span className="label">✅ Status:</span>
              <span className="value verified">Active & Verified</span>
            </div>
            <div className="info-item">
              <span className="label">🆔 User ID:</span>
              <span className="value">{user.uid.substring(0, 8)}...</span>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="info-card stats-info">
          <h2>📊 Download Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.totalDownloads}</div>
              <div className="stat-label">Total Downloads</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{downloads.length}</div>
              <div className="stat-label">Recent Downloads</div>
            </div>
            <div className="stat-item">
              <div className="stat-text">{stats.lastDownload || 'Koi download nahi'}</div>
              <div className="stat-label">Last Download</div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="info-card download-section">
          <h2>📁 Available Downloads</h2>
          <p>Click the button to download any package:</p>

          <div className="packages-grid">
            {filePackages.map((pkg) => (
              <div key={pkg.id} className="package-card">
                <div className="package-icon">{pkg.icon}</div>
                <div className="package-info">
                  <h3>{pkg.name}</h3>
                  <p>{pkg.description}</p>
                  <span className="package-size">📏 Size: {pkg.size}</span>
                </div>
                <button
                  className="btn btn-download"
                  onClick={() => handleDownload(pkg)}
                  disabled={loading}
                >
                  {loading ? '⏳ Processing...' : '📥 Download'}
                </button>
              </div>
            ))}
          </div>

          {/* Message Display */}
          {message && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Recent Downloads */}
        {downloads.length > 0 && (
          <div className="info-card recent-downloads">
            <h2>📋 Recent Downloads</h2>
            <div className="downloads-list">
              {downloads.map((download) => (
                <div key={download.id} className="download-item">
                  <div className="download-info">
                    <span className="download-name">{download.packageName}</span>
                    <span className="download-file">{download.fileName}</span>
                  </div>
                  <span className="download-time">{download.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const navigate = useNavigate()

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    country: "",
    currency: "",
    phone: "",
    nextOfKin: "",
    nextOfKinPhone: "",
    subscriptionPlan: "Free",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/');
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const data = res.data;
        setFormData({
          fullname: data.fullname || "",
          email: data.email || "",
          country: data.country || "",
          currency: data.currency || "",
          phone: data.phone || "",
          nextOfKin: data.next_of_kin || "",
          nextOfKinPhone: data.next_of_kin_phone || "",
          subscriptionPlan: data.subscription_plan || "Free",
        });
        setPreviewImage(data.profile_image || null);
      })
      .catch((err) => {
        console.error("Failed to load user profile:", err);
        if (err.response?.status === 401) {
          navigate('/');
        }
      });
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/');
      return;
    }

    console.log('📋 Submitting profile data:', formData);

    const submitData = new FormData();
    for (let key in formData) {
      if (formData[key] && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    }
    if (profileImage) {
      submitData.append("profile_image", profileImage);
    }

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, submitData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });
      
      console.log('✅ Profile update response:', response.data);
      alert("Profile updated successfully!");
      
      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('❌ Profile update error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/');
      } else if (error.response?.data?.message) {
        alert(`Failed to update profile: ${error.response.data.message}`);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert("Passwords do not match");
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/');
      return;
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/users/change-password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Password updated!");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate('/');
      } else {
        alert("Password update failed.");
      }
    }
  };

  return (
    <div className="container card py-4">
      <h4 className="mb-4">Hello {formData.fullname}, Welcome back!</h4>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            Edit Profile
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
        </li>
      </ul>

      {/* EDIT PROFILE TAB */}
      {activeTab === "edit" && (
        <form onSubmit={handleProfileSubmit} encType="multipart/form-data">
          <div className="row">
            <div className="col-md-4 text-center mb-4">
              <label htmlFor="profileImage" style={{ cursor: "pointer" }}>
                <img
                  src={previewImage || "/default-avatar.png"}
                  alt="Profile"
                  className="rounded-circle mb-3"
                  width="120"
                  height="120"
                />
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="d-none"
                />
              </label>
              <p className="mb-1">
                <strong>Current Plan:</strong> {formData.subscriptionPlan}
              </p>
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => navigate('/upgrade-plan')}>
                Upgrade Plan
              </button>
            </div>

            <div className="col-md-8">
              <div className="row">
                {[
                  { name: "fullname", label: "Full Name", type: "text", required: true },
                  { name: "email", label: "Email", type: "email", required: true },
                  { name: "country", label: "Country" },
                  { name: "currency", label: "Currency" },
                  { name: "phone", label: "Phone Number" },
                  { name: "nextOfKin", label: "Next of Kin" },
                  { name: "nextOfKinPhone", label: "Next of Kin Phone" },
                ].map((field) => (
                  <div className="col-md-6 mb-3" key={field.name}>
                    <label className="form-label">{field.label}</label>
                    <input
                      type={field.type || "text"}
                      className="form-control"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleFormChange}
                      required={field.required || false}
                    />
                  </div>
                ))}
              </div>
              <button type="submit" className="btn btn-primary mt-3">
                Update Profile
              </button>
            </div>
          </div>
        </form>
      )}

      {/* PREFERENCES TAB */}
      {activeTab === "preferences" && (
        <div className="mt-4">
          <h5>Preferences</h5>
          <p>Preferences settings will be added here later.</p>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === "security" && (
        <form onSubmit={handleSecuritySubmit} className="col-md-6 mt-4">
          <div className="mb-3">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              className="form-control"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              className="form-control"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-warning">
            Change Password
          </button>
        </form>
      )}
    </div>
  );
};

export default EditProfile;

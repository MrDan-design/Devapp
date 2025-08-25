import EditProfile from '../../layout/EditProfile';
import PageWrapper from '../../components/PageWrapper';

const Settings = () => {
  return (
    <PageWrapper>
      <div className="settings-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-dark">Settings</h2>
          <small className="text-muted">Manage your account settings and profile information</small>
        </div>
        
        <div className="bg-white rounded shadow-sm">
          <EditProfile />
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;
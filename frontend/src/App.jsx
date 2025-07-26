import { useState } from 'react';
import './assets/react.svg';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Preloader from './components/Preloader';
import AppRouter from './router/AppRouter';
// import SupabaseSignupProfileForm from './components/SupabaseSignupProfileForm'

const App = () => {
  const [loadingDone, setLoadingDone] = useState(false);

  return (
    <>
      {!loadingDone && <Preloader onFinish={() => setLoadingDone(true)} />}
      {loadingDone && <>
        {/* <SupabaseSignupProfileForm /> */}
        {/* <SupabaseAuthForm /> */}
        <AppRouter />
        <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </>}
    </>
  );
};

export default App;

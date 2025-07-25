import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/tes.png'
//import './App.css'

import Preloader from './components/Preloader'
import AppRouter from './router/AppRouter'
import SupabaseAuthForm from './components/SupabaseAuthForm'
import SupabaseSignupProfileForm from './components/SupabaseSignupProfileForm'

const App = () => {
  const [loadingDone, setLoadingDone] = useState(false);

  return (
    <>
      {!loadingDone && <Preloader onFinish={() => setLoadingDone(true)} />}
      {loadingDone && <>
        <SupabaseSignupProfileForm />
        <SupabaseAuthForm />
        <AppRouter />
      </>}
    </>
  );
};

export default App;

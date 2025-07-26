import { useState } from 'react'
import './assets/react.svg'
//import './App.css'

import Preloader from './components/Preloader'
import AppRouter from './router/AppRouter'
// import SupabaseAuthForm from './components/SupabaseAuthForm'
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
      </>}
    </>
  );
};

export default App;

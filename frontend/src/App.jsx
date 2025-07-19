import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
//import './App.css'
import Preloader from './components/Preloader'
import AppRouter from './router/AppRouter'

const App = () => {
  const [loadingDone, setLoadingDone] = useState(false);

  return (
    <>
      {!loadingDone && <Preloader onFinish={() => setLoadingDone(true)} />}
      {loadingDone && <AppRouter />}
    </>
  );
};

export default App;

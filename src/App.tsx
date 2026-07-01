import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { ParticipantsProvider } from './context/Participants'
import { HomeScreen } from './screens/HomeScreen'
import { NewGameScreen } from './screens/NewGameScreen'
import { GameScreen } from './screens/GameScreen'
import { GameOverScreen } from './screens/GameOverScreen'
import { StatsScreen } from './screens/StatsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { ProfilesScreen } from './screens/ProfilesScreen'
import { AtcSetupScreen } from './screens/AtcSetupScreen'
import { AroundTheClockScreen } from './screens/AroundTheClockScreen'
import { ShanghaiSetupScreen } from './screens/ShanghaiSetupScreen'
import { ShanghaiScreen } from './screens/ShanghaiScreen'
import { CricketSetupScreen } from './screens/CricketSetupScreen'
import { CricketScreen } from './screens/CricketScreen'
import { CheckoutSetupScreen } from './screens/CheckoutSetupScreen'
import { CheckoutScreen } from './screens/CheckoutScreen'

function App() {
  return (
    <ParticipantsProvider>
    <BrowserRouter basename="/darts-app">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/new-game" element={<NewGameScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/game-over" element={<GameOverScreen />} />
        <Route path="/stats" element={<StatsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/profiles" element={<ProfilesScreen />} />
        <Route path="/training/atc" element={<AtcSetupScreen />} />
        <Route path="/training/atc/play" element={<AroundTheClockScreen />} />
        <Route path="/training/shanghai" element={<ShanghaiSetupScreen />} />
        <Route path="/training/shanghai/play" element={<ShanghaiScreen />} />
        <Route path="/training/cricket" element={<CricketSetupScreen />} />
        <Route path="/training/cricket/play" element={<CricketScreen />} />
        <Route path="/training/checkout" element={<CheckoutSetupScreen />} />
        <Route path="/training/checkout/play" element={<CheckoutScreen />} />
      </Routes>
    </BrowserRouter>
    </ParticipantsProvider>
  )
}

export default App

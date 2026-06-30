import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { HomeScreen } from './screens/HomeScreen'
import { NewGameScreen } from './screens/NewGameScreen'
import { GameScreen } from './screens/GameScreen'
import { GameOverScreen } from './screens/GameOverScreen'
import { StatsScreen } from './screens/StatsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { ProfilesScreen } from './screens/ProfilesScreen'

function App() {
  return (
    <BrowserRouter basename="/darts-app">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/new-game" element={<NewGameScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/game-over" element={<GameOverScreen />} />
        <Route path="/stats" element={<StatsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/profiles" element={<ProfilesScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

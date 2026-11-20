import { ChatScreen } from './components/ChatScreen'
import { JoinScreen } from './components/JoinScreen'
import { Toasts } from './components/Toasts'
import { useChatStore } from './stores/chat'

export default function App() {
  const me = useChatStore((state) => state.me)
  return (
    <>
      {me ? <ChatScreen /> : <JoinScreen />}
      <Toasts />
    </>
  )
}

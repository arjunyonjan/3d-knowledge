export default function StartButton({ visible, onClick }) {
  if (!visible) return null
  return <button id="start-btn" onClick={onClick}>▶ START JOURNEY</button>
}

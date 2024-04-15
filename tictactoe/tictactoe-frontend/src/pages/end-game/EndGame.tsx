import { useAppStore } from "../../stores/app-store"

export default function EndGame({ text }: { text: string }) {
  const { setStage } = useAppStore()

  const outcomeStyles = () => {
    switch (text) {
      case "DRAW_STRING":
        return "bg-yellow-200 text-yellow-800"
      case "WON_STRING":
        return "bg-green-500 text-white"
      case "LOST_STRING":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-200 text-black"
    }
  }

  return (
    <div
      className={`h-screen flex items-center justify-center ${outcomeStyles()}`}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">{text}</h1>
        <button
          onClick={() => setStage("login")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Play again
        </button>
      </div>
    </div>
  )
}

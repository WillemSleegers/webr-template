import { Histogram } from "./components/Histogram"
import { ScatterPlot } from "./components/ScatterPlot"

const App = () => {
  return (
    <div className="p-8 m-auto" style={{ maxWidth: "1000px" }}>
      <h1 className="m-5 text-4xl font-bold text-center">
        Vite + React + TypeScript + WebR
      </h1>
      <div style={{ height: "400px" }}>
        <Histogram dataSet="iris" />
      </div>
      {/* <ScatterPlot dataSet="iris" /> */}
    </div>
  )
}

export default App

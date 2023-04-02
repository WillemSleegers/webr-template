import { Histogram } from "./components/Histogram"
import { ScatterPlot } from "./components/ScatterPlot"

const App = () => {
  return (
    <div className="my-8 p-8 m-auto" style={{ maxWidth: "768px" }}>
      <h1 className="my-5 text-4xl font-bold text-center">
        Vite + React + TypeScript + WebR
      </h1>
      <div>
        <h2 className="my-5 text-2xl font-bold">Histogram</h2>
        <div style={{ height: "450px" }}>
          <Histogram dataSet="iris" />
        </div>
      </div>
      <div style={{ height: "500px" }}>
        <h2 className="my-5 text-2xl font-bold">Scatter plot</h2>
        <ScatterPlot dataSet="iris" />
      </div>
    </div>
  )
}

export default App

import { useState, useEffect } from "react"
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import "./App.css"
import { WebR } from "@r-wasm/webr"
import { WebRDataJsNode, WebRDataJsAtomic } from "@r-wasm/webr/robj"
import { Spinner } from "./components/Spinner"
const webR = new WebR()

const App = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ x: number | null; y: number | null }[]>()

  useEffect(() => {
    async function installPackage() {
      await webR.init()
      await webR.installPackages(["dplyr"])
      await webR.evalR("library(dplyr)")
    }
    //installPackage()
  }, [])

  useEffect(() => {
    async function runRCode() {
      await webR.init()
      const rnorm = await webR.evalR("iris")
      try {
        const result = (await rnorm.toJs()) as WebRDataJsNode
        const column1 = result.values[0] as WebRDataJsAtomic<number>
        const column2 = result.values[1] as WebRDataJsAtomic<number>

        console.log(result.names)

        const data = column1.values.map((x, i) => {
          return {
            x: x,
            y: column2.values[i],
          }
        })

        setData(data)
      } finally {
        setLoading(false)
        webR.destroy(rnorm)
      }
    }
    runRCode()
  }, [])

  return (
    <div className="App">
      <h1>Vite + React + TypeScript + WebR</h1>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="Sepal.Length" />
          <YAxis type="number" dataKey="y" name="Sepal.Width" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="Sepal Scatter Plot" data={data} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
      {loading && <Spinner />}
    </div>
  )
}

export default App

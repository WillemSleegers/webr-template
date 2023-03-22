import { useState, useEffect } from "react"
import { LineChart, Line } from "recharts"
import reactLogo from "./assets/react.svg"
import viteLogo from "/vite.svg"
import "./App.css"
import { WebR } from "@r-wasm/webr"
import { WebRDataJsAtomic } from "@r-wasm/webr/robj"
const webR = new WebR()

function App() {
  const [result, updateResult] = useState<(number | null)[]>()
  const data = [{ name: "Page A", uv: 400, pv: 2400, amt: 2400 }]

  useEffect(() => {
    async function installPackage() {
      await webR.init()
      await webR.installPackages(["dplyr"])
      await webR.evalR("library(dplyr)")
    }
    installPackage()
  }, [])

  useEffect(() => {
    async function runRCode() {
      await webR.init()
      const rnorm = await webR.evalR("iris")
      try {
        const result = (await rnorm.toJs()) as WebRDataJsAtomic<number>
        console.log(result)
        updateResult(result.values)
      } finally {
        webR.destroy(rnorm)
      }
    }
    runRCode()
  }, [])

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <p>Result of running R code: {result && result.join(",")}</p>
      </div>
      <LineChart width={400} height={400} data={data}>
        <Line type="monotone" dataKey="uv" stroke="#8884d8" />
      </LineChart>
    </div>
  )
}

export default App

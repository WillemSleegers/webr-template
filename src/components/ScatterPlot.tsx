import { WebR } from "@r-wasm/webr"
import { WebRDataJsNode, WebRDataJsAtomic } from "@r-wasm/webr/robj"
import { useEffect, useState, ChangeEvent } from "react"
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Scatter } from "react-chartjs-2"
import { Select } from "./Select"
import { Spinner } from "./Spinner"

const webR = new WebR()

Chart.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend)

type ScatterPlotProps = {
  dataSet: string
}

const ScatterPlot = (props: ScatterPlotProps) => {
  const { dataSet } = props

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<WebRDataJsNode>()
  const [columnNames, setColumnNames] = useState<string[]>()
  const [scatterData, setScatterData] =
    useState<{ x: number | null; y: number | null }[]>()
  const [xColumn, setXColumn] = useState<string>()
  const [yColumn, setYColumn] = useState<string>()

  useEffect(() => {
    async function loadData() {
      await webR.init()
      const webRData = await webR.evalR(dataSet)
      try {
        const webRDataJs = (await webRData.toJs()) as WebRDataJsNode
        setData(webRDataJs)
      } finally {
        webR.destroy(webRData)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (data) {
      const names = data.names
      const values = data.values

      if (names) {
        const columns = names.filter((name, i): name is string => {
          const value = values[i] as WebRDataJsAtomic<any[]>
          return name !== null && value.type == "double"
        })

        if (columns.length > 1) {
          setColumnNames(columns)
          setXColumn(columns[0])
          setYColumn(columns[1])
        }
      }
    }
  }, [data])

  useEffect(() => {
    if (data && xColumn && yColumn) {
      const xIndex = data.names!.findIndex((e) => e == xColumn)
      const yIndex = data.names!.findIndex((e) => e == yColumn)

      const column1 = data.values[xIndex] as WebRDataJsAtomic<number>
      const column2 = data.values[yIndex] as WebRDataJsAtomic<number>

      const scatterData = column1.values.map((x, i) => {
        return {
          x: x,
          y: column2.values[i],
        }
      })

      setScatterData(scatterData)
      setIsLoading(false)
    }
  }, [data, xColumn, yColumn])

  const handleXColumn = (e: ChangeEvent<HTMLSelectElement>) => {
    setXColumn(e.target.value)
  }
  const handleYColumn = (e: ChangeEvent<HTMLSelectElement>) => {
    setYColumn(e.target.value)
  }

  return (
    <div className="h-full">
      <Scatter
        className=""
        options={{
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: xColumn,
              },
              type: "linear",
              offset: false,
              grid: {
                offset: false,
              },
              ticks: {
                stepSize: 1,
              },
            },
            y: {
              title: {
                display: true,
                text: yColumn,
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {},
            },
          },
        }}
        data={{
          labels: ["x", "y", "z"],
          datasets: [
            {
              label: dataSet,
              data: scatterData,
            },
          ],
        }}
      />

      {isLoading && <Spinner />}

      {xColumn && yColumn && (
        <div className="min-w-0">
          <Select
            label="X:"
            options={columnNames}
            defaultOption={xColumn}
            handleChange={handleXColumn}
          />
          <Select
            label="Y:"
            options={columnNames}
            defaultOption={yColumn}
            handleChange={handleYColumn}
          />
        </div>
      )}
    </div>
  )
}

export { ScatterPlot }

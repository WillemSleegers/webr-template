import { WebR } from "@r-wasm/webr"
import { WebRDataJsNode, WebRDataJsAtomic } from "@r-wasm/webr/robj"
import { useEffect, useState, ChangeEvent } from "react"
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import { Select } from "./Select"
import { Spinner } from "./Spinner"

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
)

type HistogramProps = {
  webR: WebR
  dataSet: string
}

const Histogram = (props: HistogramProps) => {
  const { webR, dataSet } = props

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<WebRDataJsNode>()
  const [columnNames, setColumnNames] = useState<string[]>()
  const [column, setColumn] = useState<string>()
  const [plotData, setPlotData] =
    useState<{ x: number | null; y: number | null }[]>()

  async function loadHistogramData() {
    await webR.init()
    const webRData = await webR.evalR(
      `hist(${dataSet}$${column}, plot = FALSE)`
    )
    try {
      const webRDataJs = (await webRData.toJs()) as WebRDataJsNode
      console.log(webRDataJs)
      const counts = webRDataJs.values[1] as WebRDataJsAtomic<number>
      const mids = webRDataJs.values[3] as WebRDataJsAtomic<number>

      if (mids && counts) {
        const coords = mids.values.map((x, i) => {
          return {
            x: x,
            y: counts.values[i],
          }
        })
        setPlotData(coords)
      }
    } finally {
      webR.destroy(webRData)
    }
  }

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
    if (data && data.names) {
      const columns = data.names.filter((name, i): name is string => {
        const value = data.values[i] as WebRDataJsAtomic<any[]>
        return name !== null && value.type == "double"
      })

      if (columns.length > 1) {
        setColumnNames(columns)
        setColumn(columns[0])
      }
    }
  }, [data])

  useEffect(() => {
    if (data && column) {
      setIsLoading(false)
      loadHistogramData()
    }
  }, [data, column])

  const handleColumn = (e: ChangeEvent<HTMLSelectElement>) => {
    setColumn(e.target.value)
  }

  return (
    <div className="h-full">
      <Bar
        className=""
        options={{
          responsive: true,
          scales: {
            x: {
              type: "linear",
              offset: false,
              grid: {
                offset: false,
              },
              ticks: {
                stepSize: 1,
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: (items) => {
                  if (!items.length) {
                    return ""
                  }
                  const item = items[0]
                  const x = item.parsed.x
                  const min = x - 0.25
                  const max = x + 0.25
                  return `Bin: ${min} - ${max}`
                },
              },
            },
          },
        }}
        data={{
          labels: ["x", "y", "z"],
          datasets: [
            {
              label: "Count",
              data: plotData,

              borderWidth: 0,
              barPercentage: 1,
              categoryPercentage: 1,
              borderRadius: 0,
            },
          ],
        }}
      />
      <div>
        {column && (
          <Select
            label="X:"
            options={columnNames}
            defaultOption={column}
            handleChange={handleColumn}
          />
        )}
        {isLoading && <Spinner />}
      </div>
    </div>
  )
}

export { Histogram }

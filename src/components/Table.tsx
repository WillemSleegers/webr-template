import { WebR } from "@r-wasm/webr"
import { WebRDataJsAtomic, WebRDataJsNode } from "@r-wasm/webr/robj"
import { useEffect, useState } from "react"
import { useTable, usePagination } from "react-table"
import { Spinner } from "./Spinner"

type TableProps = {
  webR: WebR
  dataSet: string
}

type ColumnProps = {
  Header: string
  accessor: string
}

const Table = (props: TableProps) => {
  const { webR, dataSet } = props

  const [columns, setColumns] = useState<ColumnProps[]>([])
  const [data, setData] = useState<{ [key: string]: any }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      await webR.init()
      const webRData = await webR.evalR(dataSet)
      try {
        const webRDataJs = (await webRData.toJs()) as WebRDataJsNode
        const webRDataNames = webRDataJs.names
        const webRDataValues = webRDataJs.values as WebRDataJsAtomic<any[]>[]

        if (webRDataNames && webRDataValues.length > 0) {
          const cols = webRDataNames.filter(Boolean).map((name, i) => {
            return {
              Header: name,
              accessor: "col" + i,
            }
          })
          setColumns(cols)

          const d = webRDataValues[0].values.map((value, i) => {
            const keys = webRDataNames.map((name, j) => "col" + j)
            const vals = webRDataValues.map((e) => e.values[i])

            var result: { [id: string]: any } = {}
            keys.forEach((key, i) => (result[key] = vals[i]))

            return result
          })
          setData(d)
          setIsLoading(false)
        }
      } finally {
        webR.destroy(webRData)
      }
    }
    loadData()
  }, [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
    },
    usePagination
  )

  return (
    <>
      {isLoading && <Spinner />}
      {data.length > 0 && (
        <div className="">
          <table className="w-full overflow-auto mb-3" {...getTableProps()}>
            <caption className="text-left">Table: {dataSet} dataset</caption>
            <thead className="font-medium bg-gray-100 border-b rounded">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      className="text-left px-2 py-1"
                      {...column.getHeaderProps()}
                    >
                      {column.render("Header")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row)
                return (
                  <tr className="border-b" {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      return (
                        <td className="px-2 py-1 " {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="pagination m-1 flex gap-2 justify-between items-center flex-wrap">
            <span>
              Page <strong>{pageIndex + 1}</strong> of{" "}
              <strong>{pageOptions.length}</strong>{" "}
            </span>
            <div className="">
              <button
                className="py-1 px-2 appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-s outline-offset-0"
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
              >
                {"<<"}
              </button>{" "}
              <button
                className="py-1 px-2 appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm"
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                {"<"}
              </button>{" "}
              <button
                className="py-1 px-2 appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm"
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                {">"}
              </button>{" "}
              <button
                className="py-1 px-2 appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-e "
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
              >
                {">>"}
              </button>{" "}
            </div>
            <div>
              <label className="me-2">Show:</label>
              <select
                className="py-1 px-2 appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                }}
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export { Table }

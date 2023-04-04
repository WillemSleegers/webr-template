import { WebR } from "@r-wasm/webr"
import { WebRDataJsAtomic, WebRDataJsNode } from "@r-wasm/webr/robj"
import { useEffect, useState } from "react"
import { Column, useTable, usePagination } from "react-table"

type TableProps = {
  webR: WebR
  dataSet: string
}

const Table = (props: TableProps) => {
  const { webR, dataSet } = props

  const [columns, setColumns] = useState<
    { Header: string; accessor: string }[]
  >([])
  const [data, setData] = useState<{ [key: string]: any }[]>([])

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
      {data.length > 0 && (
        <div className="border rounded-md">
          <table className="min-w-full border-b" {...getTableProps()}>
            <thead className="border-b font-medium bg-gray-50">
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
              {page.map((row, i) => {
                prepareRow(row)
                return (
                  <tr className="even:bg-gray-50" {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      return (
                        <td className="px-2 py-1" {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="pagination m-1">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
              {"<<"}
            </button>{" "}
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>
              {"<"}
            </button>{" "}
            <button onClick={() => nextPage()} disabled={!canNextPage}>
              {">"}
            </button>{" "}
            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            >
              {">>"}
            </button>{" "}
            <span>
              Page{" "}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{" "}
            </span>
            <span>
              | Go to page:{" "}
              <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0
                  gotoPage(page)
                }}
                style={{ width: "100px" }}
              />
            </span>{" "}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  )
}

export { Table }

import { Droppable } from 'react-beautiful-dnd'
import { EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/outline'
import React, { type PropsWithChildren } from 'react'
import { type Card } from '@/types'
import { type ColumnColor, ColumnPosition, Permission, SwapDirection } from '@/Enums'
import { router } from '@inertiajs/react'
import { getPermissionLevel } from '@/Utils'

interface Props {
  columnId: string
  name: string
  order: number
  position: ColumnPosition
  color: ColumnColor
  cards: Card[]
  permissionLevel: number
  clickEditHandler: (id: string) => void
  clickCreateCardHandler: (columnId: string) => void
}

function getColumnBg(name: string) {
  switch (name) {
    case 'TO_DO':
    case 'To Do':
      return 'bg-green-50'
    case 'Done':
      return 'bg-blue-50'
    case 'In Progress':
      return 'bg-orange-50'
    default:
      return 'bg-gray-50'
  }
}
function getBarColor(name: string) {
  switch (name) {
    case 'TO_DO':
    case 'To Do':
      return 'bg-green-400'
    case 'Done':
      return 'bg-blue-400'
    case 'In Progress':
      return 'bg-orange-400'
    default:
      return 'bg-gray-200'
  }
}

export default function ColumnCard({
  columnId, name, order, position, color,
  permissionLevel, clickEditHandler, children, clickCreateCardHandler
}: PropsWithChildren<Props>) {
  const isFirstColumn = position === ColumnPosition.First
  const isLastColumn = position === ColumnPosition.Last

  const handleSwap = (direction: SwapDirection) => {
    router.patch(route('web.columns.swap', columnId), { order: order + direction }, {
      onFinish: () => router.reload({ only: ['columns'] })
    })
  }

  const handleClickDelete = () => {
    router.delete(route('web.columns.destroy', columnId), {
      onFinish: () => router.reload({ only: ['columns'] })
    })
  }

  return (
    <div className={`flex-none w-80 mb-8 rounded-2xl shadow-xl border border-gray-200 transition-transform hover:-translate-y-2 hover:shadow-2xl duration-200 ${getColumnBg(name)}`}>
      <div className={`h-3 rounded-t-2xl ${getBarColor(name)}`}></div>
      <div className="card-body !mt-0">
        <div className="flex justify-between items-center mb-2">
          <h2 className="card-title text-xl font-extrabold tracking-tight text-gray-800">{name}</h2>
          <div className="space-x-2">
            {permissionLevel <= getPermissionLevel(Permission.CardOperator) && (
              <button
                className="btn btn-circle btn-sm bg-white hover:bg-gray-100 shadow"
                onClick={() => clickCreateCardHandler(columnId)}
                title="Add new card"
                aria-label="Add new card"
              >
                <PlusIcon className="h-5 w-5 text-gray-700" />
              </button>
            )}
            {permissionLevel <= getPermissionLevel(Permission.LimitedAccess) && (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-circle btn-sm bg-white hover:bg-gray-100 shadow"
                  aria-label="More column options"
                >
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-700" />
                </div>
                <ul
                  tabIndex={0}
                  className="p-0 shadow menu menu-sm dropdown-content z-30 bg-white rounded-box w-36 border"
                >
                  <li>
                    <button onClick={() => clickEditHandler(columnId)} aria-label="Edit column">
                      Edit
                    </button>
                  </li>
                  <li className={isLastColumn ? 'disabled' : ''}>
                    <button
                      onClick={() => handleSwap(SwapDirection.Right)}
                      disabled={isLastColumn}
                      aria-label="Swap column to right"
                    >
                      Swap to Right
                    </button>
                  </li>
                  <li className={isFirstColumn ? 'disabled' : ''}>
                    <button
                      onClick={() => handleSwap(SwapDirection.Left)}
                      disabled={isFirstColumn}
                      aria-label="Swap column to left"
                    >
                      Swap to Left
                    </button>
                  </li>
                  <li>
                    <button className="text-error" onClick={handleClickDelete} aria-label="Delete column">
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <Droppable droppableId={columnId}>
          {(provided) => (
            <div
              className="flex flex-col gap-4 min-h-[100px] px-1 pb-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {children}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  )
}
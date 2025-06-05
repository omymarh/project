import React from 'react'
import { formatFromNow } from '@/Utils/datetime'
import { router } from '@inertiajs/react'
import BoardOptionDropdown from '@/Components/BoardOptionDropdown'

interface Props {
  id: string
  aliasId: string
  name: string
  thumbnailUrl?: string
  owner: string
  openedAt: string
  index: number // Pour drag & drop
}

function getBarColor(name: string) {
  switch (name) {
    case 'To Do':
      return 'bg-gradient-to-r from-green-400 to-green-600'
    case 'In Progress':
      return 'bg-gradient-to-r from-orange-400 to-yellow-500'
    case 'Done':
      return 'bg-gradient-to-r from-blue-500 to-blue-800'
    default:
      return 'bg-gradient-to-r from-purple-400 to-pink-500'
  }
}

export default function BoardCard({
  id, aliasId, name, owner, openedAt, index
}: Props) {
  return (
    <div
      onClick={() => { router.visit(route('web.page.board.show', aliasId)) }}
      className="card card-compact w-72 bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-200 flex-none rounded-2xl hover:-translate-y-1 active:scale-95 cursor-pointer border border-gray-100 hover:border-primary-300"
      style={{ minHeight: 180 }}
    >
      <div className={`h-3 rounded-t-2xl ${getBarColor(name)}`}></div>
      <div className="card-body pb-4 pt-5">
        <div className="flex justify-between items-center mb-2">
          <h2 className="card-title text-lg font-extrabold text-gray-800 dark:text-white drop-shadow">{name}</h2>
          <BoardOptionDropdown boardId={id} boardAliasId={aliasId} />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-300 mb-2">
          <span className="font-semibold">{owner}</span>
          {" — "}
          <span>{formatFromNow(openedAt)}</span>
        </div>
      </div>
    </div>
  )
}
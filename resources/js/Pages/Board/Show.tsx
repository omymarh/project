import React, { type JSX, useEffect, useState } from 'react';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';
import ColumnCard from '@/Components/ColumnCard';
import { ColumnPosition, Permission } from '@/Enums';
import MainLayout from '@/Layouts/MainLayout';
import { type Board, type Card, type Column, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import CreateColumnModal from '@/Components/Modal/CreateColumnModal';
import EditColumnModal from '@/Components/Modal/EditColumnModal';
import CreateCardModal from '@/Components/Modal/CreateCardModal';
import EditCardModal from '@/Components/Modal/EditCardModal';
import TaskCard from '@/Components/TaskCard';
import { getPermissionLevel } from '@/Utils';
import ActiveUser from '@/Components/ActiveUser';
import GuestableMainLayout from '@/Layouts/GuestableMainLayout';

export interface BoardShowProps {
  auth: { user: User | null };
  board: Board;
  columns: ColumnWithCards[];
  permission: Permission;
}

type ColumnWithCards = Column & { cards: Card[] };

enum ActiveModal {
  None,
  CreateColumn,
  EditColumn,
  CreateCard,
  EditCard,
}

interface Presence {
  createdAt: number;
  users: User[];
}

export default function Show({ auth, board, columns, permission }: BoardShowProps): JSX.Element {
  const [activeModal, setActiveModal] = useState(ActiveModal.None);
  const [editingColumn, setEditingColumn] = useState('');
  const [editingCard, setEditingCard] = useState('');
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  const sortedColumns = columns.toSorted((a, b) => a.order - b.order);
  const permissionLevel = getPermissionLevel(permission);

  useEffect(() => {
    const presenceLocalStorage = window.sessionStorage.getItem(`board.${board.id}.presence`);
    if (presenceLocalStorage !== null) {
      const parsed: Presence = JSON.parse(presenceLocalStorage);
      setActiveUsers(parsed.users);
    }

    window.Echo.join(`board.${board.id}`)
      .here((users: User[]) => {
        setActiveUsers(auth.user !== null ? users.filter((user) => user.id !== auth.user?.id) : users);
      })
      .joining((user: User) => {
        setActiveUsers((prev) => {
          if (prev.find((item) => item.id === user.id) === undefined) {
            prev.push(user);
          }
          return prev;
        });
      })
      .leaving((user: User) => {
        setActiveUsers((prev) => prev.filter((item) => item.id !== user.id));
      })
      .error((error: User) => {
        console.error(error);
      });

    window.Echo.private(`board.${board.id}`)
      .listen('BoardChangedEvent', () => {
        router.reload();
      });
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(`board.${board.id}.presence`, JSON.stringify({
      createdAt: Date.now(),
      users: activeUsers,
    }));
  }, [activeUsers]);

  const getColumnPosition = (order: number): ColumnPosition => {
    if (order === 0) return ColumnPosition.First;
    if (order === columns.length - 1) return ColumnPosition.Last;
    return ColumnPosition.Middle;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    router.patch(
      route('web.cards.move', draggableId),
      {
        columnId: destination.droppableId,
        order: destination.index,
      },
      {
        onFinish: () => router.reload({ only: ['columns'] }),
      }
    );
  };

  const Content = (): JSX.Element => (
    <>
      <Head title={board.name} />
      <section className="flex-1 flex flex-col">
        <header className="px-6 pt-8 pb-2 flex justify-between">
          <h1 className="font-bold text-2xl text-gray-900 dark:text-gray-100">{board.name}</h1>
          <div className="flex gap-4 items-center">
            <ActiveUser users={activeUsers} />
            <div className="space-x-2">
              {permissionLevel <= getPermissionLevel(Permission.FullAccess) && (
                <Link
                  href={route('web.page.board.edit', board.aliasId)}
                  className="btn btn-outline btn-sm"
                  as="button"
                >
                  Settings
                </Link>
              )}
              {permissionLevel <= getPermissionLevel(Permission.LimitedAccess) && (
                <button
                  className="btn btn-neutral btn-sm"
                  onClick={() => {
                    setActiveModal(ActiveModal.CreateColumn);
                  }}
                >
                  Add Column
                </button>
              )}
            </div>
          </div>
        </header>
        <div className="p-6 flex gap-4 items-start flex-1 flex-nowrap overflow-x-auto overflow-y-hidden">
          {columns.length === 0 ? (
            <div className="flex-1 self-stretch flex flex-col gap-4 justify-center items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Your board is empty</p>
              <button
                className="btn btn-neutral btn-outline btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  router.post(route('web.boards.columns.generate', board.id));
                }}
              >
                Generate Starter
              </button>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              {sortedColumns.map((column) => (
                <ColumnCard
                  key={column.id}
                  columnId={column.id}
                  name={column.name}
                  order={column.order}
                  position={getColumnPosition(column.order)}
                  cards={column.cards}
                  color={
                    column.name === 'To Do' ? '#F59E0B' :
                    column.name === 'In Progress' ? '#3B82F6' :
                    column.name === 'Review' ? '#10B981' :
                    column.name === 'Completed' ? '#EF4444' : column.color
                  }
                  permissionLevel={permissionLevel}
                  clickEditHandler={(id) => {
                    setEditingColumn(id);
                    setActiveModal(ActiveModal.EditColumn);
                  }}
                  clickCreateCardHandler={(columnId) => {
                    setEditingColumn(columnId);
                    setActiveModal(ActiveModal.CreateCard);
                  }}
                >
                  {column.cards.map((card, index) => (
                    <TaskCard
                      key={card.id}
                      taskId={card.id}
                      body={card.body}
                      color={
                        column.name === 'To Do' ? '#F59E0B' :
                        column.name === 'In Progress' ? '#3B82F6' :
                        column.name === 'Review' ? '#10B981' :
                        column.name === 'Completed' ? '#EF4444' : card.color
                      }
                      columnId={column.id}
                      columnPosition={getColumnPosition(column.order)}
                      permissionLevel={permissionLevel}
                      clickEditHandler={(id) => {
                        setEditingCard(id);
                        setActiveModal(ActiveModal.EditCard);
                      }}
                      index={index}
                    />
                  ))}
                </ColumnCard>
              ))}
            </DragDropContext>
          )}
        </div>
        <CreateColumnModal
          active={activeModal === ActiveModal.CreateColumn}
          closeHandler={() => {
            setActiveModal(ActiveModal.None);
          }}
        />
        <EditColumnModal
          active={activeModal === ActiveModal.EditColumn}
          closeHandler={() => {
            setActiveModal(ActiveModal.None);
            setEditingColumn('');
          }}
          columnId={editingColumn}
        />
        <CreateCardModal
          active={activeModal === ActiveModal.CreateCard}
          closeHandler={() => {
            setActiveModal(ActiveModal.None);
          }}
          selectingColumnId={editingColumn}
        />
        <EditCardModal
          active={activeModal === ActiveModal.EditCard}
          closeHandler={() => {
            setActiveModal(ActiveModal.None);
            setEditingCard('');
          }}
          cardId={editingCard}
        />
      </section>
    </>
  );

  return auth.user !== null ? (
    <MainLayout user={auth.user}>
      <Content />
    </MainLayout>
  ) : (
    <GuestableMainLayout>
      <Content />
    </GuestableMainLayout>
  );
}
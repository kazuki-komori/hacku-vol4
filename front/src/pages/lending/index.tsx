import { add, isAfter, isBefore } from 'date-fns'
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState, useEffect, Fragment } from 'react'
import {
  useBorrowingInfo,
  useLendingInfo,
  usePostHaveReturned,
} from '~/adaptor/lendingInfoHooks'
import BottomBar from '~/components/BottomBar'
import Chip from '~/components/Chip'
import HrWithMessage from '~/components/HrWithMessage'
import Icon from '~/components/Icon/Icon'
import LendingItemBox from '~/components/LendingItemBox'
import Meta from '~/components/Meta'
import Modal from '~/components/Modal'
import {
  BorrowingInfo,
  ConcludedLendingInfo,
  LendingInfo,
} from '~/types/lendingInfo'
import { formatDate } from '~/util/formatDate'

type Filter = 'all' | 'lending' | 'borrowing'

type Props = {
  currentlyCreatedlendingId: string | null
  isFirstVisit: boolean | null
}

const DEADLINE_BORDER = 3

// TODO: 仮データ
// const borrowingList: BorrowingInfo[] = [
//   {
//     lendingId: '0003',
//     content: '微積のノート',
//     deadline: new Date(2020, 10, 10),
//     ownerName: '山田太郎',
//     kind: 'borrowing' as const,
//   },
//   {
//     lendingId: '0004',
//     content: 'マンガ',
//     deadline: new Date(2021, 2, 13),
//     ownerName: '田中次郎',
//     kind: 'borrowing' as const,
//   },
//   {
//     lendingId: '0005',
//     content: '微分積分学続論の第10回の授業ノート',
//     deadline: new Date(2021, 2, 15),
//     ownerName: '田中次郎',
//     kind: 'borrowing' as const,
//   },
// ]
// const lendingList: LendingInfo[] = [
//   {
//     lendingId: '0001',
//     content: '微積のノート',
//     deadline: new Date(2021, 2, 14),
//     borrowerName: '山田太郎',
//     kind: 'lending' as const,
//     status: 'concluded' as const,
//   },
//   {
//     lendingId: '0006',
//     content: '微分積分学続論の第10回の授業ノート',
//     deadline: new Date(2021, 2, 14),
//     borrowerName: '山田太郎',
//     kind: 'lending' as const,
//     status: 'concluded' as const,
//   },
//   {
//     lendingId: '0007',
//     content: 'マンガ',
//     deadline: new Date(2021, 2, 14),
//     borrowerName: '山田太郎',
//     kind: 'lending' as const,
//     status: 'concluded' as const,
//   },
//   {
//     lendingId: '0002',
//     content: '微分積分学続論の第10回の授業ノート',
//     deadline: new Date(2021, 6, 15),
//     kind: 'lending' as const,
//     status: 'waiting' as const,
//   },
// ]

const LendingListPage: React.FC<Props> = ({
  currentlyCreatedlendingId,
  // isFirstVisit,
}) => {
  const router = useRouter()
  const filter: Filter =
    router.query.mode === 'return'
      ? 'lending'
      : router.query.filter == null
      ? 'all'
      : router.query.filter === 'lending'
      ? 'lending'
      : router.query.filter === 'borrowing'
      ? 'borrowing'
      : 'all'

  const isReturnMode = router.query.mode === 'return'

  const { data: lendingList } = useLendingInfo()
  const { data: borrowingList } = useBorrowingInfo()
  const postHaveReturned = usePostHaveReturned()

  const [isOpenFirstModal, setIsOpenFirstModal] = useState(false)
  useEffect(() => {
    if (currentlyCreatedlendingId != null) {
      const timer = setTimeout(() => setIsOpenFirstModal(true), 300)
      return () => clearTimeout(timer)
    }
  }, [])

  const [isOpenReturnConfirmDialog, setIsOpenReturnConfirmDialog] = useState(
    false,
  )

  const handleReturn = async (lendingId: string) => {
    await postHaveReturned(lendingId)

    setSelectedLendingId(null)

    setIsOpenReturnConfirmDialog(true)
  }

  const closeReturnConfirmDialog = () => {
    setIsOpenReturnConfirmDialog(false)
    if (router.query.mode === 'return') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { mode: _, modal: __, ...restQuery } = router.query
      router.push(
        { pathname: '/lending', query: { ...restQuery, filter: 'all' } },
        undefined,
        { shallow: true },
      )
    }
  }

  const list = [...(borrowingList ?? []), ...(lendingList ?? [])]
    .filter(
      (item): item is ConcludedLendingInfo | BorrowingInfo =>
        (item.kind === 'lending' && item.status === 'concluded') ||
        item.kind === 'borrowing',
    )
    .sort((a, b) =>
      a.deadline > b.deadline ? 1 : a.deadline < b.deadline ? -1 : 0,
    )

  const filteredList = list.filter(
    (item) => filter === 'all' || filter === item.kind,
  )

  const borderDeadlineLendingIndex =
    filteredList.findIndex((lendingInfo) =>
      isAfter(lendingInfo.deadline, new Date()),
    ) ?? null
  const borderDeadlineLendingId =
    borderDeadlineLendingIndex === 0
      ? null
      : filteredList[borderDeadlineLendingIndex]?.lendingId

  const alertBorderDeadlineLendingIndex =
    filteredList.findIndex((lendingInfo) =>
      isAfter(lendingInfo.deadline, add(new Date(), { days: DEADLINE_BORDER })),
    ) ?? null

  const alertBorderDeadlineLendingId =
    alertBorderDeadlineLendingIndex === 0 ||
    alertBorderDeadlineLendingIndex === borderDeadlineLendingIndex
      ? null
      : filteredList[alertBorderDeadlineLendingIndex]?.lendingId

  const [selectedLendingId, setSelectedLendingId] = useState<string | null>(
    () => (router.query?.modal as string) ?? null,
  )

  // モーダルの開閉が起こったときにURLを追従させる
  useEffect(() => {
    if (selectedLendingId == null) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { modal: _, ...restQuery } = router.query
      router.push({ pathname: '/lending', query: restQuery }, undefined, {
        shallow: true,
      })
    } else if (
      filteredList.find(
        (lendingInfo) => lendingInfo.lendingId === selectedLendingId,
      )
    ) {
      router.push(
        {
          pathname: '/lending',
          query: { ...router.query, modal: selectedLendingId },
        },
        undefined,
        { shallow: true },
      )
    } else if (
      list.find((lendingInfo) => lendingInfo.lendingId === selectedLendingId)
    ) {
      router.push(
        {
          pathname: '/lending',
          query: { ...router.query, filter: null, modal: selectedLendingId },
        },
        undefined,
        { shallow: true },
      )
    }
  }, [selectedLendingId])

  // リストが変更された場合にURLを追従させる
  useEffect(() => {
    if (
      !list.find((lendingInfo) => lendingInfo.lendingId === selectedLendingId)
    ) {
      router.push(
        {
          pathname: '/lending',
          query: { ...router.query, filter },
        },
        undefined,
        { shallow: true },
      )
    }
  }, [lendingList, borrowingList])

  // URLが変更された場合にモーダルを追従させる
  useEffect(() => {
    const selectedLendingId = router.query.modal
    if (
      selectedLendingId != null &&
      filteredList.find(
        (lendingInfo) => lendingInfo.lendingId === selectedLendingId,
      )
    ) {
      setSelectedLendingId(selectedLendingId as string)
    } else {
      setSelectedLendingId(null)
    }
  }, [router.query.modal])

  return (
    <>
      <Meta title="かしかり記録" />
      <article className="pt-4 pb-36">
        {!isReturnMode ? (
          <nav className="flex justify-center items-center flex-wrap py-2 sticky top-0 z-30 bg-gray-100">
            <Chip
              className="mx-2 mt-1 flex items-center"
              selected={filter === 'all'}
              onClick={() =>
                router.push('/lending?filter=all', '/lending?filter=all', {
                  shallow: true,
                })
              }
            >
              貸し借り
            </Chip>
            <Chip
              className="mx-2 mt-1 flex items-center"
              selected={filter === 'lending'}
              onClick={() =>
                router.push(
                  '/lending?filter=lending',
                  '/lending?filter=lending',
                  { shallow: true },
                )
              }
            >
              <Icon type="uparrow" className="mr-1" /> 貸し
            </Chip>
            <Chip
              className="mx-2 mt-1 flex items-center"
              selected={filter === 'borrowing'}
              onClick={() =>
                router.push(
                  '/lending?filter=borrowing',
                  '/lending?filter=borrowing',
                  { shallow: true },
                )
              }
            >
              <Icon type="downarrow" className="mr-1" /> 借り
            </Chip>
          </nav>
        ) : (
          <button
            className="flex justify-between items-center flex-wrap px-8 py-2 sticky top-0 z-30 bg-gray-100 w-full"
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { mode: _, ...restQuery } = router.query
              router.push(
                {
                  pathname: '/lending',
                  query: { ...restQuery, filter: 'all' },
                },
                undefined,
                { shallow: true },
              )
            }}
          >
            <h1 className="underline">返却されたものを選んでね</h1>
            <Icon type="close" className="text-xl" />
          </button>
        )}
        {filteredList.map((lendingInfo) => (
          <Fragment key={lendingInfo.lendingId}>
            {lendingInfo.lendingId === borderDeadlineLendingId && (
              <HrWithMessage color="red" className="mt-3 mb-4">
                ▲ 返却期限が過ぎています
              </HrWithMessage>
            )}
            {lendingInfo.lendingId === alertBorderDeadlineLendingId && (
              <HrWithMessage color="black" className="mt-3 mb-4">
                ▲ 返却期限が近づいています
              </HrWithMessage>
            )}
            <LendingItemBox
              key={lendingInfo.lendingId}
              item={lendingInfo}
              onClick={() => {
                setSelectedLendingId(lendingInfo.lendingId)
                console.log('click')
              }}
            />
            {lendingInfo.kind === 'lending' ? (
              <Modal
                isOpen={selectedLendingId === lendingInfo.lendingId}
                positiveLabel="返却された"
                negativeLabel="まだ"
                onClickConfirm={() => handleReturn(lendingInfo.lendingId)}
                onClose={() => setSelectedLendingId(null)}
                shouldCloseOnOverlayClick={false}
              >
                <p>
                  {lendingInfo.borrowerName} さんに貸していた{' '}
                  <span className="inline-block underline ">
                    「{lendingInfo.content}」
                  </span>
                  は返却されたちゅんか？
                </p>
              </Modal>
            ) : (
              <Modal
                isOpen={selectedLendingId === lendingInfo.lendingId}
                positiveLabel="わかった"
                onClickConfirm={() => setSelectedLendingId(null)}
                onClose={() => setSelectedLendingId(null)}
              >
                <p className="text-center">
                  {lendingInfo.ownerName}さんから{' '}
                  <span className="inline-block underline ">
                    「{lendingInfo.content}」
                  </span>
                  を借りてるチュン。
                  <br />
                  {isBefore(new Date(), lendingInfo.deadline) ? (
                    <>
                      <span className="inline-block underline ">
                        {formatDate(
                          lendingInfo.deadline,
                          'yyyy年M月d日（ccc）',
                        )}
                      </span>
                      までに返すチュン。
                    </>
                  ) : (
                    <>
                      返却期限
                      <span className="inline-block underline mx-1">
                        {formatDate(lendingInfo.deadline)}
                      </span>
                      が過ぎてるチュン。早く返すチュン。
                    </>
                  )}
                </p>
              </Modal>
            )}
          </Fragment>
        ))}
      </article>
      <BottomBar type="lending" />
      <Modal
        isOpen={isOpenFirstModal}
        positiveLabel="わかった"
        onClickConfirm={() => setIsOpenFirstModal(false)}
        onClose={() => setIsOpenFirstModal(false)}
        shouldCloseOnOverlayClick={false}
      >
        <p>
          {'マンガ'}
          の貸し借りを登録したちゅん！この画面から返却期限を確認できるちゅん
        </p>
      </Modal>
      <Modal
        isOpen={isOpenReturnConfirmDialog}
        positiveLabel="OK"
        onClickConfirm={closeReturnConfirmDialog}
        onClose={closeReturnConfirmDialog}
        shouldCloseOnOverlayClick={false}
      >
        <p className="text-center">
          返却できたチュン！今後もスズメをよろしくチュン！
        </p>
      </Modal>
    </>
  )
}

export default LendingListPage

type Query = {
  lendingId?: string
  first?: string
}

export const getServerSideProps: GetServerSideProps<Props, Query> = async ({
  query,
}) => {
  return {
    props: {
      currentlyCreatedlendingId: query?.lendingId?.toString() ?? null,
      isFirstVisit: query?.first === 'true',
    },
  }
}

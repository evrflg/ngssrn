export const TASK_DICT_MAP: Record<number, Record<number, string>> = {
    0: {
        0: 'DOWNLOAD_APP',
        1: 'REGISTER_ACCOUNT',
        2: 'BIND_PHONE',
        3: 'BIND_EMAIL',
        4: 'SET_NAME',
        5: 'SET_BIRTHDAY',
        6: 'FIST_BIND_BANK_CARD',
        7: 'FIRST_DEPOSIT',
        8: 'FIRST_WITHDRAW',
    },
    1: {
        0: 'CUMULATIVE_DEPOSIT',
        1: 'SINGLE_DEPOSIT',
        2: 'CUMULATIVE_VALID_BET',
        3: 'SINGLE_VALID_BET',
        4: 'SINGLE_PROFIT',
        5: 'SINGLE_LOSS',
        6: 'CUMULATIVE_PROFIT',
        7: 'CUMULATIVE_LOSS',
        8: 'INVITE_FRIENDS',
    },
    2: {
        0: 'CUMULATIVE_DEPOSIT',
        1: 'SINGLE_DEPOSIT',
        2: 'CUMULATIVE_VALID_BET',
        3: 'SINGLE_VALID_BET',
        4: 'SINGLE_PROFIT',
        5: 'SINGLE_LOSS',
        6: 'CUMULATIVE_PROFIT',
        7: 'CUMULATIVE_LOSS',
        8: 'INVITE_FRIENDS',
    },
} as const

// Tasks that should show "Go and Complete" button
export const TASKS_TO_GO = new Set([
  'DOWNLOAD_APP',
  'BIND_PHONE',
  'BIND_EMAIL',
  'SET_NAME',
  'SET_BIRTHDAY',
  'FIST_BIND_BANK_CARD',
  'FIRST_DEPOSIT',
  'FIRST_WITHDRAW',
  'INVITE_FRIENDS',
])
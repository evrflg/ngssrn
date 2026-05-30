import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WinningInfo {
  username: string;
  amount: string | number;
  gameId: number;
  customName?: string;
  gameName: string;
  gameType: number;
  icon?: string;
}

interface BigWinningState {
  visible: boolean;
  info: WinningInfo | null;
}

const initialState: BigWinningState = {
  visible: false,
  info: null,
};

const bigWinningSlice = createSlice({
  name: "bigWinning",
  initialState,
  reducers: {
    showBigWinning: (state, action: PayloadAction<WinningInfo>) => {
      state.info = action.payload;
      state.visible = true;
    },
    hideBigWinning: (state) => {
      state.visible = false;
      state.info = null;
    },
  },
});

export const { showBigWinning, hideBigWinning } = bigWinningSlice.actions;
export default bigWinningSlice.reducer;

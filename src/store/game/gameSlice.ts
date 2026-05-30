// src/store/features/counterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
    gameWebViewData: Object,
    isShowGameModel:boolean,
    isNeedAutoExchange: boolean, // 是否需要自动转出
    gameList?:Array<any>,
    currentTabId:number,//当前tab索引
    gameZoneDict:Array<any>,
    topAreaHeight?:number,//顶部区域高度
    gameAreaHeight?:Object,//游戏区域高度
    gameAreaOffsetMap?:Object,//游戏区域相对 GameArea 容器的偏移
    gameAreaBaseOffset?:number,//GameArea 容器在列表中的偏移
    isShowGameTipPopup:boolean,//是否展示游戏提示弹窗
    gameTipPopupData:Object,//游戏提示弹窗数据
}

const initialState: GameState = {
    gameWebViewData: {},
    isShowGameModel:false,//是否展示游戏弹窗
    isNeedAutoExchange: false, // 是否需要自动转出
    gameList:[],
    currentTabId:0,
    gameZoneDict:[],
    topAreaHeight:0,
    gameAreaHeight:{},
    gameAreaOffsetMap:{},
    gameAreaBaseOffset:0,   
    isShowGameTipPopup:false,
    gameTipPopupData:{},
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    updateGameWebViewData: (state, action: PayloadAction<Object>) => {
        state.gameWebViewData = action.payload;
    },
    changeIsShowGameModel:(state,action: PayloadAction<boolean>)=>{
        state.isShowGameModel = action.payload
    },
    changeIsNeedAutoExchange:(state,action: PayloadAction<boolean>)=>{
        state.isNeedAutoExchange = action.payload
    },
    changeGameList:(state,action: PayloadAction<Array<any>>)=>{
        state.gameList = action.payload
    },
    changeCurrentTabId:(state,action: PayloadAction<number>)=>{
        state.currentTabId = action.payload
    },
    changeGameZoneDict:(state,action: PayloadAction<Array<any>>)=>{
        state.gameZoneDict = action.payload
    },
    changeTopAreaHeight:(state,action: PayloadAction<number>)=>{
        state.topAreaHeight = action.payload
    },
    changeGameAreaHeight:(state,action: PayloadAction<Object>)=>{
        state.gameAreaHeight = action.payload
    },
    changeGameAreaOffsetMap:(state,action: PayloadAction<Object>)=>{
        state.gameAreaOffsetMap = action.payload
    },
    changeGameAreaBaseOffset:(state,action: PayloadAction<number>)=>{
        state.gameAreaBaseOffset = action.payload
    },
    changeIsShowGameTipPopup:(state,action: PayloadAction<boolean>)=>{
        state.isShowGameTipPopup = action.payload
    },
    changeGameTipPopupData:(state,action: PayloadAction<Object>)=>{
        state.gameTipPopupData = action.payload
    }
  },
});

export const { 
     updateGameWebViewData,
     changeIsShowGameModel,
     changeIsNeedAutoExchange,
     changeGameList,
     changeCurrentTabId,
     changeGameZoneDict,
     changeTopAreaHeight,
     changeGameAreaHeight,
     changeGameAreaOffsetMap,
     changeGameAreaBaseOffset,
     changeIsShowGameTipPopup,
     changeGameTipPopupData
     } = gameSlice.actions;
export default gameSlice.reducer;
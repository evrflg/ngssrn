// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counterSlice';
import userReducer from './user/userSlice'
import selfConfigReducer from './user/selfConfig'
import activeReducer from './active/activeSlice';
import gameReducer from './game/gameSlice';
import tenantReducer from './tenant/tenantSlice';
import bigWinningReducer from './bigWinning/bigWinningSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    selfConfig: selfConfigReducer,
    active: activeReducer,
    game: gameReducer,
    tenant: tenantReducer,
    bigWinning: bigWinningReducer,
    // 添加更多 reducer 这里
  },
  // 启用 Redux DevTools（Expo 需要安装配套应用）
  devTools: process.env.NODE_ENV !== 'production',
});

// 导出类型用于 TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
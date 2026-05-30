import { router, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
export default function NotFoundScreen() {
  const navState = useRootNavigationState();
  useEffect(()=>{
    if (!navState?.key) return; // 等待导航系统准备好
    router.replace('/home');
  },[navState])
  return null
}


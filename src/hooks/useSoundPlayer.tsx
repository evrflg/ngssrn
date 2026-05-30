import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { getStorage, setStorage } from "@/utils/storage";

export interface MusicPlayerProps {
  soundFile: any; //音頻文件
  onPlayingChange?: (isPlaying: boolean) => void; // 播放狀態改變時的回調
}

export const useMusicPlayer = ({
  soundFile,
  onPlayingChange,
}: MusicPlayerProps) => {
  const [sound, setSound] = useState<Audio.Sound>(); // 音頻對象
  const [isPlaying, setIsPlaying] = useState(false); // 播放狀態

  useEffect(() => {
    const startPlaying = async () => {
      try {
        let canPlay = false;
        const musicPlayerState = await getStorage("musicPlayerState");
        if (musicPlayerState) {
          setIsPlaying(musicPlayerState === "true");
          canPlay = musicPlayerState === "true";
        } else {
          canPlay = true;
        }
        if (canPlay) {
          const newSound = await loadSound();
          if (newSound) {
            setSound(newSound);
          }
        }
      } catch (error) {
        console.error("Failed to start playing:", error);
      }
    };
    startPlaying();
  }, []);

  // 组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      // 只在组件真正卸载时清理，避免热重载时误触发
      if (sound) {
        unloadMusic()
      }
    };
  }, []);

  // 加載音頻對象
  const loadSound = async (): Promise<Audio.Sound | undefined> => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(soundFile, {
        shouldPlay: false,
        isLooping: false,
      });
      setSound(newSound);
      return newSound;
    } catch (error) {
      console.error("Failed to load sound", error);
      return undefined;
    }
  };
  // 切換播放狀態
  const togglePlay = async () => {
    try {
      let currentSound = sound;
      // 如果音頻對象不存在，則加載音頻對象
      if (!currentSound) {
        currentSound = await loadSound();
        if (!currentSound) return;
      }
      // 切換播放狀態
      const newIsPlaying = !isPlaying;
      setIsPlaying(newIsPlaying);
      // 保存播放狀態
      setStorage("musicPlayerState", String(newIsPlaying));

      if (newIsPlaying) {
        // 重置音频到开始位置
        await currentSound.setPositionAsync(0);
        await currentSound.playAsync();
      } else {
        await currentSound.stopAsync();
      }

      onPlayingChange?.(newIsPlaying);
    } catch (error) {
      console.error("Error toggling play state", error);
    }
  };
  //开始播放
  const openMusic = async () => {
    try {
      let currentSound = sound;

      // 如果音頻對象不存在，則加載音頻對象
      if (!currentSound) {
        currentSound = await loadSound();
        if (!currentSound) return;
      }

      // 重置音频到开始位置
      await currentSound.setPositionAsync(0);
      await currentSound.playAsync();

      if (!isPlaying) {
        setIsPlaying(true);
        onPlayingChange?.(true);
      }
    } catch (error) {
      console.error("Error open music", error);
    }
  };
  // 静音
  const closeMusic = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        if (isPlaying) {
          setIsPlaying(false);
          onPlayingChange?.(false);
        }
      }
    } catch (error) {
      console.error("Error close music", error);
    }
  };
  // 完全卸载音效
  const unloadMusic = async () => {
    try {
      if (sound) {
        await sound?.stopAsync();
        await sound?.unloadAsync();
        setIsPlaying(false);
        onPlayingChange?.(false);
        setSound(undefined);
      }
    } catch (error) {
      console.error("Error unloading music", error);
    }
  };

  return {
    isPlaying, // 播放狀態
    togglePlay, // 切換播放狀態
    sound, // 音頻對象
    openMusic,
    closeMusic,
    unloadMusic   // 完全卸载
  };
};

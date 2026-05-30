//透明导航栏
import React from 'react';
import { View, Text, Platform, Pressable } from 'react-native';
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useRouter } from "expo-router";
import { Colors } from '@/constants/Colors';
import { Icon } from '@rneui/themed';

interface TransparentHeaderProps {
    title?: string;
    rightOption?: React.ReactNode;
    opacity?: number;
}

// 工具函数：将颜色值转换为带透明度的版本
const addOpacityToColor = (color: string, opacity: number): string => {
    // 如果是 rgba 格式，直接修改 alpha 值
    if (color.startsWith('rgba(')) {
        const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (rgbaMatch) {
            const [, r, g, b] = rgbaMatch;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
    }
    
    // 如果是 rgb 格式，转换为 rgba
    if (color.startsWith('rgb(')) {
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const [, r, g, b] = rgbMatch;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
    }
    
    // 如果是十六进制格式，转换为 rgba (#fff, #ffff, #ffffff, #ffffffff)
    if (color.startsWith("#")) {
        let hex = color.slice(1);

        // #fff → #ffffff 
        if (hex.length === 3) {
            hex = hex.split("").map(ch => ch + ch).join("");
        }

        // #ffff → #ffffffff (RGB + Alpha)
        if (hex.length === 4) {
            hex = hex.split("").map(ch => ch + ch).join("");
        }

        // Extract RGB
        if (hex.length === 6 || hex.length === 8) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
    }
    
    // 默认返回原色
    return color;
};

const TransparentHeader = (props: TransparentHeaderProps) => {
    const router = useRouter();
    const { theme } = useTheme();
    const isWeb = Platform.OS === "web";
    const opacity = props.opacity || 0;
    const cardBg1 = Colors[theme].cardBg1;
    const backgroundColorWithOpacity = addOpacityToColor(cardBg1, opacity);

    return (
        <View 
            className={`flex w-full h-[48] absolute left-0 z-[9] justify-center items-center 
            ${isWeb ? 'top-[0]' : 'top-[0]'}`}
            style={{
                backgroundColor: backgroundColorWithOpacity,
            }}
        >
            <View className="absolute w-full h-[52] top-0 left-0 py-0.5 px-2.5 flex-row justify-between items-center">
                <Pressable style={{ width: 44, height: 36, 
                    flexDirection: "row", alignItems: "center", justifyContent: "flex-start", paddingLeft: 2, }} onPress={() => router.back()}>
                    <Icon name='chevron-left' type='feather'
                        color={Colors[theme].text} size={18}
                    />
                </Pressable>
                
                <View className='self-auto'>{props?.rightOption}</View>
            </View>
            <View className="items-center">
                <Text className="text-base font-semibold"
                    style={{ color: Colors[theme].text }}>{props?.title}</Text>
            </View>
        </View>
    );
}

export default TransparentHeader;
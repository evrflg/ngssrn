import { View } from "react-native";
import React, { useState } from "react";
import PopWindow from "@/components/record/PopWindow";
import DropdownButton from "@/components/record/DropdownButton";

export interface StatusOptions {
  title: string;
  value: number | string;
}

export const DropdownStatus = ({
  options,
  className,
  style,
  success,
}: {
  options: StatusOptions[];
  className: any;
  style?: any;
  success: (option: StatusOptions) => void;
}) => {
  const [isPopWindowVisible, setIsPopWindowVisible] = useState(false);
  const [optionsIndex, setOptionsIndex] = useState(0);
  const [currentOptions, setCurrentOptions] = useState<any>({
    title: options[0]?.title,
    value: options[0]?.value,
  });

  return (
    <View className={"h-10 " + className}>
      <DropdownButton
        className="flex-1"
        text={currentOptions.title}
        onPress={() => setIsPopWindowVisible(true)}
        style={style}
      />
      <PopWindow
        isVisible={isPopWindowVisible}
        setIsVisible={setIsPopWindowVisible}
        data={options}
        hideHeader={true}
        onItemPress={(index) => {
          setCurrentOptions(options[index]);
          setOptionsIndex(index);
          success(options[index]);
        }}
        selectedIndex={optionsIndex}
        setSelectedIndex={setOptionsIndex}
      />
    </View>
  );
};

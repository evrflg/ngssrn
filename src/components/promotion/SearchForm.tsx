import { FC } from 'react'
import { Icon } from '@rneui/themed'
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { View, TextInput, TouchableOpacity } from 'react-native'
import DateRangePicker from "@/components/common/DateRangePicker"

interface Props {
  username: string;
  setUsername: (username: string) => void;
  onSearch: () => void
  onConfirmTime: (times: [string, string]) => void;
}

const SearchForm: FC<Props> = ({ username, setUsername, onSearch, onConfirmTime }) => {
  const { theme, themeColors: { primary } } = useTheme();

  return (
    <View className='flex-row gap-2 mb-3'>
      <View className={`h-10 flex-1 rounded-lg px-2 bg-${theme}-btnText flex-row items-center shadow shadow-black/10 shadow-offset-[1px/1px] shadow-radius-[2px] elevation-[4]`}>
        <TextInput
          value={username}
          placeholder={'UID'}
          selectionColor="red"
          placeholderTextColor="#acafc2"
          underlineColorAndroid="transparent"
          className={`h-10 flex-grow text-${theme}-text text-xs border-none bg-transparent outline-none`}
          onChangeText={setUsername}
        />
        <TouchableOpacity onPress={onSearch} className='absolute' style={{right: 8}}>
          <Icon
            color={primary}
            size={20}
            name='search'
            type='feather'
          />
        </TouchableOpacity>
      </View>
      <DateRangePicker onConfirm={onConfirmTime} style={{ flex: 1 }} showLabel />
    </View>
  )
}

export default SearchForm

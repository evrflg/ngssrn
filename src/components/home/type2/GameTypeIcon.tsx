import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Type1,Type2,Type3,Type4,Type6,Type7,Type8,Type21,Type22,Type23,Type24,Type25,Type26, Type98, Type99} from "@/components/icons/home/gameTypes";
export const GameTypeIcon = ({type,currentId}:any)=>{
    const { theme } = useTheme()//主题
    if(type==1){
        return<Type1 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==2){
        return<Type2 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==3){
        return<Type3 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==4){
        return<Type4 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==6){
        return<Type6 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==7){
        return<Type7 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==8){
        return<Type8 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==21){
        return<Type21 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==22){
        return<Type22 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==23){
        return<Type23 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==24){
        return<Type24 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==25){
        return<Type25 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==26){
        return<Type26 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==98){
        return<Type98 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }if(type==99){
        return<Type99 fill={type==currentId?Colors[theme].primary:Colors[theme].lightText}/>
    }
    
}
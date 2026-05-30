import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { TypeContent1 } from "./type1/Content1";
import { TypeContent2 } from "./type2/Content2";
import { TypeContent3 } from "./type3/Content3";


export const TypeContent = () => {
  // 宣传弹窗类型
  const publicityModalType = useSelector(
    (state: RootState) => state?.selfConfig?.publicity,
  );

  switch (publicityModalType) {
    case 1:
      return <TypeContent1 />;
    case 2:
      return <TypeContent2 />;
    case 3:
      return <TypeContent3 />;
    // default:
    //   return <TypeContent1 />;
  }
};

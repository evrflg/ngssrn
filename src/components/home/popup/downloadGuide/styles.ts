import { rf } from "@/utils/scaleFont";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  downloadButton: {
    position: "fixed",
    bottom: 160,
    borderWidth: 2,
    borderRadius: 8,
    width: 50,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  popup: {
    margin: 0,
    justifyContent: "flex-end",
    minHeight: 100,
  },
  content: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    // padding: 16,
    paddingBottom: 0,
  },
  contentGradientWrapper: {
    position: "relative",
  },
  contentGoldGradient: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    transform: [{ translateY: -0.5 }],
  },
  bannerImage: { width: 141, height: 147, position: "absolute", top: -90 },
  closeBtn: {
    borderRadius: 5,
    padding: 4,
  },
  apkIconImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  guideTitle: {
    fontSize: rf(16),
    fontWeight: 500,
    fontFamily: "PingFang SC",
    marginBottom: 8,
  },
  apkLink: {
    fontSize: rf(14),
    fontWeight: 500,
  },
  clickBtn: {
    borderRadius: 20,
    paddingVertical: 10,
  },
  clickBtnWrapper: {
    position: "relative",
  },
  clickBtnGoldGradient: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ translateY: 1 }],
  },
  clickBtnText: {
    fontSize: rf(14),
    fontWeight: 600,
    fontFamily: "PingFang SC",
  },
  hint: {
    fontSize: rf(13),
    fontWeight: 400,
    fontFamily: "PingFang SC",
  },
  helperTitle: {
    fontSize: rf(14),
    fontWeight: 500,
    marginBottom: 4,
    fontFamily: "PingFang SC",
  },
  checkBoxContainer: {
    margin: 0,
    padding: 0,
    backgroundColor: "transparent",
  },
  checkBoxWrapper: {
    margin: 0,
    padding: 0,
  },
  checkBoxText: {
    fontSize: rf(16),
    fontWeight: "normal",
    marginLeft: 8,
  },
  checkBoxRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkBoxLabelWrapper: {
    flex: 1,
    minWidth: 0,
    marginLeft: 4,
  },
  checkBoxLabel: {
    width: "100%",
    flexShrink: 1,
    flexWrap: "wrap",
    fontSize: rf(12),
    lineHeight: 18,
  },
  boxView: {
    width: "100%",
    borderRadius: 10,
    borderTopWidth: 1,
    // borderRightWidth: 0.5,
    padding: 0,
  },
  popupTitle: {
    fontSize: rf(16),
    fontWeight: "500",
    fontFamily: "PingFang SC",
    textAlign: "center",
    marginVertical: 16,
  },
  infoWrapper: {
    width: "100%",
    paddingVertical: 6,
  },
  infoWrapperContent: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  customerServiceContainer: {
    marginTop: 16,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  customerServiceButton: {
    minWidth: 146,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    paddingLeft: 22,
    paddingRight: 6,
  },
  customerServiceIcon: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 34,
    height: 34,
  },
  customerServiceText: {
    fontSize: rf(14),
    fontWeight: "600",
    fontFamily: "PingFang SC",
    zIndex: 1,
  },
});

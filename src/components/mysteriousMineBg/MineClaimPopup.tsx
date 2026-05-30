import { PopupModal } from "@/components/home/popup/common/PopupModal";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CLAIM_BG_IMAGE = require("@/assets/images/active/mysteriousMine/claimPopBg.png");

interface MineClaimPopupProps {
  isVisible: boolean;
  onClose: () => void;
  claimPopupWidth: number;
  claimPopupHeight: number;
  claimAmount: string;
  claimPrefixText: string;
  claimSuffixText: string;
  confirmText: string;
  themePrimaryColor: string;
}

export function MineClaimPopup({
  isVisible,
  onClose,
  claimPopupWidth,
  claimPopupHeight,
  claimAmount,
  claimPrefixText,
  claimSuffixText,
  confirmText,
  themePrimaryColor,
}: MineClaimPopupProps) {
  return (
    <PopupModal
      id="mysterious-mine-claim-popup"
      isVisible={isVisible}
      onClose={onClose}
      backdropOpacity={0.7}
      useNativeDriver={false}
      style={styles.modal}
    >
      <View style={[styles.claimPopupWrap, { width: claimPopupWidth }]}>
        <View style={[styles.claimPopupBg, { height: claimPopupHeight }]}>
          <Image source={CLAIM_BG_IMAGE} style={styles.claimPopupImage} resizeMode="stretch" />
          <View style={styles.claimPopupContent}>
            <Text style={styles.claimText}>
              {claimPrefixText}
              <Text style={styles.claimAmountText}>{claimAmount}</Text>
              {claimSuffixText}
            </Text>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: themePrimaryColor }]}
              onPress={onClose}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  claimPopupWrap: {
    width: "100%",
    alignSelf: "center",
  },
  claimPopupBg: {
    width: "100%",
    position: "relative",
  },
  claimPopupImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  claimPopupContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 26,
  },
  claimText: {
    color: "#FFFFFF",
    fontSize: 26,
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 20,
    fontWeight: "500",
  },
  claimAmountText: {
    color: "#FF3B30",
  },
  confirmBtn: {
    width: 180,
    height: 42,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});

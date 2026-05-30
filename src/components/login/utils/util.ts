import Crypto from 'crypto-js';
import { AuthMethodSwtichMode } from '../AuthMethodSwitch';
export const checkParmas = (param: any, toast: any, t: any, type = AuthMethodSwtichMode.username) => {
  if (type === AuthMethodSwtichMode.username) {
    if (!validateUsername(param?.username, toast, t)) {
      return false
    }
  } else if (type === AuthMethodSwtichMode.phone) {
    return validatePhoneNumber(param?.phone, toast, t)
  }
  if (!validatePassword(param?.password, toast, t)) {
    return false
  }
  return true
}

export const checkRegisterParmas = (param: any, toast: any, t: any, type = AuthMethodSwtichMode.username) => {
  if (type === AuthMethodSwtichMode.username) {
    if (!validateUsername(param?.username, toast, t)) {
      return false
    }

  } else if (type === AuthMethodSwtichMode.phone) {
    if (!validatePhoneNumber(param?.phone, toast, t)) {
      return false
    }
  }
  if (!validatePassword(param?.password, toast, t)) {
    return false
  }
  if (param.password != param.rpwd) {
    toast.error(t('forgotPwd.passwordNotSame'))
    return false
  }

  return true

}

const validateUsername = (username: string, toast: any, t: any) => {
  if (username == null || username == undefined || username == '') {
    toast.error(t('login.pleaseInputUsername'))
    return false
  }
  console.log('username', username)
  if (!username || username?.length < 5 || username?.length > 20) {
    toast.error(t('login.accountRemaining'))
    return false
  }
  return true
}

const validatePhoneNumber = (phone: string, toast: any, t: any) => {
  if (phone == null || phone == undefined || phone == '' || phone?.length < 4) {
    toast.error(t('login.pleaseInputPhone'))
    return false
  }
  if (!validatePhone(phone)) {
    toast.error(t('bindInfo.phoneValidation'))
  }
  return true
}

export const validatePassword = (password: string, toast: any, t: any) => {
  if (!password || password?.length < 5 || password?.length > 20) {
    toast.error(t('login.passwordRemaining'))
    return false
  }
  // Check if password contains both letters and numbers, and no special characters
  const hasLetters = /[a-zA-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSpecialChars = /[^a-zA-Z0-9]/.test(password)
  if (!hasLetters || !hasNumbers) {
    toast.error(t('forgotPwd.passwordMustContainLettersAndNumbers'))
    return false;
  }
  if (hasSpecialChars) {
    toast.error(t('forgotPwd.passwordNoSpecialChars'))
    return false;
  }
  return true
}

//解密
export const reconvert = (str: any) => {
  str = str.replace(/(\\u)(\w{1,4})/gi, function ($0: any) {
    return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2")), 16)));
  });
  str = str.replace(/(&#x)(\w{1,4});/gi, function ($0: any) {
    return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
  });
  str = str.replace(/(&#)(\d{1,6});/gi, function ($0: any) {
    return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2")));
  });
  return str;
}
//加密
export const unicode = (str: any) => {
  var value = '';
  for (var i = 0; i < str.length; i++) {
    value += '\\u' + left_zero_4(parseInt(str.charCodeAt(i)).toString(16));
  }
  return value;
}

const left_zero_4 = (str: string) => {
  if (str != null && str != '' && str != 'undefined') {
    if (str.length == 2) {
      return '00' + str;
    }
  }
  return str;
}


const AES_KEY = 'deWJ$ps7f@HpY%MN'; // 秘钥
const AES_IV = 'GB%#cfxje7JzP*#A'; // 初始化向量
export const toDecrypt = (encryptedData: any) => {
  const ciphertext = Crypto.enc.Hex.parse(encryptedData)
  const decryptedBytes = Crypto.AES.decrypt({ ciphertext }, Crypto.enc.Utf8.parse(AES_KEY), {
    iv: Crypto.enc.Utf8.parse(AES_IV),
    mode: Crypto.mode.CBC,
    padding: Crypto.pad.Pkcs7
  });
  const decryptedText = decryptedBytes.toString(Crypto.enc.Utf8); // <--- Must use .toString with Utf8 encoding
  return decryptedText; // 返回解密后的文本
}

export function aesEncrypt(word: any, keyWord = 'XwKsGlMcdPMEhR1B') {
  const key = Crypto.enc.Utf8.parse(keyWord)
  const srcs = Crypto.enc.Utf8.parse(word)
  const encrypted = Crypto.AES.encrypt(srcs, key, {
    mode: Crypto.mode.ECB,
    padding: Crypto.pad.Pkcs7
  })
  return encrypted.toString()
}

// Phone validation
export const validatePhone = (phone: string) => {
  // International format: + followed by 4-17 digits (first digit 1-9, then 3-16 more digits)
  // Matches zh-CN: "4~17位国际号码" (4-17 digit international number)
  const internationalPattern = /^\+[1-9]\d{3,16}$/
  return internationalPattern.test(phone)
}